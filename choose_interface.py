#!/usr/bin/env python3
"""
界面选择器 - 轻松启动不同版本的Streamlit应用
"""

import os
import subprocess
import sys


def print_header():
    """打印标题"""
    print("\n" + "="*70)
    print("🤖 智能澄清Agent - 界面选择器")
    print("="*70)


def print_options():
    """打印选项菜单"""
    print("\n请选择要启动的界面版本：\n")
    print("1️⃣  完整版 (streamlit_app.py)")
    print("   - 现代化设计")
    print("   - 侧边栏示例问题")
    print("   - 完整功能\n")

    print("2️⃣  极简版 (simple_chat.py)")
    print("   - 极简设计")
    print("   - 快速响应")
    print("   - 纯聊天界面\n")

    print("3️⃣  美化版 (streamlit_app_v2.py) ⭐ 推荐")
    print("   - 自定义样式")
    print("   - 增强用户体验")
    print("   - 对话导出功能\n")

    print("4️⃣  运行测试")
    print("   - 验证Agent功能")
    print("   - 非交互式测试\n")

    print("5️⃣  查看文档")
    print("   - 使用指南")
    print("   - 部署说明\n")

    print("0️⃣  退出")
    print("="*70)


def check_streamlit():
    """检查Streamlit是否已安装"""
    try:
        import streamlit
        return True
    except ImportError:
        return False


def install_streamlit():
    """安装Streamlit"""
    print("\n⚠️  Streamlit未安装，正在安装...")
    subprocess.run([sys.executable, "-m", "pip", "install", "streamlit", "-q"])
    print("✅ Streamlit安装完成\n")


def run_app(script_name):
    """运行指定的应用"""
    print(f"\n🚀 启动 {script_name}...")
    print("🌐 访问地址：http://localhost:8501")
    print("⚠️  按 Ctrl+C 停止服务\n")

    try:
        subprocess.run([
            sys.executable, "-m", "streamlit", "run",
            script_name,
            "--server.headless", "true"
        ])
    except KeyboardInterrupt:
        print("\n\n👋 服务已停止")


def run_test():
    """运行测试"""
    print("\n🧪 运行功能测试...")
    print("="*70)
    subprocess.run([sys.executable, "test_streamlit_non_interactive.py"])


def show_docs():
    """显示文档"""
    print("\n📚 项目文档：\n")
    docs = [
        ("📘 项目指南", "CLAUDE.md"),
        ("📊 提示词对比报告", "prompt_comparison_report.md"),
        ("🖥️ Streamlit使用指南", "README_STREAMLIT.md"),
        ("🚀 部署指南", "DEPLOYMENT_GUIDE.md"),
    ]

    for name, file in docs:
        if os.path.exists(file):
            print(f"  ✅ {name}: {file}")
        else:
            print(f"  ❌ {name}: {file} (未找到)")

    print("\n" + "="*70)


def main():
    """主函数"""
    print_header()

    # 检查Streamlit
    if not check_streamlit():
        install_streamlit()

    while True:
        print_options()

        choice = input("请选择 (0-5): ").strip()

        if choice == "1":
            run_app("streamlit_app.py")
            break
        elif choice == "2":
            run_app("simple_chat.py")
            break
        elif choice == "3":
            run_app("streamlit_app_v2.py")
            break
        elif choice == "4":
            run_test()
            input("\n按回车继续...")
            print("\n")
        elif choice == "5":
            show_docs()
            input("\n按回车继续...")
            print("\n")
        elif choice == "0":
            print("\n👋 再见！\n")
            break
        else:
            print("\n⚠️  无效选择，请重新输入\n")


if __name__ == "__main__":
    main()
