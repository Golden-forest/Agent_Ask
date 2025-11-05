"""
智能澄清Agent - 美化版Streamlit界面
使用自定义样式，提供更好的用户体验
"""

import os
import streamlit as st
from dotenv import load_dotenv
from crewai import Agent, Task, Crew
from langchain_openai import ChatOpenAI
from streamlit_ui_config import (
    apply_custom_style,
    create_header,
    create_sidebar,
    create_footer,
    show_success_message
)

load_dotenv()

# 应用自定义样式
apply_custom_style()

# 设置LLM
@st.cache_resource
def get_llm():
    """缓存LLM实例"""
    return ChatOpenAI(
        model="deepseek-chat",
        openai_api_key=os.getenv("DEEPSEEK_API_KEY"),
        openai_api_base=os.getenv("DEEPSEEK_BASE_URL"),
    )


def load_prompt_from_file(file_path: str) -> str:
    """加载提示词模板"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        return "你是一个专业的编程助手，擅长解决各种技术问题。"


@st.cache_resource
def create_conversation_agent():
    """创建对话Agent（缓存）"""
    prompt_content = load_prompt_from_file('example_prompt_template.txt')

    agent = Agent(
        role='Claude Code编程助手',
        goal='帮助用户解决编程问题，提供高质量的代码和解决方案',
        backstory=prompt_content,
        verbose=False,
        llm=get_llm(),
        allow_delegation=False
    )
    return agent


def get_ai_response(user_input: str, agent):
    """获取AI回复"""
    try:
        task = Task(
            description=f'用户询问：{user_input}',
            agent=agent,
            expected_output='提供专业、详细的回答，包含代码示例和解释'
        )

        crew = Crew(
            agents=[agent],
            tasks=[task],
            verbose=False
        )

        result = crew.kickoff()
        return result, True
    except Exception as e:
        return f"抱歉，发生了错误：{str(e)}", False


def main():
    """主界面"""

    # 创建头部
    create_header(
        title="🤖 需求澄清助手",
        subtitle="通过有针对性的提问，帮助您明确真实需求"
    )

    # 创建Agent
    agent = create_conversation_agent()

    # 创建侧边栏
    example_questions = create_sidebar()

    # 初始化会话状态
    if "messages" not in st.session_state:
        st.session_state.messages = [
            {
                "role": "assistant",
                "content": "👋 你好！我是需求澄清助手。\n\n"
                          "我将通过有针对性的提问，帮助你明确和澄清真实需求。\n\n"
                          "💡 **使用方式：**\n"
                          "1. 请描述你的初始想法或需求\n"
                          "2. 我会提出关键问题帮助你澄清\n"
                          "3. 提供A/B/C/D选项供你选择\n"
                          "4. 当需求足够清晰时，输入\"Accept\"获取完整的需求分析\n\n"
                          "请开始描述你的需求吧！"
            }
        ]

    # 显示聊天历史
    chat_container = st.container()
    with chat_container:
        for i, message in enumerate(st.session_state.messages):
            with st.chat_message(message["role"]):
                # 格式化输出，保留Markdown
                st.markdown(message["content"])

    # 用户输入区域
    prompt = st.chat_input("💬 请描述你的需求或想法...")

    # 处理用户输入
    if prompt:
        # 添加用户消息
        st.session_state.messages.append({"role": "user", "content": prompt})

        # 显示用户消息
        with st.chat_message("user"):
            st.markdown(prompt)

        # 获取AI回复
        with st.chat_message("assistant"):
            with st.spinner("🤔 AI正在思考..."):
                response, success = get_ai_response(prompt, agent)

            if success:
                # 显示回复
                st.markdown(response)

                # 添加AI回复到历史
                st.session_state.messages.append({
                    "role": "assistant",
                    "content": response
                })
            else:
                st.error(response)

        # 重新运行以刷新界面
        st.rerun()

    # 示例问题区域（可选展开）
    with st.expander("💡 查看示例需求", expanded=False):
        st.markdown("点击下方需求快速开始澄清：")
        for i, question in enumerate(example_questions, 1):
            if st.button(f"{i}. {question}", key=f"example_{i}"):
                # 模拟点击问题
                prompt = question
                st.rerun()

    # 添加快捷操作
    col1, col2, col3 = st.columns([1, 1, 1])

    with col1:
        if st.button("🗑️ 清空对话", type="secondary", use_container_width=True):
            st.session_state.messages = [
                {
                    "role": "assistant",
                    "content": "✅ 对话已清空。有什么新问题吗？"
                }
            ]
            show_success_message("对话历史已清空")
            st.rerun()

    with col2:
        if st.button("📊 查看统计", type="secondary", use_container_width=True):
            msg_count = len(st.session_state.messages)
            st.info(f"当前对话共 {msg_count} 条消息")

    with col3:
        if st.button("📝 导出对话", type="secondary", use_container_width=True):
            # 创建对话文本
            chat_text = "\n\n".join([
                f"{'用户' if msg['role'] == 'user' else 'AI助手'}:\n{msg['content']}"
                for msg in st.session_state.messages
            ])

            # 提供下载
            st.download_button(
                label="💾 下载对话记录",
                data=chat_text,
                file_name=f"chat_history_{len(st.session_state.messages)}_messages.txt",
                mime="text/plain",
                use_container_width=True
            )

    # 创建页脚
    create_footer()


if __name__ == "__main__":
    main()
