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
        with open('prompt.txt', 'r', encoding='utf-8') as f:
            return f.read()
    except:
        return "你是一个需求澄清助手，通过提问帮助用户明确需求。"


def extract_optimized_requirement(content):
    """提取优化后的需求部分"""
    lines = content.split('\n')
    result_lines = []
    in_optimized_section = False

    for line in lines:
        if '## 优化后的需求' in line:
            in_optimized_section = True
            result_lines.append(line)
        elif in_optimized_section:
            if line.startswith('## '):
                # 遇到下一个二级标题，停止
                break
            result_lines.append(line)

    if result_lines:
        return '\n'.join(result_lines).strip()
    return None


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
    for i, message in enumerate(st.session_state.messages):
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

            # 如果是AI回复且包含优化后的需求，添加复制按钮
            if message["role"] == "assistant":
                optimized_req = extract_optimized_requirement(message["content"])
                if optimized_req:
                    col1, col2 = st.columns([1, 1])
                    with col2:
                        if st.button("📋 复制优化结果", key=f"copy_history_{i}"):
                            # 展开可复制的文本
                            with st.expander("点击展开复制文本", expanded=True):
                                st.code(optimized_req, language="text")
                                st.caption("💡 请选择上方文本并按 Ctrl+C（或 Cmd+C）复制")

    # 添加CSS样式
    st.markdown("""
    <style>
    .stButton > button {
        border-radius: 6px;
        border: 1px solid #e0e0e0;
        padding: 0.3rem 0.8rem;
        font-size: 0.8rem;
        height: 36px;
        transition: all 0.2s;
    }
    .stButton > button:hover {
        border-color: #4A90E2;
        box-shadow: 0 2px 8px rgba(74, 144, 226, 0.2);
    }
    </style>
    """, unsafe_allow_html=True)

    # 快捷按钮区域 - 放在输入框上方
    cols = st.columns([1, 1, 1, 1, 1, 2])

    with cols[0]:
        if st.button("A", use_container_width=True):
            st.session_state.quick_input = "A"
            st.rerun()

    with cols[1]:
        if st.button("B", use_container_width=True):
            st.session_state.quick_input = "B"
            st.rerun()

    with cols[2]:
        if st.button("C", use_container_width=True):
            st.session_state.quick_input = "C"
            st.rerun()

    with cols[3]:
        if st.button("D", use_container_width=True):
            st.session_state.quick_input = "D"
            st.rerun()

    with cols[4]:
        if st.button("Accept", use_container_width=True):
            st.session_state.quick_input = "Accept"
            st.rerun()

    # 清空对话按钮
    with cols[5]:
        if st.button("🗑️ 清空对话", use_container_width=True):
            st.session_state.messages = []
            st.rerun()

    # 处理快捷输入
    if "quick_input" in st.session_state:
        quick_input = st.session_state.quick_input
        del st.session_state.quick_input

        # 添加用户消息
        st.session_state.messages.append({"role": "user", "content": quick_input})

        # 显示用户消息
        with st.chat_message("user"):
            st.markdown(quick_input)

        # 获取AI回复
        with st.chat_message("assistant"):
            with st.spinner("🤔 AI正在分析..."):
                response = get_response(quick_input, st.session_state.messages)
                st.markdown(response)

            # 检查是否有优化后的需求，并添加复制按钮
            optimized_req = extract_optimized_requirement(response)
            if optimized_req:
                col1, col2 = st.columns([1, 1])
                with col2:
                    if st.button("📋 复制优化结果", key=f"copy_{len(st.session_state.messages)}"):
                        with st.expander("点击展开复制文本", expanded=True):
                            st.code(optimized_req, language="text")
                            st.caption("💡 请选择上方文本并按 Ctrl+C（或 Cmd+C）复制")

        # 添加AI回复到历史
        st.session_state.messages.append({"role": "assistant", "content": response})

    # 用户输入
    if prompt := st.chat_input("请输入需求..."):
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

            # 检查是否有优化后的需求，并添加复制按钮
            optimized_req = extract_optimized_requirement(response)
            if optimized_req:
                col1, col2 = st.columns([1, 1])
                with col2:
                    if st.button("📋 复制优化结果", key=f"copy_manual_{len(st.session_state.messages)}"):
                        with st.expander("点击展开复制文本", expanded=True):
                            st.code(optimized_req, language="text")
                            st.caption("💡 请选择上方文本并按 Ctrl+C（或 Cmd+C）复制")

        # 添加AI回复到历史
        st.session_state.messages.append({"role": "assistant", "content": response})


if __name__ == "__main__":
    main()
