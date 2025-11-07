"""
Streamlit界面配置和样式
统一管理所有样式设置
"""

import streamlit as st

def apply_custom_style():
    """应用自定义CSS样式"""
    st.markdown(
        """
        <style>
        /* 全局样式 */
        .main {
            padding-top: 2rem;
        }

        /* 标题样式 */
        .title {
            text-align: center;
            color: #1f77b4;
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
        }

        /* 消息气泡样式 */
        .chat-message {
            padding: 1rem;
            border-radius: 0.5rem;
            margin-bottom: 1rem;
        }

        .user-message {
            background-color: #e3f2fd;
            border-left: 4px solid #2196f3;
        }

        .assistant-message {
            background-color: #f5f5f5;
            border-left: 4px solid #4caf50;
        }

        /* 输入框样式 */
        .stTextInput > div > div > input {
            border-radius: 20px;
            padding: 10px 15px;
        }

        /* 按钮样式 */
        .stButton > button {
            border-radius: 20px;
            padding: 0.5rem 2rem;
            border: none;
            background-color: #1f77b4;
            color: white;
        }

        .stButton > button:hover {
            background-color: #1565c0;
        }

        /* 侧边栏样式 */
        .sidebar .sidebar-content {
            padding: 2rem 1rem;
        }

        /* 加载动画 */
        .spinner {
            text-align: center;
            padding: 2rem;
        }
        </style>
        """,
        unsafe_allow_html=True
    )


def create_header(title="🤖 智能澄清Agent", subtitle="专业的编程助手"):
    """创建页面头部"""
    st.markdown(
        f"""
        <h1 style='text-align: center; color: #1f77b4; margin-bottom: 0;'>
            {title}
        </h1>
        <p style='text-align: center; color: #666; margin-top: 0.5rem;'>
            {subtitle}
        </p>
        <hr style='margin: 1rem 0;'>
        """,
        unsafe_allow_html=True
    )


def create_footer():
    """创建页脚"""
    st.markdown(
        """
        <hr style='margin: 2rem 0 1rem 0;'>
        <p style='text-align: center; color: #888; font-size: 0.8rem;'>
            Powered by CrewAI + DeepSeek | 智能澄清Agent v1.0
        </p>
        """,
        unsafe_allow_html=True
    )


def show_success_message(message):
    """显示成功消息"""
    st.success(message)


def show_error_message(message):
    """显示错误消息"""
    st.error(message)


def create_sidebar():
    """创建侧边栏（可复用）"""
    with st.sidebar:
        st.markdown("## 功能")

        # 清空对话按钮
        if st.button("🗑️ 清空对话", use_container_width=True):
            st.session_state.messages = [
                {
                    "role": "assistant",
                    "content": "👋 你好！我是需求澄清助手。\n\n"
                              "我将通过有针对性的提问，帮助你明确和澄清真实需求。\n\n"
                              "请开始描述你的需求吧！"
                }
            ]
            st.rerun()

        st.markdown("---")

        # 示例问题
        st.markdown("## 💡 示例需求")

        example_questions = [
            "我想做一个网站，但不知道具体要做什么功能",
            "我需要开发一个APP，但不确定用户群体和使用场景",
            "我想做一个数据分析项目，但没有明确分析什么",
            "我需要优化业务流程，但不知道从哪入手",
            "我计划做一个创业项目，但需求还不够清晰",
        ]

        return example_questions


def display_message(role, content):
    """显示消息（带样式）"""
    if role == "user":
        st.markdown(
            f"""
            <div class='chat-message user-message'>
                <strong>👤 您:</strong><br>
                {content}
            </div>
            """,
            unsafe_allow_html=True
        )
    else:
        st.markdown(
            f"""
            <div class='chat-message assistant-message'>
                <strong>🤖 助手:</strong><br>
                {content}
            </div>
            """,
            unsafe_allow_html=True
        )


def format_code_block(code, language="python"):
    """格式化代码块"""
    return f"""
    <div style='background-color: #282c34; color: #abb2bf; padding: 1rem;
                border-radius: 0.5rem; margin: 0.5rem 0;'>
        <pre style='margin: 0;'><code>{code}</code></pre>
    </div>
    """


def show_metrics(metrics):
    """显示性能指标"""
    st.markdown("### 📊 性能指标")
    for key, value in metrics.items():
        st.metric(label=key, value=value)
