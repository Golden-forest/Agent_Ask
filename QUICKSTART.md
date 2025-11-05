# 🚀 需求澄清助手 - 快速启动

## ✅ 当前状态：已修复

**问题**："Agent stopped due to iteration limit or time limit."
**解决**：使用简化架构，避免CrewAI迭代问题

---

## 🎯 立即开始

### 访问地址
**http://localhost:8504**

### 使用方法
1. 描述你的初始想法或需求
2. AI会提出澄清问题（A/B/C/D选项）
3. 选择或自定义回答
4. 继续对话直到需求清晰
5. 输入"Accept"获取完整需求分析

---

## 📋 测试场景

### 示例1：网站项目
**输入**："我想做一个网站，但不知道具体要做什么功能"

**预期**：AI会问类似：
- 网站的主要目标是什么？
  A. 展示产品/服务
  B. 在线销售
  C. 提供资讯
  D. 其他

### 示例2：APP开发
**输入**："我需要开发一个APP，但不确定用户群体"

**预期**：AI会问类似：
- 你的APP主要解决什么问题？
  A. 提高工作效率
  B. 娱乐休闲
  C. 生活服务
  D. 其他

---

## 🛠️ 技术架构

### 当前版本（简化版）
- **框架**：Streamlit + LangChain
- **LLM**：DeepSeek
- **方式**：直接调用，避免CrewAI

### 问题版本（CrewAI版）
- **框架**：Streamlit + CrewAI + LangChain
- **问题**：迭代限制导致中断

---

## 📁 文件结构

```
clarification_agent/
├── streamlit_simple.py         # ✅ 推荐版本（稳定）
├── streamlit_app_v2.py         # ⚠️ 问题版本
├── streamlit_app_fixed.py      # 修复尝试版
├── example_prompt_template.txt # 提示词模板
└── BUGFIX_README.md            # 详细修复说明
```

---

## 🔧 启动命令

### 推荐方式
```bash
streamlit run streamlit_simple.py --server.port 8504
```

### 其他方式
```bash
# 完整版（有问题）
streamlit run streamlit_app_v2.py

# 极简版
streamlit run simple_chat.py
```

---

## 💡 使用提示

### 1. 如何结束对话？
输入 `Accept`（注意大小写）

### 2. 如何获得最佳效果？
- 提供尽可能多的初始信息
- 认真回答每个问题
- 选择合适的选项

### 3. 如何开始新对话？
点击"清空对话"按钮

---

## 📞 支持

- 查看 `BUGFIX_README.md` 了解技术细节
- 查看 `example_prompt_template.txt` 了解AI工作方式
- 查看控制台输出了解运行状态

---

**当前版本：v1.1（已修复）**
**更新日期：2025-11-05**
