"""
极简主义UI组件库
类似DeepSeek的简洁设计风格 - 专注于核心交互
固定深色模式，无主题切换功能
"""

import streamlit as st


def apply_minimal_style():
    """应用极简主义深色模式样式系统"""

    minimal_css = """
    <style>
    /* 极简主义全局样式 - 固定深色模式 */
    .stApp {
        background: #1A202C;
        color: #E2E8F0;
    }

    /* 隐藏所有装饰元素 */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    .stDeployButton {display:none;}
    .stHeader {display: none;}

    /* 主容器 - 居中布局 */
    .main .block-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem 1rem;
        background: transparent;
    }

    /* 标题 - 极简风格 */
    h1 {
        color: #E2E8F0;
        font-size: 32px;
        font-weight: 600;
        text-align: center;
        margin-bottom: 3rem;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    /* 移除所有卡片装饰 */
    .element-container {
        background: transparent;
        border: none;
        box-shadow: none;
        padding: 0;
        margin: 0;
    }

    /* 极简输入框样式 */
    .stTextInput > div > div > input,
    .stTextArea > div > div > textarea {
        border: 1px solid #4A5568;
        border-radius: 8px;
        padding: 16px;
        font-size: 16px;
        background: #2D3748;
        color: #E2E8F0;
        transition: all 0.3s ease;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .stTextInput > div > div > input:focus,
    .stTextArea > div > div > textarea:focus {
        border-color: #4299E1;
        outline: none;
        box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
    }

    /* 极简按钮样式 */
    .stButton > button {
        background: #2D3748;
        color: #E2E8F0;
        border: none;
        border-radius: 8px;
        padding: 12px 24px;
        font-size: 16px;
        font-weight: 500;
        transition: all 0.3s ease;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        min-height: 48px;
    }

    .stButton > button:hover {
        background: #4A5568;
        transform: translateY(-1px);
    }

    /* 次要按钮 */
    .stButton.secondary > button {
        background: transparent;
        color: #E2E8F0;
        border: 1px solid #4A5568;
    }

    .stButton.secondary > button:hover {
        background: #2D3748;
    }

    /* 消息显示 - 极简风格 */
    .minimal-message {
        padding: 16px 0;
        margin: 8px 0;
        border-bottom: 1px solid #4A5568;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        line-height: 1.6;
    }

    .minimal-message:last-child {
        border-bottom: none;
    }

    .minimal-user-message {
        text-align: right;
        color: #E2E8F0;
    }

    .minimal-assistant-message {
        text-align: left;
        color: #CBD5E0;
    }

    .minimal-message-role {
        font-size: 12px;
        font-weight: 600;
        color: #718096;
        margin-bottom: 4px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    /* 隐藏侧边栏 */
    .css-1d391kg, .css-1lcbmhc {
        display: none;
    }

    /* 移除所有分割线和装饰 */
    hr {
        display: none;
    }

    .streamlit-expanderHeader {
        background: transparent;
        border: none;
    }

    /* 极简选择框 */
    .stSelectbox > div > div > select {
        border: 1px solid #4A5568;
        border-radius: 8px;
        padding: 12px;
        font-size: 16px;
        background: #2D3748;
        color: #E2E8F0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        transition: all 0.3s ease;
    }

    /* 移除所有卡片样式 */
    .stDataFrame {
        border: none;
        box-shadow: none;
    }

    .stMetric {
        background: transparent;
        border: none;
        box-shadow: none;
        padding: 0;
    }

    /* 极简提示框 */
    .stSuccess, .stError, .stWarning, .stInfo {
        border-radius: 8px;
        border: 1px solid #4A5568;
        background: #2D3748;
        color: #E2E8F0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        transition: all 0.3s ease;
    }

    /* 响应式设计 */
    @media (max-width: 768px) {
        .main .block-container {
            padding: 1rem 0.5rem;
        }

        h1 {
            font-size: 24px;
            margin-bottom: 2rem;
        }

        .stButton > button {
            font-size: 14px;
            padding: 10px 16px;
        }

        .minimal-message {
            padding: 12px 0;
        }
    }

    /* 移除所有Streamlit默认装饰 */
    .stApp > div {
        background: transparent;
    }

    /* 聚焦状态 - 无装饰 */
    :focus {
        outline: none;
    }

    /* 极简文字样式 */
    p, div, span {
        color: #E2E8F0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        line-height: 1.6;
    }

    /* 代码样式 */
    code {
        background: #2D3748;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: "SF Mono", Monaco, Consolas, monospace;
        font-size: 14px;
        color: #E2E8F0;
        transition: all 0.3s ease;
    }

    pre {
        background: #2D3748;
        padding: 16px;
        border-radius: 8px;
        overflow-x: auto;
        border: 1px solid #4A5568;
        transition: all 0.3s ease;
    }

    pre code {
        background: none;
        padding: 0;
    }

    /* 快捷按钮 - 极简风格 */
    .quick-actions {
        display: flex;
        gap: 8px;
        margin: 16px 0;
        flex-wrap: wrap;
        justify-content: center;
    }

    .quick-action-btn {
        background: #2D3748;
        border: 1px solid #4A5568;
        border-radius: 8px;
        padding: 8px 16px;
        font-size: 14px;
        color: #E2E8F0;
        cursor: pointer;
        transition: all 0.3s ease;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .quick-action-btn:hover {
        background: #4A5568;
        border-color: #718096;
    }

    /* 快捷选项容器 - 固定显示在输入框下方 */
    .quick-options-container {
        margin: 16px 0;
        padding: 12px;
        background: rgba(45, 55, 72, 0.3);
        border: 1px solid #4A5568;
        border-radius: 8px;
    }

    .quick-options-label {
        text-align: center;
        color: #A0AEC0;
        font-size: 12px;
        margin-bottom: 12px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    /* 极简容器 */
    .minimal-container {
        max-width: 600px;
        margin: 0 auto;
        text-align: center;
    }

    /* 加载状态 */
    .minimal-loading {
        text-align: center;
        padding: 20px;
        color: #718096;
        font-style: italic;
    }

    /* 修复checkbox样式 */
    .stCheckbox > div > div > label {
        color: #E2E8F0;
    }
    </style>
    """

    st.markdown(minimal_css, unsafe_allow_html=True)


