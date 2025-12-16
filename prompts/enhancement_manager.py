"""
增强提示词管理器
负责加载、合并和管理增强提示词
"""

import json
import os
import re
import yaml
from typing import Dict, List, Optional, Tuple
from datetime import datetime
from pathlib import Path
import logging

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnhancementManager:
    """增强提示词管理器"""

    def __init__(self, prompts_dir: str = "prompts"):
        self.prompts_dir = Path(prompts_dir)
        self.config_path = self.prompts_dir / "config.json"
        self.config = {}
        self.base_prompts = {}
        self.enhancements = {}
        self._load_config()
        self._load_base_prompts()
        self._load_enhancements()

    def _load_config(self) -> None:
        """加载配置文件"""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                self.config = json.load(f)
            logger.info("配置文件加载成功")
        except Exception as e:
            logger.error(f"配置文件加载失败: {e}")
            self.config = self._get_default_config()

    def _load_base_prompts(self) -> None:
        """加载基础提示词"""
        base_dir = self.prompts_dir / "base"
        for prompt_name, prompt_info in self.config.get("base_prompts", {}).items():
            try:
                file_path = base_dir / Path(prompt_info["file_path"]).name
                with open(file_path, 'r', encoding='utf-8') as f:
                    self.base_prompts[prompt_name] = f.read()
                logger.info(f"基础提示词 {prompt_name} 加载成功")
            except Exception as e:
                logger.error(f"基础提示词 {prompt_name} 加载失败: {e}")

    def _load_enhancements(self) -> None:
        """加载增强提示词"""
        enhancements_dir = self.prompts_dir / "enhancements"
        for enhancement_name, enhancement_info in self.config.get("enhancements", {}).items():
            if not enhancement_info.get("enabled", False):
                continue

            try:
                file_path = enhancements_dir / Path(enhancement_info["file_path"]).name
                enhancement_data = self._parse_enhancement_file(file_path)
                if enhancement_data:
                    self.enhancements[enhancement_name] = enhancement_data
                    logger.info(f"增强提示词 {enhancement_name} 加载成功")
            except Exception as e:
                logger.error(f"增强提示词 {enhancement_name} 加载失败: {e}")
                self._record_enhancement_error(enhancement_name)

    def _parse_enhancement_file(self, file_path: Path) -> Optional[Dict]:
        """解析增强提示词文件"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # 解析YAML前置内容
            if content.startswith('---'):
                parts = content.split('---', 2)
                if len(parts) >= 3:
                    frontmatter = yaml.safe_load(parts[1])
                    enhancement_content = parts[2].strip()

                    return {
                        'metadata': frontmatter,
                        'content': enhancement_content,
                        'file_path': str(file_path),
                        'parsed_at': datetime.now().isoformat()
                    }

            # 如果没有前置内容，返回基本结构
            return {
                'metadata': {},
                'content': content.strip(),
                'file_path': str(file_path),
                'parsed_at': datetime.now().isoformat()
            }

        except Exception as e:
            logger.error(f"解析增强文件 {file_path} 失败: {e}")
            return None

    def get_merged_prompt(self,
                         base_prompt_name: str,
                         user_input: str,
                         allowed_enhancements: List[str] = None,
                         disabled_enhancements: List[str] = None) -> Tuple[str, List[str]]:
        """
        获取合并后的提示词

        Args:
            base_prompt_name: 基础提示词名称
            user_input: 用户输入
            allowed_enhancements: 允许的增强列表
            disabled_enhancements: 禁用的增强列表

        Returns:
            Tuple[合并后的提示词, 使用的增强列表]
        """
        # 获取基础提示词
        base_prompt = self.base_prompts.get(base_prompt_name)
        if not base_prompt:
            logger.error(f"基础提示词 {base_prompt_name} 不存在")
            return "", []

        # 检测适用的增强
        applicable_enhancements = self._detect_applicable_enhancements(
            user_input, allowed_enhancements, disabled_enhancements
        )

        # 按优先级排序（最新添加的优先级最高）
        sorted_enhancements = self._sort_enhancements_by_priority(applicable_enhancements)

        # 逐个合并增强
        merged_prompt = base_prompt
        used_enhancements = []

        for enhancement_name in sorted_enhancements:
            try:
                enhancement = self.enhancements[enhancement_name]

                # 验证安全性
                if self._is_safe_enhancement(enhancement):
                    merged_prompt = self._merge_enhancement_safely(merged_prompt, enhancement)
                    used_enhancements.append(enhancement_name)
                    self._record_enhancement_usage(enhancement_name)
                else:
                    logger.warning(f"增强 {enhancement_name} 未通过安全检查，跳过")

            except Exception as e:
                logger.error(f"合并增强 {enhancement_name} 时出错: {e}")
                self._record_enhancement_error(enhancement_name)
                continue

        return merged_prompt, used_enhancements

    def _detect_applicable_enhancements(self,
                                      user_input: str,
                                      allowed_enhancements: List[str] = None,
                                      disabled_enhancements: List[str] = None) -> List[str]:
        """检测适用的增强提示词"""
        applicable = []
        user_input_lower = user_input.lower()

        for enhancement_name, enhancement in self.enhancements.items():
            # 检查是否被禁用
            if disabled_enhancements and enhancement_name in disabled_enhancements:
                continue

            # 检查是否在允许列表中
            if allowed_enhancements and enhancement_name not in allowed_enhancements:
                continue

            # 检查是否被用户禁用或自动禁用
            enhancement_config = self.config["enhancements"].get(enhancement_name, {})
            if (enhancement_config.get("user_disabled", False) or
                enhancement_config.get("auto_disabled", False)):
                continue

            # 关键词匹配
            triggers = enhancement['metadata'].get('triggers', {})
            keywords = triggers.get('keywords', [])

            if any(keyword.lower() in user_input_lower for keyword in keywords):
                applicable.append(enhancement_name)
                continue

            # 意图模式匹配
            intent_patterns = triggers.get('user_intent_patterns', [])
            if any(pattern.lower() in user_input_lower for pattern in intent_patterns):
                applicable.append(enhancement_name)

        return applicable

    def _sort_enhancements_by_priority(self, enhancements: List[str]) -> List[str]:
        """按优先级排序增强（最新添加的优先级最高）"""
        def get_priority(enhancement_name):
            enhancement_config = self.config["enhancements"].get(enhancement_name, {})
            # 优先级配置 + 文件修改时间（实现最新优先）
            priority = enhancement_config.get("priority", 50)

            try:
                file_path = self.prompts_dir / enhancement_config["file_path"]
                mtime = os.path.getmtime(file_path)
                return priority + (mtime % 100)  # 文件时间作为次要排序
            except:
                return priority

        return sorted(enhancements, key=get_priority, reverse=True)

    def _is_safe_enhancement(self, enhancement: Dict) -> bool:
        """检查增强是否安全"""
        metadata = enhancement['metadata']
        permissions = metadata.get('permissions', {})

        # 检查核心逻辑修改权限
        if permissions.get('can_modify_core_logic', False):
            logger.warning(f"增强 {enhancement['file_path']} 尝试修改核心逻辑，拒绝")
            return False

        # 检查格式修改权限
        if permissions.get('can_change_response_format', False):
            logger.warning(f"增强 {enhancement['file_path']} 尝试修改响应格式，拒绝")
            return False

        # 检查内容长度
        max_length = permissions.get('max_content_length', 2000)
        if len(enhancement['content']) > max_length:
            logger.warning(f"增强 {enhancement['file_path']} 内容过长，拒绝")
            return False

        return True

    def _merge_enhancement_safely(self, base_prompt: str, enhancement: Dict) -> str:
        """安全合并增强内容"""
        enhancement_content = enhancement['content']

        # 简单的追加合并（后续可以根据需要实现更复杂的合并逻辑）
        merged_prompt = base_prompt + "\n\n" + "="*50 + "\n"
        merged_prompt += f"## ENHANCEMENT: {enhancement['metadata'].get('name', 'Unknown')}\n"
        merged_prompt += "="*50 + "\n\n"
        merged_prompt += enhancement_content

        return merged_prompt

    def _record_enhancement_usage(self, enhancement_name: str) -> None:
        """记录增强使用情况"""
        if enhancement_name in self.config["enhancements"]:
            self.config["enhancements"][enhancement_name]["usage_count"] += 1
            self.config["enhancements"][enhancement_name]["last_used"] = datetime.now().isoformat()

    def _record_enhancement_error(self, enhancement_name: str) -> None:
        """记录增强错误"""
        if enhancement_name in self.config["enhancements"]:
            self.config["enhancements"][enhancement_name]["error_count"] += 1

            # 检查是否需要自动禁用
            error_threshold = self.config.get("monitoring", {}).get("error_threshold", 5)
            if self.config["enhancements"][enhancement_name]["error_count"] >= error_threshold:
                self.config["enhancements"][enhancement_name]["auto_disabled"] = True
                logger.warning(f"增强 {enhancement_name} 错误次数过多，已自动禁用")

    def _get_default_config(self) -> Dict:
        """获取默认配置"""
        return {
            "version": "1.0.0",
            "enhancements_enabled": True,
            "fallback_strategy": "conservative",
            "enhancements": {},
            "base_prompts": {},
            "security": {
                "allow_core_logic_modification": False,
                "allow_format_modification": False
            },
            "monitoring": {
                "log_usage": True,
                "log_errors": True,
                "auto_disable_on_errors": True,
                "error_threshold": 5
            }
        }

    def save_config(self) -> bool:
        """保存配置"""
        try:
            with open(self.config_path, 'w', encoding='utf-8') as f:
                json.dump(self.config, f, indent=2, ensure_ascii=False)
            logger.info("配置保存成功")
            return True
        except Exception as e:
            logger.error(f"配置保存失败: {e}")
            return False

    def reload_enhancements(self) -> None:
        """重新加载所有增强提示词"""
        self.enhancements.clear()
        self._load_enhancements()
        logger.info("增强提示词已重新加载")

    def list_enhancements(self) -> List[Dict]:
        """列出所有增强提示词"""
        return [
            {
                "name": name,
                "enabled": data['metadata'].get('enabled', True),
                "priority": data['metadata'].get('priority', 50),
                "description": data['metadata'].get('description', ''),
                "version": data['metadata'].get('version', '1.0.0'),
                "file_path": data['file_path']
            }
            for name, data in self.enhancements.items()
        ]

# 全局实例
_enhancement_manager = None

def get_enhancement_manager(prompts_dir: str = "prompts") -> EnhancementManager:
    """获取增强提示词管理器实例"""
    global _enhancement_manager
    if _enhancement_manager is None:
        _enhancement_manager = EnhancementManager(prompts_dir)
    return _enhancement_manager