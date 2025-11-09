"""
配置管理模块
统一管理应用配置、常量和设置
"""

import os
from typing import Dict, Any, Optional
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()

@dataclass
class AppConfig:
    """应用配置类"""

    # 页面配置
    PAGE_TITLE: str = "需求澄清助手"
    PAGE_ICON: str = ""
    LAYOUT: str = "wide"
    INITIAL_SIDEBAR_STATE: str = "expanded"

    # AI模型配置
    MODEL_NAME: str = "deepseek-chat"
    API_KEY: str = os.getenv("DEEPSEEK_API_KEY", "")
    BASE_URL: str = os.getenv("DEEPSEEK_BASE_URL", "")
    MAX_HISTORY_LENGTH: int = 10
    MAX_MESSAGE_LENGTH: int = 500

    # 搜索配置
    SEARCH_API_KEY: str = os.getenv("SERPER_API_KEY", "")
    SEARCH_ENABLED_DEFAULT: bool = True
    SEARCH_TIMEOUT: int = 10

    # 数据库配置
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./chat.db")
    DB_ENABLED: bool = True

    # 性能配置
    CACHE_TTL: int = 3600  # 缓存过期时间（秒）
    MAX_RETRIES: int = 3
    RETRY_DELAY: int = 1

    # UI配置
    ANIMATION_DURATION: str = "0.3s"
    TRANSITION_TIMING: str = "cubic-bezier(0.4, 0, 0.2, 1)"
    MOBILE_BREAKPOINT: int = 768
    TABLET_BREAKPOINT: int = 1024

    # 错误处理配置
    ERROR_LOG_FILE: str = "error_log.log"
    ERROR_REPORT_ENABLED: bool = True
    CIRCUIT_BREAKER_THRESHOLD: int = 5
    CIRCUIT_BREAKER_TIMEOUT: int = 60

    # 功能开关
    ENABLE_KEYBOARD_SHORTCUTS: bool = True
    ENABLE_PERFORMANCE_MONITORING: bool = True
    ENABLE_ERROR_RECOVERY: bool = True
    ENABLE_MOBILE_OPTIMIZATION: bool = True

    @classmethod
    def validate_config(cls) -> Dict[str, Any]:
        """验证配置并返回状态"""
        validation_result = {
            "valid": True,
            "warnings": [],
            "errors": []
        }

        # 检查必要的API密钥
        if not cls.API_KEY:
            validation_result["errors"].append("DEEPSEEK_API_KEY 未设置")
            validation_result["valid"] = False

        if not cls.BASE_URL:
            validation_result["errors"].append("DEEPSEEK_BASE_URL 未设置")
            validation_result["valid"] = False

        # 检查搜索配置
        if not cls.SEARCH_API_KEY:
            validation_result["warnings"].append("SERPER_API_KEY 未设置，搜索功能将被禁用")

        # 检查数据库
        try:
            if cls.DB_ENABLED:
                # 尝试连接数据库
                pass
        except Exception as e:
            validation_result["warnings"].append(f"数据库连接可能有问题: {e}")

        return validation_result

    @classmethod
    def get_env_info(cls) -> Dict[str, Any]:
        """获取环境信息"""
        return {
            "python_version": os.sys.version,
            "environment": os.getenv("ENVIRONMENT", "development"),
            "debug_mode": os.getenv("DEBUG", "false").lower() == "true",
            "database_url": cls.DATABASE_URL.replace("password", "***") if "password" in cls.DATABASE_URL else cls.DATABASE_URL,
            "api_configured": bool(cls.API_KEY and cls.BASE_URL),
            "search_configured": bool(cls.SEARCH_API_KEY),
        }

class ThemeConfig:
    """主题配置类"""

    # 渐变色彩
    GRADIENT_PRIMARY: str = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    GRADIENT_SECONDARY: str = "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    GRADIENT_ACCENT_1: str = "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    GRADIENT_ACCENT_2: str = "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"

    # 玻璃拟态
    GLASS_BG: str = "rgba(255, 255, 255, 0.08)"
    GLASS_BORDER: str = "rgba(255, 255, 255, 0.15)"
    GLASS_SHADOW: str = "0 8px 32px rgba(31, 38, 135, 0.12)"

    # 功能色彩
    SUCCESS_COLOR: str = "#10b981"
    WARNING_COLOR: str = "#f59e0b"
    ERROR_COLOR: str = "#ef4444"
    INFO_COLOR: str = "#3b82f6"

    # 阴影系统
    SHADOW_SM: str = "0 1px 2px rgba(0, 0, 0, 0.05)"
    SHADOW_MD: str = "0 4px 6px rgba(0, 0, 0, 0.1)"
    SHADOW_LG: str = "0 10px 15px rgba(0, 0, 0, 0.1)"
    SHADOW_XL: str = "0 20px 25px rgba(0, 0, 0, 0.1)"
    SHADOW_GLOW: str = "0 0 20px rgba(102, 126, 234, 0.3)"

    @classmethod
    def get_css_variables(cls) -> str:
        """获取CSS变量定义"""
        return f"""
        :root {{
            --gradient-primary: {cls.GRADIENT_PRIMARY};
            --gradient-secondary: {cls.GRADIENT_SECONDARY};
            --gradient-accent-1: {cls.GRADIENT_ACCENT_1};
            --gradient-accent-2: {cls.GRADIENT_ACCENT_2};
            --glass-bg: {cls.GLASS_BG};
            --glass-border: {cls.GLASS_BORDER};
            --glass-shadow: {cls.GLASS_SHADOW};
            --success-color: {cls.SUCCESS_COLOR};
            --warning-color: {cls.WARNING_COLOR};
            --error-color: {cls.ERROR_COLOR};
            --info-color: {cls.INFO_COLOR};
            --shadow-sm: {cls.SHADOW_SM};
            --shadow-md: {cls.SHADOW_MD};
            --shadow-lg: {cls.SHADOW_LG};
            --shadow-xl: {cls.SHADOW_XL};
            --shadow-glow: {cls.SHADOW_GLOW};
        }}
        """

