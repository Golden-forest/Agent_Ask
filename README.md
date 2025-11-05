# 🤖 需求澄清助手

> 一个通过有针对性提问来帮助用户明确需求的AI助手

---

## ✅ 当前状态

**已修复**：解决了 "Agent stopped due to iteration limit" 问题

**推荐版本**：streamlit_simple.py（端口：8504）
- ✅ 使用LangChain直接调用
- ✅ 避免CrewAI迭代问题
- ✅ 响应稳定快速

---

## 🚀 快速开始

### 访问界面
**http://localhost:8504**

### 使用流程
1. 💬 描述你的初始想法或需求
2. ❓ AI提出澄清问题（A/B/C/D选项）
3. ✅ 选择或自定义回答
4. 🔄 继续对话直到需求清晰
5. 🏁 输入 "Accept" 获取完整需求分析

---

## 📱 界面展示

### 简化版 (推荐)
- **文件**：`streamlit_simple.py`
- **端口**：8504
- **特点**：简洁、稳定、快速

### 完整版 (有Bug)
- **文件**：`streamlit_app_v2.py`
- **端口**：8503
- **问题**：CrewAI迭代限制
- **状态**：不推荐使用

---

## 💡 使用示例

### 示例1：网站项目
**用户输入**：
> "我想做一个网站，但不知道具体要做什么功能"

**AI回应**：
> **问题 1**: 你的网站主要想实现什么目标？
> **选项:**
> A. 展示公司或个人的作品集
> B. 在线销售产品
> C. 提供资讯或博客内容
> D. 其他
>
> 请选择A/B/C/D，或输入您的自定义回复...

---

## 🛠️ 技术架构

### 当前实现
- **前端**：Streamlit
- **LLM**：DeepSeek (via LangChain)
- **提示词**：结构化模板
- **调用方式**：直接LLM调用（避免CrewAI）

### 原始设计
- **框架**：CrewAI 多Agent协作
- **问题**：迭代限制导致对话中断
- **解决**：简化为单Agent直接调用

---

## 📁 文件结构

```
clarification_agent/
├── 📄 核心文件
│   ├── streamlit_simple.py              # ✅ 推荐版本
│   ├── streamlit_app_v2.py              # ⚠️ 有Bug版本
│   └── simple_chat.py                   # 备用极简版
│
├── 📝 提示词与模板
│   ├── example_prompt_template.txt      # 提示词模板
│   └── agent_ask.md                     # 原始提示词设计
│
├── 📚 文档
│   ├── README.md                        # 本文件
│   ├── QUICKSTART.md                    # 快速启动指南
│   ├── BUGFIX_README.md                 # Bug修复说明
│   └── PROJECT_INDEX.md                 # 项目索引
│
└── 🛠️ 配置
    ├── .env                             # 环境变量
    ├── requirements.txt                 # 依赖
    └── start.sh                         # 启动脚本
```

---

## 🔧 启动命令

### 启动推荐版本
```bash
streamlit run streamlit_simple.py --server.port 8504
```

### 其他命令
```bash
# 启动选择器
python choose_interface.py

# 启动脚本
./start.sh
```

---

## 🎯 功能特色

### ✅ 已实现
- [x] 结构化提问
- [x] A/B/C/D选项
- [x] 对话历史记录
- [x] 清空对话功能
- [x] 示例需求快速开始
- [x] Accept命令结束对话
- [x] 完整需求分析报告

### 🔄 待实现
- [ ] 对话历史持久化
- [ ] 多轮对话记忆优化
- [ ] 需求导出功能
- [ ] 深色主题

---

## 🐛 已知问题与解决

### 问题1：迭代限制
**现象**：显示 "Agent stopped due to iteration limit or time limit"
**原因**：CrewAI的多Agent迭代机制
**解决**：使用 `streamlit_simple.py`（LangChain直接调用）

### 问题2：响应慢
**原因**：首次调用需要初始化LLM
**解决**：已在代码中添加缓存机制

---

## 📊 提示词设计

### 核心角色
需求澄清助手 - 通过结构化提问帮助用户明确需求

### 工作流程
1. 分析用户初始需求
2. 提出针对性问题（A/B/C/D选项）
3. 根据回答继续深挖
4. 用户说"Accept"时生成汇总报告

### 输出格式
- **问题格式**：编号 + 选项
- **汇总格式**：原始需求 + 关键问答 + 优化需求 + 建议方案

---

## 💻 开发说明

### 环境要求
- Python 3.9.6
- Streamlit 1.50.0
- CrewAI 0.1.32（可选）
- DeepSeek SDK 0.1.1
- LangChain 0.1.0

### 安装依赖
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### 配置API
在 `.env` 文件中设置：
```bash
DEEPSEEK_API_KEY=your_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

---

## 📞 支持与反馈

### 查看文档
```bash
cat QUICKSTART.md        # 快速指南
cat BUGFIX_README.md     # 修复说明
cat PROJECT_INDEX.md     # 文件索引
```

### 测试对话
1. 访问 http://localhost:8504
2. 输入测试需求
3. 体验AI提问过程

---

## 📈 更新日志

### v1.1 (2025-11-05)
- ✅ 修复 CrewAI 迭代限制问题
- ✅ 简化架构，使用 LangChain 直接调用
- ✅ 新增 streamlit_simple.py 版本
- ✅ 添加 BUGFIX_README.md 说明文档

### v1.0 (2025-11-05)
- ✅ 初始版本发布
- ✅ 需求澄清助手核心功能
- ✅ 三个界面版本（简化/完整/极简）

---

## 📄 许可证

MIT License - 详见项目根目录

---

**当前版本**：v1.1（已修复）
**最后更新**：2025-11-05