def create_minimal_header():
    """创建极简风格的页面头部"""

    header_html = """
    <div style="text-align: center; margin-bottom: 2rem;">
        <h1 style="margin: 0; font-weight: 600;">需求澄清助手</h1>
    </div>
    """

    st.markdown(header_html, unsafe_allow_html=True)


def create_minimal_input_area():
    """创建极简风格的输入区域"""

    # 居中容器
    st.markdown('<div class="minimal-container">', unsafe_allow_html=True)

    # 输入框
    user_input = st.text_area(
        "请描述你的需求...",
        placeholder="请详细描述你的需求，我会通过提问帮助你明确真正的需求...",
        key="minimal_input",
        height=120
    )

    # 主要操作按钮
    col1, col2, col3 = st.columns([1, 1, 1])

    with col1:
        send_button = st.button(
            "发送",
            key="minimal_send",
            use_container_width=True,
            type="primary"
        )

    with col2:
        clear_button = st.button(
            "清空",
            key="minimal_clear",
            use_container_width=True
        )

    with col3:
        history_button = st.button(
            "历史",
            key="minimal_history",
            use_container_width=True
        )

    # 快捷选项按钮 - 固定显示
    st.markdown('<div class="quick-options-container">', unsafe_allow_html=True)

    # 快捷选项标题
    st.markdown('<div class="quick-options-label">快捷选项</div>', unsafe_allow_html=True)

    # 快捷选项按钮
    col1, col2, col3, col4, col5 = st.columns([1, 1, 1, 1, 1])

    selected_option = None

    with col1:
        if st.button("A", key="minimal_option_A", use_container_width=True):
            selected_option = "A"

    with col2:
        if st.button("B", key="minimal_option_B", use_container_width=True):
            selected_option = "B"

    with col3:
        if st.button("C", key="minimal_option_C", use_container_width=True):
            selected_option = "C"

    with col4:
        if st.button("D", key="minimal_option_D", use_container_width=True):
            selected_option = "D"

    with col5:
        if st.button("Accept", key="minimal_option_Accept", use_container_width=True):
            selected_option = "Accept"

    st.markdown('</div>', unsafe_allow_html=True)
    st.markdown('</div>', unsafe_allow_html=True)

    return send_button, user_input, clear_button, history_button, selected_option


def create_minimal_message_display():
    """创建极简风格的消息显示区域"""

    if "messages" not in st.session_state or not st.session_state.messages:
        return

    st.markdown('<div style="max-width: 600px; margin: 0 auto;">', unsafe_allow_html=True)

    for i, message in enumerate(st.session_state.messages[-10:]):  # 只显示最近10条
        role_class = "minimal-user-message" if message["role"] == "user" else "minimal-assistant-message"
        role_name = "您" if message["role"] == "user" else "助手"

        message_html = f"""
        <div class="minimal-message {role_class}">
            <div class="minimal-message-role">{role_name}</div>
            <div>{message["content"]}</div>
        </div>
        """

        st.markdown(message_html, unsafe_allow_html=True)

    st.markdown('</div>', unsafe_allow_html=True)




