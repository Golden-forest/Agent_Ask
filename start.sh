#!/bin/bash

# 智能澄清Agent - 启动脚本
echo "🤖 启动智能澄清Agent..."

# 激活虚拟环境
source venv/bin/activate

# 检查Streamlit是否已安装
if ! python -c "import streamlit" 2>/dev/null; then
    echo "📦 安装Streamlit..."
    pip install streamlit -q
fi

# 启动应用
echo "🚀 启动Streamlit应用..."
echo "🌐 访问地址：http://localhost:8501"
echo ""

streamlit run streamlit_app.py
