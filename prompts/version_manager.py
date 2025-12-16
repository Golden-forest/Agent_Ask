"""
提示词版本管理和回滚机制
"""

import json
import os
import shutil
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
import logging
import subprocess

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VersionManager:
    """提示词版本管理器"""

    def __init__(self, prompts_dir: str = "prompts"):
        self.prompts_dir = Path(prompts_dir)
        self.backups_dir = self.prompts_dir / "backups"
        self.config_path = self.prompts_dir / "config.json"
        self.version_log_path = self.prompts_dir / "version_log.json"

        # 确保备份目录存在
        self.backups_dir.mkdir(exist_ok=True)

        # 初始化版本日志
        self._init_version_log()

    def _init_version_log(self) -> None:
        """初始化版本日志"""
        if not self.version_log_path.exists():
            self.version_log = {
                "current_version": "1.0.0",
                "versions": {},
                "last_backup": None
            }
            self._save_version_log()
        else:
            self._load_version_log()

    def _load_version_log(self) -> None:
        """加载版本日志"""
        try:
            with open(self.version_log_path, 'r', encoding='utf-8') as f:
                self.version_log = json.load(f)
        except Exception as e:
            logger.error(f"加载版本日志失败: {e}")
            self.version_log = {
                "current_version": "1.0.0",
                "versions": {},
                "last_backup": None
            }

    def _save_version_log(self) -> None:
        """保存版本日志"""
        try:
            with open(self.version_log_path, 'w', encoding='utf-8') as f:
                json.dump(self.version_log, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"保存版本日志失败: {e}")

    def create_backup(self, description: str = "") -> str:
        """
        创建当前配置的备份

        Args:
            description: 备份描述

        Returns:
            备份版本号
        """
        try:
            # 生成版本号
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            version = f"v{timestamp}"

            # 创建备份目录
            backup_dir = self.backups_dir / version
            backup_dir.mkdir(exist_ok=True)

            # 备份配置文件
            if self.config_path.exists():
                shutil.copy2(self.config_path, backup_dir / "config.json")

            # 备份所有提示词文件
            for item in self.prompts_dir.iterdir():
                if item.is_dir() and item.name != "backups":
                    target_dir = backup_dir / item.name
                    shutil.copytree(item, target_dir, dirs_exist_ok=True)
                elif item.is_file() and item.suffix in ['.md', '.json']:
                    if item.parent == self.prompts_dir:  # 只复制根目录的文件
                        shutil.copy2(item, backup_dir)

            # 记录版本信息
            version_info = {
                "version": version,
                "timestamp": datetime.now().isoformat(),
                "description": description,
                "files_backed_up": self._get_backed_up_files(backup_dir),
                "git_commit": self._get_current_git_commit()
            }

            self.version_log["versions"][version] = version_info
            self.version_log["last_backup"] = datetime.now().isoformat()

            # 如果是第一个版本，设为当前版本
            if len(self.version_log["versions"]) == 1:
                self.version_log["current_version"] = version

            self._save_version_log()

            logger.info(f"备份创建成功: {version}")
            return version

        except Exception as e:
            logger.error(f"创建备份失败: {e}")
            raise

    def _get_backed_up_files(self, backup_dir: Path) -> List[str]:
        """获取备份的文件列表"""
        files = []
        for item in backup_dir.rglob("*"):
            if item.is_file():
                rel_path = item.relative_to(backup_dir)
                files.append(str(rel_path))
        return files

    def _get_current_git_commit(self) -> Optional[str]:
        """获取当前Git提交哈希"""
        try:
            result = subprocess.run(
                ["git", "rev-parse", "HEAD"],
                capture_output=True,
                text=True,
                cwd=self.prompts_dir.parent
            )
            if result.returncode == 0:
                return result.stdout.strip()
        except Exception:
            pass
        return None

    def list_backups(self) -> List[Dict]:
        """列出所有备份"""
        versions = []
        for version, info in self.version_log["versions"].items():
            versions.append({
                "version": version,
                "timestamp": info["timestamp"],
                "description": info["description"],
                "files_count": len(info["files_backed_up"]),
                "git_commit": info.get("git_commit")
            })

        # 按时间倒序排列
        versions.sort(key=lambda x: x["timestamp"], reverse=True)
        return versions

    def restore_backup(self, version: str) -> bool:
        """
        恢复指定版本的备份

        Args:
            version: 要恢复的版本号

        Returns:
            是否恢复成功
        """
        try:
            backup_dir = self.backups_dir / version

            if not backup_dir.exists():
                logger.error(f"备份版本 {version} 不存在")
                return False

            # 创建当前版本的备份（在恢复之前）
            current_backup = self.create_backup(f"恢复前自动备份 - 恢复到 {version}")

            # 恢复配置文件
            config_backup = backup_dir / "config.json"
            if config_backup.exists():
                shutil.copy2(config_backup, self.config_path)

            # 恢复提示词文件
            for item in backup_dir.iterdir():
                if item.is_dir():
                    target_dir = self.prompts_dir / item.name
                    if target_dir.exists():
                        shutil.rmtree(target_dir)
                    shutil.copytree(item, target_dir)
                elif item.is_file():
                    target_file = self.prompts_dir / item.name
                    shutil.copy2(item, target_file)

            # 更新当前版本
            self.version_log["current_version"] = version
            self._save_version_log()

            logger.info(f"成功恢复到版本: {version}")
            logger.info(f"当前版本备份已保存: {current_backup}")

            return True

        except Exception as e:
            logger.error(f"恢复备份失败: {e}")
            return False

    def delete_backup(self, version: str) -> bool:
        """
        删除指定版本的备份

        Args:
            version: 要删除的版本号

        Returns:
            是否删除成功
        """
        try:
            backup_dir = self.backups_dir / version

            if not backup_dir.exists():
                logger.error(f"备份版本 {version} 不存在")
                return False

            # 不能删除当前版本
            if self.version_log.get("current_version") == version:
                logger.error("不能删除当前版本")
                return False

            # 删除备份目录
            shutil.rmtree(backup_dir)

            # 从版本日志中移除
            if version in self.version_log["versions"]:
                del self.version_log["versions"][version]
                self._save_version_log()

            logger.info(f"备份版本 {version} 删除成功")
            return True

        except Exception as e:
            logger.error(f"删除备份失败: {e}")
            return False

    def get_current_version(self) -> Optional[str]:
        """获取当前版本"""
        return self.version_log.get("current_version")

    def get_version_info(self, version: str) -> Optional[Dict]:
        """获取指定版本的详细信息"""
        return self.version_log["versions"].get(version)

    def auto_backup_on_change(self) -> None:
        """配置文件变更时自动备份"""
        try:
            config = self._load_config()
            if config.get("version_control", {}).get("backup_on_change", False):
                self.create_backup("配置变更自动备份")
        except Exception as e:
            logger.error(f"自动备份失败: {e}")

    def _load_config(self) -> Dict:
        """加载配置文件"""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return {}

    def cleanup_old_backups(self, keep_count: int = 10) -> None:
        """
        清理旧备份，保留最近的N个备份

        Args:
            keep_count: 保留的备份数量
        """
        try:
            backups = self.list_backups()

            if len(backups) <= keep_count:
                return

            # 删除最旧的备份
            backups_to_delete = backups[keep_count:]

            for backup in backups_to_delete:
                self.delete_backup(backup["version"])

            logger.info(f"清理旧备份完成，保留了最近的 {keep_count} 个备份")

        except Exception as e:
            logger.error(f"清理旧备份失败: {e}")

# 全局实例
_version_manager = None

def get_version_manager(prompts_dir: str = "prompts") -> VersionManager:
    """获取版本管理器实例"""
    global _version_manager
    if _version_manager is None:
        _version_manager = VersionManager(prompts_dir)
    return _version_manager