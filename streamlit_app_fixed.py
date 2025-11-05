"""
需求澄清助手 - 修复版
解决Agent迭代限制问题
"""

import os
import streamlit as st
from dotenv import load_dotenv
from crewai import Agent, Task
from langchain_openai import ChatOpenAI

load_dotenv()

# 应用自定义样式
st.markdown(
    """
    <style>
    .main {
        padding-top: 2rem;
    }
    .title {
        text-align: center;
        color: #1f77b4;
        font-size: 2.5rem;
        font-weight: bold;
        margin-bottom: 1rem;
    }
    </style>
    """,
    unsafe_allow_html=True
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


def load_prompt_from_file(file_path: str) -> str:
    """加载提示词模板"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        return "你是一个需求澄清助手，通过提问帮助用户明确需求。"


@st.cache_resource
def create_conversation_agent():
    """创建对话Agent（缓存）"""
    prompt_content = load_prompt_from_file('example_prompt_template.txt')

    agent = Agent(
        role='需求澄清助手',
        goal='通过提问帮助用户澄清真实需求',
        backstory=prompt_content,
        verbose=False,
        llm=get_llm(),
        allow_delegation=False,
        max_iter=50  # 增加最大迭代次数
    )
    return agent


def get_ai_response(user_input: str, agent):
    """获取AI回复 - 使用单Agent模式避免迭代问题"""
    try:
        # 创建任务
        task = Task(
            description=f'用户初始需求：{user_input}\n\n请作为需求澄清助手，提出第一个关键问题来帮助用户澄清需求。提供A、B、C、D四个选项供用户选择。',
            agent=agent,
            expected_output='提出一个针对性的问题，包含A/B/C/D四个选项'
        )

        # 直接使用agent执行任务，不使用Crew
        result = agent.tools_executor.run(task=task)
        return result, True
    except Exception as e:
        return f"处理请求时出错：{str(e)}", False


def main():
    """主界面"""

    # 标题
    st.markdown(
        """
        <h1 style='text-align: center; color: #1f77b4; margin-bottom: 0;'>
            🤖 需求澄清助手
        </h1>
        <p style='text-align: center; color: #666; margin-top: 0.5rem;'>
            通过有针对性的提问，帮助您明确真实需求
        </p>
        <hr style='margin: 1rem 0;'>
        """,
        unsafe_allow_html=True
    )

    # 创建Agent
    agent = create_conversation_agent()

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
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

    # 用户输入
    if prompt := st.chat_input("💬 请描述你的需求或想法..."):
        # 添加用户消息
        st.session_state.messages.append({"role": "user", "content": prompt})

        with st.chat_message("user"):
            st.markdown(prompt)

        # 获取AI回复
        with st.chat_message("assistant"):
            with st.spinner("🤔 AI正在分析需求..."):
                try:
                    # 使用Agent直接执行任务
                    llm = get_llm()
                    prompt_content = load_prompt_from_file('example_prompt_template.txt')

                    full_prompt = f"""{prompt_content}

用户需求：{prompt}

请分析这个需求，并提出第一个关键问题来帮助用户澄清需求。确保只提出一个问题，并提供A、B、C、D四个选项供用户选择。

如果这是用户的初始需求，请提出第一个问题。
如果用户是在回答之前的问题，请基于用户的回答提出下一个问题。
如果用户输入"Accept"，请停止提问，并生成完整的需求分析报告（按markdown格式，包含原始需求、关键问答、优化后的需求、建议实现方案）。

开始：
"""

                    response = llm.invoke(full_prompt)
                    response_text = response.content

                    # 显示回复
                    st.markdown(response_text)

                    # 添加AI回复到历史
                    st.session_state.messages.append({
                        "role": "assistant",
                        "content": response_text
                    })

                except Exception as e:
                    st.error(f"处理请求时出错：{str(e)}")

        # 重新运行以刷新界面
        st.rerun()

    # 清空按钮
    if st.button("🗑️ 清空对话", type="secondary"):
        st.session_state.messages = [
            {
                "role": "assistant",
                "content": "✅ 对话已清空。有什么新需求需要澄清吗？"
            }
        ]
        st.rerun()

    # 页脚
    st.markdown(
        """
        <hr style='margin: 2rem 0 1rem 0;'>
        <p style='text-align: center; color: #888; font-size: 0.8rem;'>
            Powered by CrewAI + DeepSeek | 需求澄清助手 v1.0
        </p>
        """,
        unsafe_allow_html=True
    )


if __name__ == "__main__":
    main()
