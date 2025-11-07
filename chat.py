"""
极简聊天界面 - 纯对话版本
去除所有装饰，专注于对话本身
"""

import os
import streamlit as st
from dotenv import load_dotenv
from crewai import Agent, Task, Crew
from langchain_openai import ChatOpenAI

load_dotenv()

# 极简页面配置
st.set_page_config(
    page_title="AI Chat",
    page_icon="🤖",
    layout="centered"
)

# LLM
llm = ChatOpenAI(
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
        return "你是一个专业的编程助手。"


def get_response(user_input):
    """获取AI回复"""
    prompt = load_prompt()
    agent = Agent(
        role='AI助手',
        goal='提供专业回答',
        backstory=prompt,
        verbose=False,
        llm=llm
    )

    task = Task(
        description=f'用户问题：{user_input}',
        agent=agent,
        expected_output='专业详细的回答'
    )

    crew = Crew(agents=[agent], tasks=[task], verbose=False)
    return crew.kickoff()


# 标题
st.title("🤖 需求澄清助手")

# 初始化对话历史
if "chat" not in st.session_state:
    st.session_state.chat = []

# 显示对话
for msg in st.session_state.chat:
    st.chat_message(msg["role"]).write(msg["content"])

# 用户输入
if user_input := st.chat_input():
    # 用户消息
    st.chat_message("user").write(user_input)
    st.session_state.chat.append({"role": "user", "content": user_input})

    # AI回复
    with st.chat_message("assistant"):
        with st.spinner("思考中..."):
            response = get_response(user_input)
        st.write(response)

    st.session_state.chat.append({"role": "assistant", "content": response})

# 清空按钮
col1, col2 = st.columns([1, 1])
with col2:
    if st.button("清空对话", type="secondary"):
        st.session_state.chat = []
        st.rerun()
