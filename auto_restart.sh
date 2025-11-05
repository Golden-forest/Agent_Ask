#!/bin/bash
# 自动重启服务脚本

echo "🔄 检查Streamlit服务状态..."

# 检查端口8504是否被占用
if lsof -i :8504 > /dev/null 2>&1; then
    echo "✅ 端口8504已被占用，服务可能正在运行"
    echo "访问 http://localhost:8504"
else
    echo "⚠️  端口8504未占用，准备启动服务..."
    source venv/bin/activate
    streamlit run streamlit_simple.py --server.headless true --server.port 8504 &
    echo "✅ 服务已启动"
    echo "访问 http://localhost:8504"
fi
