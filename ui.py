"""
极简主义UI组件库
类似DeepSeek的简洁设计风格 - 专注于核心交互
固定深色模式，无主题切换功能
"""

import streamlit as st


def apply_minimal_style():
    """应用极简主义深色模式样式系统 (DeepSeek风格)"""

    minimal_css = """
    <style>
    /* 引入字体 */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

    /* 全局变量 */
    :root {
        --bg-color: #101214;  /* DeepSeek 深色背景 */
        --text-color: #E2E8F0;
        --accent-color: #4E61E6; /* DeepSeek 蓝 */
        --border-color: #2D3748;
        --input-bg: #1A202C;
        --capsule-bg: #2D3748;
        --capsule-hover: #4A5568;
    }

    /* 极简主义全局样式 */
    .stApp {
        background-color: var(--bg-color);
        color: var(--text-color);
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    /* 隐藏所有装饰元素 */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    .stDeployButton {display:none;}
    .stHeader {display: none;}

    /* 主容器 - 居中布局 */
    .main .block-container {
        max-width: 768px;
        margin: 0 auto;
        padding: 2rem 1rem 8rem 1rem; /* 底部留白给输入框 */
        background: transparent;
    }

    /* 标题 - 极简风格 */
    h1 {
        color: var(--text-color);
        font-size: 28px;
        font-weight: 600;
        text-align: center;
        margin-bottom: 2rem;
        letter-spacing: -0.5px;
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
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 16px;
        font-size: 16px;
        background: var(--input-bg);
        color: var(--text-color);
        transition: all 0.2s ease;
        font-family: 'Inter', sans-serif;
        line-height: 1.6;
    }

    .stTextInput > div > div > input:focus,
    .stTextArea > div > div > textarea:focus {
        border-color: var(--accent-color);
        outline: none;
        box-shadow: 0 0 0 2px rgba(78, 97, 230, 0.2);
    }

    /* 极简按钮样式 */
    .stButton > button {
        background: var(--accent-color);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 10px 20px;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
        min-height: 40px;
    }

    .stButton > button:hover {
        opacity: 0.9;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(78, 97, 230, 0.3);
    }

    /* 次要按钮 */
    .stButton.secondary > button {
        background: transparent;
        color: #A0AEC0;
        border: 1px solid var(--border-color);
    }

    .stButton.secondary > button:hover {
        background: var(--capsule-bg);
        color: var(--text-color);
    }

    /* 消息显示 - 极简风格 */
    .minimal-message {
        padding: 12px 0;
        margin: 8px 0;
        font-family: 'Inter', sans-serif;
        line-height: 1.7;
        display: flex;
        gap: 12px;
    }

    .minimal-user-message {
        justify-content: flex-end;
    }
    
    .minimal-user-content {
        background: var(--capsule-bg);
        padding: 10px 16px;
        border-radius: 12px 12px 0 12px;
        color: var(--text-color);
        max-width: 80%;
    }

    .minimal-assistant-message {
        justify-content: flex-start;
    }
    
    .minimal-assistant-content {
        background: transparent;
        padding: 0;
        color: #CBD5E0;
        max-width: 100%;
    }

    .minimal-avatar {
        width: 28px;
        height: 28px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        flex-shrink: 0;
    }
    
    .user-avatar {
        background: #4A5568;
        color: white;
    }
    
    .assistant-avatar {
        background: var(--accent-color);
        color: white;
    }

    /* 隐藏侧边栏 */
    .css-1d391kg, .css-1lcbmhc {
        display: none;
    }

    /* 移除所有分割线和装饰 */
    hr { display: none; }

    /* 快捷选项容器 - 胶囊样式 */
    .quick-options-container {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
        flex-wrap: wrap;
        justify-content: center;
    }

    /* 胶囊按钮样式 */
    div[data-testid="stHorizontalBlock"] button {
        background: var(--capsule-bg);
        border: 1px solid var(--border-color);
        border-radius: 20px;
        padding: 4px 16px;
        font-size: 13px;
        color: #A0AEC0;
        min-height: 32px;
        height: 32px;
        line-height: 1;
        transition: all 0.2s ease;
    }

    div[data-testid="stHorizontalBlock"] button:hover {
        background: var(--capsule-hover);
        color: white;
        border-color: #718096;
        transform: translateY(-1px);
    }
    
    div[data-testid="stHorizontalBlock"] button:focus {
        color: white;
        border-color: var(--accent-color);
        background: var(--capsule-hover);
    }

    /* 极简容器 */
    .minimal-container {
        max-width: 700px;
        margin: 0 auto;
    }

    /* 加载状态 */
    .minimal-loading {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #718096;
        font-size: 14px;
        margin-top: 8px;
    }
    
    .typing-indicator span {
        display: inline-block;
        width: 4px;
        height: 4px;
        background-color: #718096;
        border-radius: 50%;
        animation: typing 1.4s infinite both;
        margin: 0 1px;
    }
    
    .typing-indicator span:nth-child(1) { animation-delay: 0s; }
    .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
    .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
    
    @keyframes typing {
        0%, 80%, 100% { transform: scale(0); opacity: 0.5;}
        40% { transform: scale(1); opacity: 1;}
    }

    /* 修复checkbox样式 */
    .stCheckbox > div > div > label {
        color: #A0AEC0;
        font-size: 13px;
    }
    
    /* 底部固定输入框区域 */
    .fixed-bottom-input {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        background: rgba(16, 18, 20, 0.95);
        backdrop-filter: blur(10px);
        padding: 1rem 0 2rem 0;
        border-top: 1px solid var(--border-color);
        z-index: 999;
    }
    </style>
    """

    st.markdown(minimal_css, unsafe_allow_html=True)


