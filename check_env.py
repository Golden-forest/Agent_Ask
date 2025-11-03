import sys
import warnings
warnings.filterwarnings('ignore', category=UserWarning, module='pydantic._internal._generate_schema')

print("=" * 60)
print("Python环境验证")
print("=" * 60)
print("Python版本:", sys.version)

# 验证关键包
print("\n📦 核心依赖包检查：")
try:
    import crewai
    print("✅ CrewAI已安装 (兼容Python 3.9)")
except ImportError:
    print("❌ CrewAI未安装")

try:
    import streamlit
    print("✅ Streamlit已安装 (版本: {})".format(streamlit.__version__))
except ImportError:
    print("❌ Streamlit未安装")

try:
    import fastapi
    print("✅ FastAPI已安装 (版本: {})".format(fastapi.__version__))
except ImportError:
    print("❌ FastAPI未安装")

try:
    import uvicorn
    print("✅ Uvicorn已安装")
except ImportError:
    print("❌ Uvicorn未安装")

try:
    import deepseek
    print("✅ DeepSeek SDK已安装")
except ImportError:
    print("❌ DeepSeek SDK未安装")

try:
    import requests
    print("✅ Requests已安装")
except ImportError:
    print("❌ Requests未安装")

try:
    import pydantic
    print("✅ Pydantic已安装 (版本: {})".format(pydantic.__version__))
except ImportError:
    print("❌ Pydantic未安装")

try:
    import playwright
    print("✅ Playwright已安装")
except ImportError:
    print("❌ Playwright未安装")

# 验证开发工具
print("\n🛠️ 开发工具检查：")
try:
    import black
    print("✅ Black (代码格式化)")
except ImportError:
    print("❌ Black未安装")

try:
    import flake8
    print("✅ Flake8 (代码检查)")
except ImportError:
    print("❌ Flake8未安装")

try:
    import mypy
    print("✅ MyPy (类型检查)")
except ImportError:
    print("❌ MyPy未安装")

try:
    import httpx
    print("✅ HTTPX (异步HTTP)")
except ImportError:
    print("❌ HTTPX未安装")

try:
    import loguru
    print("✅ Loguru (日志)")
except ImportError:
    print("❌ Loguru未安装")

# 验证环境变量
print("\n🔑 API Key检查：")
import os
from dotenv import load_dotenv
load_dotenv()

if os.getenv("DEEPSEEK_API_KEY"):
    print("✅ DeepSeek API Key已配置")
else:
    print("⚠️  DeepSeek API Key未配置")

if os.getenv("SERPER_API_KEY"):
    print("✅ Serper API Key已配置")
else:
    print("⚠️  Serper API Key未配置")

# 验证Playwright浏览器
print("\n🌐 浏览器工具检查：")
try:
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("data:text/html,<html><body><h1>Test</h1></body></html>")
        title = page.title()
        browser.close()
    print("✅ Chromium浏览器工作正常")
except Exception as e:
    print("❌ Chromium浏览器测试失败:", str(e))

print("\n" + "=" * 60)
print("环境验证完成！")
print("=" * 60)