def create_minimal_history_modal():
    """创建极简风格的历史记录模态框"""

    if "show_history" not in st.session_state:
        st.session_state.show_history = False

    if st.session_state.show_history:
        st.markdown('<div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #4A5568; border-radius: 8px; background: #2D3748;">', unsafe_allow_html=True)

        st.markdown("### 对话历史")

        # 尝试加载数据库历史记录
        try:
            # 尝试导入数据库管理器
            from database import get_db_manager, Conversation, Message
            db_manager = get_db_manager()

            if db_manager:
                session = db_manager.get_session()
                conversations = session.query(Conversation).order_by(
                    Conversation.updated_at.desc()
                ).limit(10).all()

                if conversations:
                    for conv in conversations:
                        with st.expander(f"对话 {conv.conversation_id[:8]} - {conv.updated_at.strftime('%m-%d %H:%M')}"):
                            # 获取该对话的消息
                            messages = session.query(Message).filter(
                                Message.conversation_id == conv.conversation_id
                            ).order_by(Message.timestamp).all()

                            for msg in messages:
                                role_name = "您" if msg.role == "user" else "助手"
                                st.markdown(f"**{role_name}**: {msg.content[:100]}{'...' if len(msg.content) > 100 else ''}")

                            if st.button(f"加载此对话", key=f"load_conv_{conv.conversation_id}"):
                                # 加载选中的对话
                                st.session_state.messages = []
                                for msg in messages:
                                    st.session_state.messages.append({
                                        "role": msg.role,
                                        "content": msg.content
                                    })
                                st.session_state.conversation_id = conv.conversation_id
                                st.session_state.show_history = False
                                st.success("对话已加载")
                                st.rerun()
                else:
                    st.info("暂无历史对话记录")

                session.close()
            else:
                st.info("数据库未连接，无法加载历史记录")

        except ImportError:
            st.info("数据库模块未安装，无法加载历史记录")
        except Exception as e:
            st.info(f"加载历史记录失败: {str(e)}")

        # 显示当前会话历史（如果有的话）
        if get_minimal_messages():
            st.markdown("#### 当前会话")
            for i, msg in enumerate(get_minimal_messages()[-5:]):
                role_name = "您" if msg["role"] == "user" else "助手"
                st.markdown(f"**{role_name}**: {msg.content[:150]}{'...' if len(msg['content']) > 150 else ''}")

        if st.button("关闭", key="close_history"):
            st.session_state.show_history = False
            st.rerun()

        st.markdown('</div>', unsafe_allow_html=True)


def create_minimal_search_toggle():
    """创建极简风格的搜索开关"""

    # 尝试导入web_searcher
    try:
        from search import web_searcher

        if web_searcher.enabled:
            if "enable_search" not in st.session_state:
                st.session_state.enable_search = True

            # 搜索开关
            col1, col2 = st.columns([3, 1])
            with col1:
                st.markdown("网络搜索")
            with col2:
                enable_search = st.checkbox(
                    "启用",
                    value=st.session_state.enable_search,
                    key="minimal_search_toggle"
                )
                st.session_state.enable_search = enable_search
    except ImportError:
        pass


def create_minimal_interface():
    """创建完整的极简界面"""

    # 应用极简样式
    apply_minimal_style()

    # 页面头部
    create_minimal_header()

    # 搜索开关（如果可用）
    create_minimal_search_toggle()

    # 消息显示区域
    create_minimal_message_display()

    # 输入区域（包含快捷选项按钮）
    send_button, user_input, clear_button, history_button, selected_option = create_minimal_input_area()

    # 历史记录模态框
    create_minimal_history_modal()

    return {
        'send_button': send_button,
        'user_input': user_input,
        'clear_button': clear_button,
        'history_button': history_button,
        'selected_option': selected_option
    }


def handle_minimal_actions(clear_button, history_button):
    """处理极简界面的按钮操作"""

    # 处理清空操作
    if clear_button:
        st.session_state.messages = []
        st.rerun()

    # 处理历史记录
    if history_button:
        st.session_state.show_history = not st.session_state.get("show_history", False)
        st.rerun()


def show_minimal_loading():
    """显示极简风格的加载状态"""

    st.markdown('<div class="minimal-loading">正在思考中...</div>', unsafe_allow_html=True)


def add_minimal_message(role, content):
    """添加消息到对话历史"""

    if "messages" not in st.session_state:
        st.session_state.messages = []

    st.session_state.messages.append({
        "role": role,
        "content": content
    })


def clear_minimal_messages():
    """清空消息历史"""

    st.session_state.messages = []


def get_minimal_messages():
    """获取消息历史"""

    return st.session_state.get("messages", [])


def create_minimal_welcome():
    """创建极简风格的欢迎信息"""

    if not get_minimal_messages():
        welcome_html = """
        <div style="text-align: center; margin: 4rem 0; color: #718096;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">👋</div>
            <p style="font-size: 18px; margin-bottom: 2rem;">你好！我是需求澄清助手</p>
            <p style="font-size: 16px; line-height: 1.8;">
                请描述你的需求，我会通过提问帮助你明确真正的需求。
            </p>
        </div>
        """

        st.markdown(welcome_html, unsafe_allow_html=True)