def create_minimal_header():
    """创建极简风格的页面头部"""

    header_html = """
    <div style="text-align: center; margin-bottom: 3rem; padding-top: 2rem;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 1rem;">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2C8.268 2 2 8.268 2 16C2 23.732 8.268 30 16 30C23.732 30 30 23.732 30 16C30 8.268 23.732 2 16 2Z" fill="#4E61E6"/>
                <path d="M16 8C11.582 8 8 11.582 8 16C8 20.418 11.582 24 16 24C20.418 24 24 20.418 24 16C24 11.582 20.418 8 16 8Z" fill="#101214"/>
                <path d="M20 14L14 20M14 14L20 20" stroke="#4E61E6" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <h1 style="margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px; font-family: 'Inter', sans-serif;">agent_ask</h1>
        </div>
        <p style="color: #718096; font-size: 14px; margin: 0; font-family: 'Inter', sans-serif;">智能需求澄清助手</p>
    </div>
    """

    st.markdown(header_html, unsafe_allow_html=True)


def create_minimal_input_area():
    """创建极简风格的输入区域"""

    # 底部固定容器
    container = st.container()
    
    with container:
        # 快捷选项按钮 - 胶囊样式，位于输入框上方
        st.markdown('<div class="quick-options-container">', unsafe_allow_html=True)
        
        col1, col2, col3, col4, col5 = st.columns([1, 1, 1, 1, 1.5])
        
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

        # 输入框
        user_input = st.chat_input("输入您的回答或描述需求...", key="minimal_chat_input")
        
        # 兼容旧版返回结构
        send_button = True if user_input else False
        clear_button = None # chat_input 不支持外部清空按钮
        history_button = None # 历史按钮移到侧边栏或顶部

    return send_button, user_input, clear_button, history_button, selected_option


def create_minimal_message_display():
    """创建极简风格的消息显示区域"""

    if "messages" not in st.session_state or not st.session_state.messages:
        return

    st.markdown('<div style="max-width: 700px; margin: 0 auto; padding-bottom: 20px;">', unsafe_allow_html=True)

    for i, message in enumerate(st.session_state.messages):
        role_class = "minimal-user-message" if message["role"] == "user" else "minimal-assistant-message"
        avatar_class = "user-avatar" if message["role"] == "user" else "assistant-avatar"
        avatar_text = "U" if message["role"] == "user" else "AI"
        
        # 内容容器
        content_html = f"""
        <div class="minimal-message {role_class}">
            {'<div class="minimal-avatar assistant-avatar">AI</div>' if message["role"] == "assistant" else ''}
            <div class="minimal-{message['role']}-content">
                {message["content"]}
            </div>
            {'<div class="minimal-avatar user-avatar">U</div>' if message["role"] == "user" else ''}
        </div>
        """
        
        # 使用 st.markdown 渲染内容以支持 Markdown 格式，但外层包裹 HTML
        # 注意：这里为了支持 Markdown 渲染，我们不能直接把内容塞进 HTML 字符串
        # 我们使用 Streamlit 的列布局来模拟
        
        with st.chat_message(message["role"], avatar=None):
             st.markdown(message["content"])

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
                st.markdown(f"**{role_name}**: {msg['content'][:150]}{'...' if len(msg['content']) > 150 else ''}")

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
    
    loading_html = """
    <div class="minimal-loading">
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
        <span>agent_ask 正在思考...</span>
    </div>
    """
    st.markdown(loading_html, unsafe_allow_html=True)


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