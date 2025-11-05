# 🤖 智能澄清Agent - Streamlit界面使用指南

## 📋 项目概述

本项目提供两个版本的Streamlit前端界面，集成CrewAI和模板化提示词，实现专业AI对话助手。

---

## 🚀 快速开始

### 1. 激活环境

```bash
cd /Users/hl/Projects/Agent/clarification_agent
source venv/bin/activate
```

### 2. 启动应用

有三种启动方式：

#### 方式一：使用启动脚本（推荐）
```bash
./start.sh
```

#### 方式二：直接启动完整版
```bash
streamlit run streamlit_app.py
```

#### 方式三：启动极简版
```bash
streamlit run simple_chat.py
```

### 3. 访问界面

打开浏览器访问：**http://localhost:8501**

---

## 📱 界面版本对比

### 🔹 完整版 (`streamlit_app.py`)

**特点：**
- ✅ 现代化设计
- ✅ 侧边栏示例问题
- ✅ 对话管理功能
- ✅ 清空对话按钮
- ✅ 响应式布局

**适合：** 正式使用，功能完整

---

### 🔸 极简版 (`simple_chat.py`)

**特点：**
- ✅ 极简设计
- ✅ 纯对话界面
- ✅ 去除所有装饰元素
- ✅ 快速响应

**适合：** 快速测试，极简体验

---

## 🎯 使用方法

### 1. 发送消息

在底部输入框输入问题，按回车发送

### 2. 查看历史

所有对话历史会自动保存，可滚动查看

### 3. 清空对话

点击"清空对话"按钮重置会话

### 4. 使用示例

**完整版提供预设示例问题：**
- 如何优化这段Python代码的性能？
- 请解释一下装饰器的原理
- 帮我设计一个RESTful API架构
- 什么是异步编程？给个例子
- 如何避免SQL注入攻击？

---

## 🧪 测试功能

### 运行自动化测试

```bash
# 非交互式测试（推荐）
python test_streamlit_non_interactive.py

# 交互式测试
python test_streamlit_agent.py
```

**测试包括：**
- Agent响应功能
- 提示词加载
- 对话质量
- 错误处理

---

## 📂 文件结构

```
clarification_agent/
├── streamlit_app.py           # 完整版界面
├── simple_chat.py            # 极简版界面
├── start.sh                  # 启动脚本
├── example_prompt_template.txt # 提示词模板
├── test_streamlit_non_interactive.py # 测试脚本
└── README_STREAMLIT.md       # 本文档
```

---

## ⚙️ 核心配置

### LLM配置

在 `.env` 文件中：

```bash
DEEPSEEK_API_KEY=your_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

### 提示词模板

文件：`example_prompt_template.txt`

包含：
- 身份与角色
- 核心能力
- 对话原则
- 输出格式
- 示例对话

---

## 🔧 高级功能

### 1. 缓存机制

- `st.cache_resource` 缓存LLM实例
- `st.cache_resource` 缓存Agent实例
- 避免重复创建，提高性能

### 2. 错误处理

- 自动捕获API错误
- 用户友好的错误提示
- 重试机制

### 3. 响应优化

- 流式响应显示
- 加载状态提示
- 实时交互

---

## 📊 性能指标

**测试结果：**

| 测试项 | 状态 | 详情 |
|--------|------|------|
| 装饰器问题 | ✅ 通过 | 1983字符详细回复 |
| 性能优化 | ✅ 通过 | 2372字符深度分析 |
| RESTful原则 | ✅ 通过 | 1372字符专业解释 |
| 总体成功率 | ✅ 100% | 3/3 测试通过 |

---

## 🎨 界面预览

### 完整版
- 居中布局
- 现代化标题
- 侧边栏功能区
- 示例问题按钮

### 极简版
- 极简设计
- 纯聊天界面
- 清空按钮

---

## 💡 使用技巧

### 1. 获得最佳回答

**清晰具体的问题：**
- ❌ "告诉我Python"
- ✅ "请解释Python装饰器的工作原理，并给出实际应用场景的例子"

**包含上下文：**
- 说明你的背景（初学者/有经验）
- 指定回答深度
- 提出具体需求

### 2. 追问技巧

- 基于前一个回答继续提问
- 要求澄清具体点
- 让AI提供更多示例

---

## 🚨 常见问题

### Q: 页面无法访问？
A: 检查端口8501是否被占用，或尝试：
```bash
streamlit run streamlit_app.py --server.port 8502
```

### Q: AI响应很慢？
A: 首次响应会慢一些（需要初始化LLM），后续会更快

### Q: 如何修改提示词？
A: 编辑 `example_prompt_template.txt` 文件，然后重启应用

### Q: 可以自定义界面吗？
A: 可以！修改 `streamlit_app.py` 中的样式和布局代码

---

## 🔄 后续开发

**计划功能：**
- [ ] 多轮对话记忆
- [ ] 对话历史导出
- [ ] 深色主题
- [ ] 代码高亮
- [ ] 文件上传
- [ ] 图片生成
- [ ] 多Agent协作

---

## 📞 支持

如有问题或建议，请查看：
- 项目根目录 `CLAUDE.md`
- 提示词效果报告 `prompt_comparison_report.md`

---

**祝使用愉快！🎉**
