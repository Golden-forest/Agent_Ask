"""
需求澄清助手 - 简化版
使用LangChain直接调用，避免CrewAI迭代问题
"""

import os
import streamlit as st
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv()

# 设置页面配置
st.set_page_config(
    page_title="需求澄清助手",
    page_icon="🤖",
    layout="centered"
)

# 设置LLM
@st.cache_resource
def get_llm():
    """缓存LLM实例"""
    return ChatOpenAI(
        model="deepseek-chat",
        openai_api_key=os.getenv("DEEPSEEK_API_KEY"),
        openai_api_base=os.getenv("DEEPSEEK_BASE_URL"),
    )


def load_prompt():
    """加载提示词"""
    try:
        with open('example_prompt_template.txt', 'r', encoding='utf-8') as f:
            return f.read()
    except:
        return "你是一个需求澄清助手，通过提问帮助用户明确需求。"


def get_response(user_input, conversation_history):
    """获取AI回复"""
    llm = get_llm()
    prompt_template = load_prompt()

    # 构建完整对话历史
    history_text = ""
    if conversation_history:
        history_text = "\n\n=== 对话历史 ===\n"
        for msg in conversation_history:
            if msg['role'] == 'user':
                history_text += f"用户: {msg['content']}\n"
            else:
                history_text += f"助手: {msg['content']}\n"
        history_text += "=== 历史结束 ===\n\n"

    full_prompt = f"""{prompt_template}

{history_text}用户当前输入：{user_input}

请根据对话历史和用户当前输入，生成适当的回复。
- 如果这是初始需求，请提出第一个澄清问题
- 如果用户在回答问题，请基于回答提出下一个问题
- 如果用户说"Accept"，请生成完整的需求分析报告

开始回复：
"""

    try:
        response = llm.invoke(full_prompt)
        return response.content
    except Exception as e:
        return f"处理请求时出错：{str(e)}"


def main():
    """主界面"""

    # 标题
    st.title("🤖 需求澄清助手")
    st.markdown("通过有针对性的提问，帮助您明确真实需求")
    st.markdown("---")

    # 初始化会话状态
    if "messages" not in st.session_state:
        st.session_state.messages = []

    # 显示欢迎信息
    if not st.session_state.messages:
        st.info(
            "👋 欢迎使用需求澄清助手！\n\n"
            "💡 **使用方式：**\n"
            "1. 描述你的初始想法或需求\n"
            "2. 我会提出关键问题帮助你澄清\n"
            "3. 提供A/B/C/D选项供你选择\n"
            "4. 输入\"Accept\"获取完整的需求分析\n\n"
            "请开始描述你的需求吧！"
        )

    # 显示聊天历史
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

    # 用户输入
    if prompt := st.chat_input("💬 请描述你的需求或想法..."):
        # 添加用户消息
        st.session_state.messages.append({"role": "user", "content": prompt})

        # 显示用户消息
        with st.chat_message("user"):
            st.markdown(prompt)

        # 获取AI回复
        with st.chat_message("assistant"):
            with st.spinner("🤔 AI正在分析..."):
                response = get_response(prompt, st.session_state.messages)
                st.markdown(response)

        # 添加AI回复到历史
        st.session_state.messages.append({"role": "assistant", "content": response})

    # 清空按钮
    col1, col2, col3 = st.columns([1, 1, 1])
    with col3:
        if st.button("🗑️ 清空对话", type="secondary"):
            st.session_state.messages = []
            st.rerun()

    # 示例需求（侧边栏风格）
    st.markdown("---")
    st.markdown("### 💡 示例需求")
    st.markdown("点击下方按钮快速体验：")

    example_buttons = [
        "我想做一个网站，但不知道具体要做什么功能",
        "我需要开发一个APP，但不确定用户群体",
        "我想做一个数据分析项目，但没有明确分析什么",
        "我计划做一个创业项目，但需求还不够清晰",
    ]

    cols = st.columns(2)
    for i, example in enumerate(example_buttons):
        with cols[i % 2]:
            if st.button(example, key=f"example_{i}"):
                prompt = example
                st.rerun()


if __name__ == "__main__":
    main()
