# 智能澄清Agent工作台

## 项目概述

基于CrewAI多Agent协作框架和DeepSeek大模型的智能澄清Agent，能够自动判断用户问题的清晰度，通过6个专业Agent协作逐步澄清模糊部分，引导用户提供必要信息，最终生成高质量、结构化的回答。

## 当前版本：v0.1.0

**环境配置完成日期**：2025-11-03

## 技术栈

### 核心框架
- **CrewAI 0.1.32** - 多Agent协作框架（兼容Python 3.9）
- **Streamlit 1.50.0** - Web UI框架
- **FastAPI 0.121.0** - 后端API框架
- **Uvicorn 0.38.0** - ASGI服务器

### LLM集成
- **DeepSeek SDK 0.1.1** - DeepSeek API客户端
- **OpenAI 1.109.1** - OpenAI兼容接口
- **LangChain 0.1.0** - LLM应用框架
- **TikToken 0.5.2** - Token计算

### 数据处理
- **Pydantic 2.12.3** - 数据验证
- **Requests 2.32.5** - HTTP请求
- **HTTPX 0.28.1** - 异步HTTP
- **Pandas 2.3.3** - 数据分析
- **PyYAML 6.0.3** - YAML处理
- **SQLAlchemy 2.0.44** - 数据库ORM

### 浏览器工具
- **Playwright 1.55.0** - 浏览器自动化
- **Chromium 140.0.7339.16** - 已配置
- **FFMPEG** - 媒体处理

### 开发工具
- **Black 25.9.0** - 代码格式化
- **Flake8 7.3.0** - 代码检查
- **MyPy 1.18.2** - 类型检查
- **Loguru 0.7.3** - 日志库

## 安装统计

- **Python包总数**：93个
- **存储使用**：约700MB
- **虚拟环境**：`venv/`

## 快速开始

### 1. 激活虚拟环境
```bash
source venv/bin/activate
```

### 2. 配置API Keys
```bash
# 创建并编辑 .env 文件
cat > .env << 'EOF'
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com
SERPER_API_KEY=your_serper_key_here
EOF
```

### 3. 验证环境
```bash
python check_env.py
```

### 4. 运行验证
应该看到：
- ✅ CrewAI已安装
- ✅ Streamlit已安装
- ✅ FastAPI已安装
- ✅ DeepSeek SDK已安装
- ✅ Playwright已安装
- ✅ Chromium浏览器工作正常

## 项目结构

```
clarification_agent/
├── backend/          # 后端代码
│   ├── api/          # API接口
│   ├── crew/         # CrewAI逻辑
│   └── models/       # 数据模型
├── frontend/         # 前端代码
│   └── streamlit/    # Streamlit界面
├── shared/           # 前后端共用
│   ├── schemas/      # 数据结构
│   └── constants/    # 常量
├── tests/            # 测试
├── docs/             # 文档
├── data/             # 数据
├── logs/             # 日志
├── venv/             # 虚拟环境
├── .gitignore        # Git忽略配置
├── requirements.txt  # Python依赖
├── check_env.py      # 环境验证脚本
└── README.md         # 项目说明
```

## 下一步计划

### Phase 1：核心Agent开发（Day 2-7）
- 创建6个澄清Agent
- 实现澄清流程
- 构建Streamlit界面

### Phase 2：功能扩展（Day 8-14）
- 添加历史记录
- 优化用户体验
- 性能调优

### Phase 3：React迁移（Day 15-21，如需要）
- 准备React开发环境
- 设计React组件
- 迁移前端界面

## 系统要求

- **Python**: 3.9.6+
- **内存**: 4GB+（推荐8GB）
- **磁盘空间**: 2GB+可用空间
- **操作系统**: macOS, Linux, Windows

## 注意事项

⚠️ **Python版本兼容性**
- 使用CrewAI 0.1.32兼容Python 3.9
- 新版CrewAI需要Python 3.10+

⚠️ **SSL警告**
- urllib3提示LibreSSL版本较旧
- 不影响功能，仅为警告

## 文档

- [智能澄清Agent技术方案.md](智能澄清Agent技术方案.md) - 后端方案
- [agent_ask.md](agent_ask.md) - 前端方案
- [INSTALLATION_SUMMARY.md](INSTALLATION_SUMMARY.md) - 安装汇总

## 版本历史

- **v0.1.0** (2025-11-03) - 初始环境配置
  - 集成所有核心框架
  - 配置开发环境
  - 创建项目结构

## 许可证

MIT

## 作者

HL

---

**当前状态**：✅ 环境配置完成，可开始开发
