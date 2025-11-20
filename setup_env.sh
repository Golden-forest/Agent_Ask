#!/bin/bash

# 智能澄清Agent - 一键环境配置脚本
# 自动创建虚拟环境、安装依赖、配置环境变量

set -e  # 遇到错误立即退出

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  智能澄清Agent - 环境配置脚本"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查Python版本
echo "🔍 检查Python版本..."
PYTHON_VERSION=$(python --version 2>&1 | awk '{print $2}')
REQUIRED_VERSION="3.9.6"

if [[ "$PYTHON_VERSION" != "$REQUIRED_VERSION" ]]; then
    echo -e "${YELLOW}⚠️  警告: 当前Python版本为 $PYTHON_VERSION${NC}"
    echo -e "${YELLOW}   推荐版本: $REQUIRED_VERSION${NC}"
    echo -e "${YELLOW}   继续安装可能会遇到兼容性问题${NC}"
    read -p "是否继续? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "安装已取消"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Python版本正确: $PYTHON_VERSION${NC}"
fi

# 检查是否在正确的目录
if [ ! -f "main.py" ]; then
    echo -e "${RED}❌ 错误: 找不到main.py文件${NC}"
    echo "请确保在项目根目录中运行此脚本"
    exit 1
fi

# 创建虚拟环境
if [ -d "venv" ]; then
    echo -e "${YELLOW}⚠️  虚拟环境已存在${NC}"
    read -p "是否删除并重新创建? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  删除旧虚拟环境..."
        rm -rf venv
    else
        echo "跳过虚拟环境创建"
        SKIP_VENV=true
    fi
fi

if [ "$SKIP_VENV" != true ]; then
    echo "📦 创建虚拟环境..."
    python -m venv venv
    echo -e "${GREEN}✓ 虚拟环境创建成功${NC}"
fi

# 激活虚拟环境
echo "🔌 激活虚拟环境..."
source venv/bin/activate

# 升级pip
echo "⬆️  升级pip..."
pip install --upgrade pip -q

# 安装依赖
echo "📚 安装依赖包（这可能需要几分钟）..."
if pip install -r requirements.txt -q; then
    echo -e "${GREEN}✓ 依赖包安装成功${NC}"
else
    echo -e "${RED}❌ 依赖包安装失败${NC}"
    echo "请检查requirements.txt文件或网络连接"
    exit 1
fi

# 检查.env文件
echo ""
echo "🔐 检查环境变量配置..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo -e "${YELLOW}⚠️  未找到.env文件${NC}"
        read -p "是否从.env.example创建.env文件? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cp .env.example .env
            echo -e "${GREEN}✓ .env文件已创建${NC}"
            echo -e "${YELLOW}⚠️  请编辑.env文件，填入您的API密钥${NC}"
            NEED_CONFIG=true
        fi
    else
        echo -e "${RED}❌ 未找到.env和.env.example文件${NC}"
        echo "请手动创建.env文件并配置API密钥"
        NEED_CONFIG=true
    fi
else
    echo -e "${GREEN}✓ .env文件已存在${NC}"
fi

# 验证API密钥配置
if [ -f ".env" ]; then
    echo ""
    echo "🔑 验证API密钥配置..."
    
    # 检查DeepSeek API密钥
    if grep -q "DEEPSEEK_API_KEY=sk-" .env; then
        echo -e "${GREEN}✓ DeepSeek API密钥已配置${NC}"
    else
        echo -e "${RED}❌ DeepSeek API密钥未配置或格式错误${NC}"
        echo "   请在.env文件中设置: DEEPSEEK_API_KEY=sk-xxxxxxxx"
        NEED_CONFIG=true
    fi
    
    # 检查Serper API密钥（可选）
    if grep -q "SERPER_API_KEY=" .env && ! grep -q "SERPER_API_KEY=your_serper_api_key" .env; then
        echo -e "${GREEN}✓ Serper API密钥已配置（搜索功能已启用）${NC}"
    else
        echo -e "${YELLOW}⚠️  Serper API密钥未配置（搜索功能将被禁用）${NC}"
    fi
fi

# 初始化数据库
echo ""
echo "🗄️  初始化数据库..."
if python -c "from database import init_database; init_database(); print('数据库初始化成功')" 2>/dev/null; then
    echo -e "${GREEN}✓ 数据库初始化成功${NC}"
else
    echo -e "${YELLOW}⚠️  数据库初始化失败（首次运行时会自动创建）${NC}"
fi

# 运行健康检查
echo ""
echo "🏥 运行健康检查..."
if python -c "import streamlit; from langchain_openai import ChatOpenAI; print('核心依赖检查通过')" 2>/dev/null; then
    echo -e "${GREEN}✓ 核心依赖检查通过${NC}"
else
    echo -e "${RED}❌ 核心依赖检查失败${NC}"
    echo "请检查依赖包安装情况"
fi

# 完成
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$NEED_CONFIG" = true ]; then
    echo -e "${YELLOW}⚠️  环境配置完成，但需要手动配置API密钥${NC}"
    echo ""
    echo "下一步操作："
    echo "1. 编辑 .env 文件，填入您的API密钥"
    echo "2. 运行: ./start.sh"
else
    echo -e "${GREEN}✅ 环境配置完成！${NC}"
    echo ""
    echo "启动应用："
    echo "  ./start.sh"
    echo ""
    echo "或手动启动："
    echo "  source venv/bin/activate"
    echo "  streamlit run main.py"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
