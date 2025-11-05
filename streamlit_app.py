"""
智能澄清Agent - 简约版Streamlit界面
使用CrewAI + 模板化提示词实现专业对话助手
"""

import os
import streamlit as st
from dotenv import load_dotenv
from crewai import Agent, Task, Crew
from langchain_openai import ChatOpenAI
import time

load_dotenv()

# 设置页面配置
st.set_page_config(
    page_title="智能澄清Agent",
    page_icon="🤖",
    layout="centered",
    initial_sidebar_state="collapsed"  # 隐藏侧边栏，更简约
)

# 设置LLM
@st.cache_resource
def get_llm():
    """缓存LLM实例，避免重复创建"""
    return ChatOpenAI(
        model="deepseek-chat",
        openai_api_key=os.getenv("DEEPSEEK_API_KEY"),
        openai_api_base=os.getenv("DEEPSEEK_BASE_URL"),
    )


def load_prompt_from_file(file_path: str) -> str:
    """从文件加载提示词模板"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        return "你是一个专业的编程助手，擅长解决各种技术问题。"


@st.cache_resource
def create_conversation_agent():
    """创建对话Agent（缓存以提高性能）"""
    # 加载提示词模板
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
        # 创建任务
        task = Task(
            description=f'用户询问：{user_input}',
            agent=agent,
            expected_output='提供专业、详细的回答，包含代码示例和解释'
        )

        # 创建Crew并执行
        crew = Crew(
            agents=[agent],
            tasks=[task],
            verbose=False
        )

        # 执行并返回结果
        result = crew.kickoff()
        return result
    except Exception as e:
        return f"抱歉，发生了错误：{str(e)}"


def main():
    """主界面"""

    # 标题和介绍
    st.title("🤖 需求澄清助手")
    st.markdown("---")
    st.markdown(
        """
        <div style='text-align: center; color: #666; padding: 20px;'>
            <p style='font-size: 18px;'>通过有针对性的提问，帮助您明确真实需求</p>
        </div>
        """,
        unsafe_allow_html=True
    )

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

    # 创建Agent
    agent = create_conversation_agent()

    # 显示聊天历史
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.write(message["content"])

    # 用户输入
    if prompt := st.chat_input("请描述你的需求或想法..."):
        # 添加用户消息到历史
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.write(prompt)

        # 获取AI回复
        with st.chat_message("assistant"):
            with st.spinner("思考中..."):
                response = get_ai_response(prompt, agent)

            # 显示回复
            st.write(response)

            # 添加AI回复到历史
            st.session_state.messages.append({
                "role": "assistant",
                "content": response
            })

    # 侧边功能按钮
    with st.sidebar:
        st.markdown("## 功能")
        if st.button("🗑️ 清空对话", use_container_width=True):
            st.session_state.messages = [
                {
                    "role": "assistant",
                    "content": "👋 你好！我是你的编程助手。有什么问题可以帮助你吗？"
                }
            ]
            st.rerun()

        st.markdown("---")
        st.markdown("## 示例需求")

        example_questions = [
            "我想做一个网站，但不知道具体要做什么功能",
            "我需要开发一个APP，但不确定用户群体和使用场景",
            "我想做一个数据分析项目，但没有明确分析什么",
            "我需要优化业务流程，但不知道从哪入手",
            "我计划做一个创业项目，但需求还不够清晰",
        ]

        for question in example_questions:
            if st.button(question, key=question):
                # 自动填入问题
                prompt = question
                st.session_state.messages.append({"role": "user", "content": prompt})
                with st.chat_message("user"):
                    st.write(prompt)

                with st.chat_message("assistant"):
                    with st.spinner("思考中..."):
                        response = get_ai_response(prompt, agent)
                    st.write(response)
                    st.session_state.messages.append({
                        "role": "assistant",
                        "content": response
                    })
                st.rerun()

    # 页脚
    st.markdown("---")
    st.markdown(
        """
        <div style='text-align: center; color: #888; font-size: 12px; padding: 10px;'>
            Powered by CrewAI + DeepSeek | 智能澄清Agent v1.0
        </div>
        """,
        unsafe_allow_html=True
    )


if __name__ == "__main__":
    main()
