# 智能澄清Agent

> 极简主义设计的AI需求澄清助手

---

## 🎯 项目概述

智能澄清Agent是一个基于DeepSeek的AI助手，通过结构化提问帮助用户明确和优化需求。项目采用极简设计理念，专注核心功能，界面简洁无装饰。

---

## ✨ 当前状态

**v0.2.1** - 项目清理优化版本
- ✅ 已完成项目清理，删除585MB+临时文件
- ✅ 保持12个核心文件，项目大小仅472KB
- ✅ 极简设计，专注核心功能
- ✅ 需要重新创建虚拟环境

---

## 🚀 快速开始

### 一键环境配置（推荐）

```bash
# 1. 进入项目目录
cd /Users/hl/Projects/Agent/agent_ask

# 2. 运行自动配置脚本
chmod +x setup_env.sh
./setup_env.sh

# 3. 配置API密钥
# 编辑 .env 文件，填入您的 DeepSeek API 密钥
# DEEPSEEK_API_KEY=sk-xxxxxxxx

# 4. 启动应用
./start.sh
```

### 手动环境配置

<details>
<summary>点击展开手动配置步骤</summary>

```bash
# 1. 进入项目目录
cd /Users/hl/Projects/Agent/agent_ask

# 2. 创建虚拟环境
python -m venv venv

# 3. 激活虚拟环境
source venv/bin/activate

# 4. 安装依赖
pip install -r requirements.txt

# 5. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入您的API密钥

# 6. 启动应用
./start.sh
```

</details>

### 访问地址
- **默认端口**: 8501
- **自动端口检测**: 如果8501被占用，自动尝试8502、8503...


---

## 💡 使用流程

1. **描述需求** - 输入你的初始想法或需求
2. **AI提问** - AI提出针对性澄清问题（A/B/C/D选项）
3. **选择回答** - 选择预设选项或自定义回复
4. **多轮对话** - 持续对话直到需求明确
5. **完成分析** - 输入"Accept"获取完整需求分析报告

---

## 🏗️ 技术架构

### 核心技术栈
- **前端框架**: Streamlit 1.50.0
- **API框架**: FastAPI 0.121.0
- **LLM服务**: DeepSeek (via langchain-openai)
- **数据库**: SQLAlchemy 2.0.44
- **搜索功能**: Serper API集成
- **Python版本**: 3.9.6

### 设计特点
- **极简主义**: 纯文本界面，无装饰元素
- **固定布局**: A/B/C/D/Accept按钮始终显示
- **响应式设计**: 适配桌面、平板、手机设备
- **深色主题**: 专注内容，减少干扰

---

## 📁 项目结构

```
智能澄清Agent/
├── 核心代码文件
│   ├── main.py           # 主程序入口
│   ├── config.py         # 配置管理
│   ├── ui.py             # UI组件系统
│   ├── search.py         # 网络搜索功能
│   ├── database.py       # 数据库操作
│   └── server.py         # FastAPI服务器
├── 配置文件
│   ├── .env              # 环境变量配置
│   ├── .gitignore        # Git忽略规则
│   └── requirements.txt  # Python依赖清单
├── 文档文件
│   ├── README.md         # 项目说明文档
│   └── PROJECT_STRUCTURE.md  # 项目结构说明
├── 脚本文件
│   └── start.sh          # 应用启动脚本
└── 版本控制
    └── .git/             # Git版本控制历史
```

**注意**:
- 虚拟环境(`venv/`)已清理，需要重新创建
- 数据库文件(`chat.db`)运行时自动创建
- 所有临时文件已清理，保持极简结构

---

## 🎨 界面特色

### 极简设计
- 纯文本界面，无图标装饰
- 固定显示A/B/C/D/Accept快捷按钮
- 统一的设计语言和交互模式

### 核心功能
- **智能需求澄清**: 基于DeepSeek的多轮对话系统
- **快捷选项**: A/B/C/D/Accept固定显示，便于快速响应
- **网络搜索**: 集成实时搜索，提供背景信息支持
- **数据持久化**: 完整的对话历史存储和管理
- **API服务**: FastAPI后端，支持RESTful接口

