#!/bin/bash

# 极简主义需求澄清助手启动脚本
# 采用DeepSeek官网的简洁设计风格

echo "启动极简主义需求澄清助手..."

# 检查是否在正确的目录
if [ ! -f "main.py" ]; then
    echo "错误: 找不到main.py文件"
    echo "请确保在项目根目录中运行此脚本"
    exit 1
fi

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo "错误: 找不到虚拟环境"
    echo "请先创建虚拟环境: python -m venv venv"
    exit 1
fi

# 激活虚拟环境
echo "激活虚拟环境..."
source venv/bin/activate

# 检查依赖
echo "检查依赖包..."
python -c "import streamlit, langchain_openai" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "错误: 缺少必要的依赖包"
    echo "请运行: pip install -r requirements.txt"
    exit 1
fi

# 查找可用端口
PORT=8501
while lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; do
    echo "端口 $PORT 已被占用，尝试下一个端口..."
    PORT=$((PORT + 1))
done

echo "使用端口 $PORT 启动应用..."

# 启动应用
echo "启动极简主义需求澄清助手..."
echo "界面设计: DeepSeek风格极简设计"
echo "核心功能: AI需求澄清与对话"
echo "访问地址: http://localhost:$PORT"
echo ""
echo "按 Ctrl+C 停止应用"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

streamlit run main.py --server.port $PORT --server.address 0.0.0.0