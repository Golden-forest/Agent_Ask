#!/usr/bin/env python3
"""
增强提示词系统测试脚本
"""

import json
import sys
import os
from pathlib import Path

# 添加项目根目录到路径
sys.path.append(str(Path(__file__).parent))

from prompts.enhancement_manager import get_enhancement_manager
from prompts.version_manager import get_version_manager

def test_enhancement_manager():
    """测试增强提示词管理器"""
    print("=" * 50)
    print("测试增强提示词管理器")
    print("=" * 50)

    try:
        # 获取管理器实例
        manager = get_enhancement_manager()
        print("✅ 增强提示词管理器初始化成功")

        # 列出所有增强
        enhancements = manager.list_enhancements()
        print(f"✅ 找到 {len(enhancements)} 个增强提示词:")
        for enhancement in enhancements:
            print(f"  - {enhancement['name']}: {enhancement['description']}")
            print(f"    优先级: {enhancement['priority']}, 版本: {enhancement['version']}")

        # 测试不同场景的提示词合并
        test_cases = [
            {
                "input": "我想开发一个API系统",
                "expected_enhancements": ["google_technical_scenarios"]
            },
            {
                "input": "帮我分析这个项目的风险",
                "expected_enhancements": ["claude_analytical_depth"]
            },
            {
                "input": "我需要一个结构化的输出",
                "expected_enhancements": ["openai_structured_output"]
            },
            {
                "input": "我想开发一个API系统并分析风险",
                "expected_enhancements": ["google_technical_scenarios", "claude_analytical_depth"]
            }
        ]

        print("\n🧪 测试场景触发:")
        for i, case in enumerate(test_cases, 1):
            print(f"\n场景 {i}: {case['input']}")
            merged_prompt, used_enhancements = manager.get_merged_prompt(
                base_prompt_name="websocket_chat",
                user_input=case["input"]
            )

            print(f"  使用的增强: {used_enhancements}")
            print(f" 提示词长度: {len(merged_prompt)} 字符")

            if used_enhancements:
                print("  ✅ 增强触发成功")
                for enh in used_enhancements:
                    if enh in case["expected_enhancements"]:
                        print(f"    - {enh}: 预期匹配 ✅")
                    else:
                        print(f"    - {enh}: 意外触发 ⚠️")
            else:
                print("  ⚠️ 没有触发任何增强")

        print("\n✅ 增强提示词管理器测试完成")
        return True

    except Exception as e:
        print(f"❌ 增强提示词管理器测试失败: {e}")
        return False

def test_version_manager():
    """测试版本管理器"""
    print("\n" + "=" * 50)
    print("测试版本管理器")
    print("=" * 50)

    try:
        # 获取管理器实例
        manager = get_version_manager()
        print("✅ 版本管理器初始化成功")

        # 创建测试备份
        version = manager.create_backup("测试备份")
        print(f"✅ 创建备份成功: {version}")

        # 列出所有备份
        backups = manager.list_backups()
        print(f"✅ 找到 {len(backups)} 个备份:")
        for backup in backups[:3]:  # 只显示前3个
            print(f"  - {backup['version']}: {backup['description']} ({backup['timestamp']})")

        # 获取当前版本
        current = manager.get_current_version()
        print(f"✅ 当前版本: {current}")

        print("\n✅ 版本管理器测试完成")
        return True

    except Exception as e:
        print(f"❌ 版本管理器测试失败: {e}")
        return False

def test_config_loading():
    """测试配置加载"""
    print("\n" + "=" * 50)
    print("测试配置加载")
    print("=" * 50)

    try:
        # 检查配置文件是否存在
        config_path = Path("prompts/config.json")
        if not config_path.exists():
            print("❌ 配置文件不存在")
            return False

        # 加载配置
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)

        print("✅ 配置文件加载成功")
        print(f"  版本: {config.get('version', 'Unknown')}")
        print(f"  增强功能启用: {config.get('enhancements_enabled', False)}")
        print(f"  配置的增强数量: {len(config.get('enhancements', {}))}")

        # 检查基础提示词
        base_prompts = config.get('base_prompts', {})
        print(f"  基础提示词数量: {len(base_prompts)}")
        for name, info in base_prompts.items():
            print(f"    - {name}: {info.get('file_path', 'Unknown')}")

        # 检查增强提示词
        enhancements = config.get('enhancements', {})
        print(f"  增强提示词数量: {len(enhancements)}")
        for name, info in enhancements.items():
            enabled = info.get('enabled', False)
            user_disabled = info.get('user_disabled', False)
            status = "启用" if enabled and not user_disabled else "禁用"
            print(f"    - {name}: {status} (优先级: {info.get('priority', 0)})")

        print("✅ 配置加载测试完成")
        return True

    except Exception as e:
        print(f"❌ 配置加载测试失败: {e}")
        return False

def test_file_structure():
    """测试文件结构"""
    print("\n" + "=" * 50)
    print("测试文件结构")
    print("=" * 50)

    required_files = [
        "prompts/config.json",
        "prompts/enhancement_manager.py",
        "prompts/version_manager.py",
        "prompts/base/websocket_chat_backup.md",
        "prompts/base/rest_chat_backup.md",
        "prompts/base/analysis_backup.md",
        "prompts/enhancements/google_technical_scenarios.md",
        "prompts/enhancements/claude_analytical_depth.md",
        "prompts/enhancements/openai_structured_output.md"
    ]

    all_good = True
    for file_path in required_files:
        path = Path(file_path)
        if path.exists():
            print(f"  ✅ {file_path}")
        else:
            print(f"  ❌ {file_path}")
            all_good = False

    if all_good:
        print("✅ 文件结构检查通过")
    else:
        print("❌ 文件结构检查失败")

    return all_good

def main():
    """主测试函数"""
    print("🚀 开始测试增强提示词系统")
    print("=" * 80)

    # 检查工作目录
    if not Path("prompts").exists():
        print("❌ 请在agent_ask目录中运行此脚本")
        return False

    # 运行所有测试
    tests = [
        ("文件结构", test_file_structure),
        ("配置加载", test_config_loading),
        ("版本管理器", test_version_manager),
        ("增强提示词管理器", test_enhancement_manager)
    ]

    results = []
    for test_name, test_func in tests:
        print(f"\n📋 运行测试: {test_name}")
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ 测试 {test_name} 出现异常: {e}")
            results.append((test_name, False))

    # 输出测试结果摘要
    print("\n" + "=" * 80)
    print("📊 测试结果摘要")
    print("=" * 80)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for test_name, result in results:
        status = "✅ 通过" if result else "❌ 失败"
        print(f"{test_name}: {status}")

    print(f"\n总计: {passed}/{total} 测试通过")

    if passed == total:
        print("🎉 所有测试通过！增强提示词系统运行正常")
        return True
    else:
        print("⚠️ 部分测试失败，请检查相关配置")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)