---

## 🔧 配置说明

### 环境变量配置

项目使用 `.env` 文件进行配置。首次使用时，可从 `.env.example` 复制：

```bash
cp .env.example .env
```

### 必需配置

```bash
# DeepSeek API配置（必需）
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

获取API密钥：[https://platform.deepseek.com/](https://platform.deepseek.com/)

### 可选配置

```bash
# Serper搜索API（可选，不配置则禁用搜索功能）
SERPER_API_KEY=your_serper_api_key_here
```

获取API密钥：[https://serper.dev/](https://serper.dev/)

### 应用配置

```bash
# 基础配置
APP_NAME=智能澄清Agent
DEFAULT_PORT=8501

# 对话配置
MAX_CONVERSATION_HISTORY=10        # 对话历史保留轮数
SEARCH_MIN_LENGTH=10               # 触发搜索的最小输入长度
SEARCH_ON_FOLLOWUP=false           # 是否在后续对话中启用搜索
MIN_MESSAGES_FOR_REPORT=3          # 生成报告的最小消息数

# 数据库配置
DATABASE_URL=sqlite:///chat.db

# 性能配置
ENABLE_SEARCH_CACHE=true           # 启用搜索缓存
SEARCH_CACHE_TTL_HOURS=24          # 搜索缓存有效期（小时）
ENABLE_LLM_CACHING=true            # 启用LLM缓存
```


---

## 📊 功能特性

### ✅ 已实现功能
- [x] 智能需求澄清对话
- [x] A/B/C/D快捷选项
- [x] 自定义回答支持
- [x] 实时网络搜索
- [x] 对话历史存储
- [x] Accept命令完成分析
- [x] 完整需求报告生成
- [x] FastAPI后端服务
- [x] 响应式界面设计

### 🔄 技术优化
- [x] 极简项目结构（12个核心文件）
- [x] 项目大小优化（472KB）
- [x] 清理临时文件和缓存
- [x] 统一命名规范
- [x] 版本控制管理

---

## 🐛 开发指南

### 开发原则

#### 工作目录简洁原则
- 保持根目录只包含运行必需的文件
- 及时清理临时文件、截图、测试报告
- 避免重复版本文件，使用git版本控制
- 不保留"以后可能有用"的文件

#### 命名简约原则
- 使用功能导向命名：`server.py`、`search.py`、`database.py`
- 去除冗余前缀和版本标识
- 统一使用小写字母+下划线
- 保持命名跨平台兼容

#### 界面设计原则
- 极简主义，专注核心功能
- 去除装饰性图标和emoji
- 固定显示常用交互元素
- 保持统一的设计语言

---

## 📈 版本历史

### v0.2.1 (2025-11-20) - 项目清理优化版本
- ✅ 删除虚拟环境(579MB+)和临时文件
- ✅ 清理测试数据库和缓存文件
- ✅ 移除所有.DS_Store系统文件
- ✅ 优化项目结构，保持12个核心文件
- ✅ 项目大小从585MB+降至472KB
- ✅ 更新文档，反映当前项目状态

### v0.2.0 (2025-11-09) - 功能完善版本
- ✅ 完善数据库功能
- ✅ 添加搜索功能
- ✅ 优化UI组件
- ✅ 集成FastAPI服务

### v0.1.0 (2025-11-03) - 初始版本
- ✅ 基础需求澄清功能
- ✅ Streamlit界面
- ✅ DeepSeek集成

---

## 📞 支持与使用

### 快速测试
1. 启动应用：`./start.sh`
2. 打开浏览器访问显示的地址
3. 输入测试需求："我想做一个网站"
4. 体验AI提问和澄清过程

### API服务
启动API服务：
```bash
python server.py
```

API文档访问：http://localhost:8000/docs

---

## 📄 许可证

MIT License

---

**项目版本**: v0.2.1
**最后更新**: 2025-11-20
**开发目录**: `/Users/hl/Projects/Agent/agent_ask/`