class MessageTemplates:
    """消息模板类"""

    WELCOME_MESSAGE: str = """👋 你好！我是智能澄清助手。

我将通过有针对性的提问，帮助你明确和澄清真实需求。

💡 **我可以帮助你：**
- 澄清模糊的需求描述
- 挖掘潜在的用户期望
- 分析技术可行性
- 提供专业建议

请开始描述你的需求吧！"""

    INPUT_VALIDATION_ERROR: str = "请输入有效的需求描述"
    EMPTY_INPUT_ERROR: str = "输入内容不能为空"
    INPUT_TOO_SHORT_ERROR: str = "输入内容至少需要 {min_length} 个字符"
    INPUT_TOO_LONG_ERROR: str = "输入内容不能超过 {max_length} 个字符"
    UNSAFE_INPUT_ERROR: str = "输入内容包含不安全的字符，请修改后重试"

    API_ERROR_MESSAGE: str = "API服务暂时不可用，请稍后再试或联系管理员。"
    NETWORK_ERROR_MESSAGE: str = "网络连接出现问题，请检查网络连接后重试。"
    DATABASE_ERROR_MESSAGE: str = "数据保存出现问题，但您的对话记录不会丢失。请继续使用。"
    UNKNOWN_ERROR_MESSAGE: str = "处理请求时遇到了问题，请稍后重试。如果问题持续存在，请刷新页面。"

    SUCCESS_MESSAGES: Dict[str, str] = {
        "message_sent": "消息已发送",
        "chat_cleared": "对话已清空",
        "new_chat": "新对话已创建",
        "search_completed": "网络搜索完成！已获取相关行业信息",
        "requirement_analyzed": "需求分析完成",
        "settings_saved": "设置已保存",
        "data_exported": "数据导出成功"
    }

    ERROR_MESSAGES: Dict[str, str] = {
        "send_failed": "消息发送失败",
        "clear_failed": "清空对话失败",
        "search_failed": "网络搜索失败",
        "analysis_failed": "需求分析失败",
        "save_failed": "保存失败",
        "load_failed": "加载失败"
    }

class ShortcutConfig:
    """快捷键配置类"""

    SHORTCUTS: Dict[str, Dict[str, str]] = {
        "消息操作": {
            "Ctrl+Enter": "发送消息",
            "Cmd+Enter": "发送消息",
        },
        "对话管理": {
            "Ctrl+L": "清空对话",
            "Cmd+K": "清空对话",
            "Ctrl+N": "新建对话",
            "Cmd+N": "新建对话",
        },
        "功能控制": {
            "Ctrl+S": "切换搜索",
            "Cmd+S": "切换搜索",
        },
        "快速选项": {
            "1": "选择选项A",
            "2": "选择选项B",
            "3": "选择选项C",
            "4": "选择选项D",
            "Enter": "Accept确认",
        },
        "导航": {
            "/": "聚焦输入框",
        },
        "帮助": {
            "F1": "显示帮助",
            "Shift+?": "显示帮助",
        }
    }

class PerformanceConfig:
    """性能配置类"""

    # 缓存配置
    ENABLE_LLM_CACHING: bool = True
    ENABLE_SEARCH_CACHING: bool = True
    CACHE_SIZE_LIMIT: int = 1000

    # 并发配置
    MAX_CONCURRENT_REQUESTS: int = 5
    REQUEST_TIMEOUT: int = 30

    # 内存管理
    MAX_MEMORY_USAGE: int = 1024 * 1024 * 1024  # 1GB
    GARBAGE_COLLECTION_INTERVAL: int = 300  # 5分钟

    # 监控配置
    ENABLE_PERFORMANCE_LOGGING: bool = True
    PERFORMANCE_LOG_INTERVAL: int = 60  # 1分钟
    SLOW_QUERY_THRESHOLD: float = 2.0  # 2秒

# 全局配置实例
app_config = AppConfig()
theme_config = ThemeConfig()
message_templates = MessageTemplates()
shortcut_config = ShortcutConfig()
performance_config = PerformanceConfig()

def get_config_summary() -> Dict[str, Any]:
    """获取配置摘要"""
    validation = app_config.validate_config()
    env_info = app_config.get_env_info()

    return {
        "validation": validation,
        "environment": env_info,
        "features": {
            "keyboard_shortcuts": app_config.ENABLE_KEYBOARD_SHORTCUTS,
            "performance_monitoring": app_config.ENABLE_PERFORMANCE_MONITORING,
            "error_recovery": app_config.ENABLE_ERROR_RECOVERY,
            "mobile_optimization": app_config.ENABLE_MOBILE_OPTIMIZATION,
        },
        "limits": {
            "max_history_length": app_config.MAX_HISTORY_LENGTH,
            "max_message_length": app_config.MAX_MESSAGE_LENGTH,
            "max_retries": app_config.MAX_RETRIES,
            "cache_ttl": app_config.CACHE_TTL,
        }
    }

def update_config(**kwargs) -> bool:
    """动态更新配置"""
    try:
        for key, value in kwargs.items():
            if hasattr(app_config, key):
                setattr(app_config, key, value)
            else:
                print(f"Warning: Unknown config key '{key}'")
        return True
    except Exception as e:
        print(f"Error updating config: {e}")
        return False