"""
极简主义需求澄清助手
采用DeepSeek官网的简洁设计风格
专注于核心对话功能，去除一切装饰性元素
"""

import os
import streamlit as st
import time
from typing import Dict, List, Optional, Any
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

# 导入极简UI系统
from ui import (
    apply_minimal_style,
    create_minimal_interface,
    handle_minimal_actions,
    show_minimal_loading,
    add_minimal_message,
    clear_minimal_messages,
    get_minimal_messages
)

# 导入网络搜索功能
try:
    from search import search_requirement_context, web_searcher
    SEARCH_ENABLED = True
except ImportError:
    SEARCH_ENABLED = False
    print("网络搜索模块未导入")

# 可选的数据库支持
try:
    from database import get_db_manager, DatabaseManager
    db_manager = get_db_manager()
    DB_ENABLED = True
except Exception:
    DB_ENABLED = False
    db_manager = None

load_dotenv()

# 设置页面配置 - 极简模式
st.set_page_config(
    page_title="需求澄清助手",
      layout="centered",
    initial_sidebar_state="collapsed"
)

# 设置LLM
@st.cache_resource
def get_llm():
    """缓存LLM实例"""
    return ChatOpenAI(
        model="deepseek-chat",
        openai_api_key=os.getenv("DEEPSEEK_API_KEY", ""),
        openai_api_base=os.getenv("DEEPSEEK_BASE_URL", ""),
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
                break
            result_lines.append(line)

    if result_lines:
        return '\n'.join(result_lines).strip()
    return None


def generate_comprehensive_requirement_report(conversation_history):
    """生成完整的需求分析报告"""
    if not conversation_history:
        return "暂无对话历史可供分析。"

    user_inputs = [msg['content'] for msg in conversation_history if msg['role'] == 'user']
    ai_responses = [msg['content'] for msg in conversation_history if msg['role'] == 'assistant']

    if not user_inputs:
        return "暂无用户输入可供分析。"

    report_prompt = f"""
    基于以下对话历史，请生成一份完整的需求分析报告：

    用户输入：
    {chr(10).join([f"- {inp}" for inp in user_inputs])}

    AI回复：
    {chr(10).join([f"- {resp[:200]}..." if len(resp) > 200 else f"- {resp}" for resp in ai_responses])}

    请按照以下格式生成报告：

    # 需求分析报告

    ## 1. 项目概述
    [基于对话内容总结项目基本信息]

    ## 2. 核心需求
    [列出用户明确表达的核心需求]

    ## 3. 功能需求
    [基于对话分析得出的功能需求清单]

    ## 4. 非功能需求
    [性能、安全、可用性等非功能性需求]

    ## 5. 技术建议
    [基于需求特点的技术选型建议]

    ## 6. 风险评估
    [潜在的技术和业务风险]

    ## 7. 下一步行动
    [具体的实施建议和优先级]

    ## 8. 优化后的需求
    [基于对话澄清后的最终需求描述]

    请确保报告内容详实、结构清晰，为后续开发提供明确指导。
    """

    try:
        llm = get_llm()
        response = llm.invoke(report_prompt)
        if response and response.content:
            # 保存到数据库
            if DB_ENABLED and db_manager:
                try:
                    db_manager.save_requirement_analysis(
                        conversation_id=st.session_state.get('conversation_id'),
                        original_requirements=user_inputs,
                        analysis_result=response.content,
                        ai_responses=ai_responses
                    )
                except Exception as e:
                    print(f"保存需求分析失败: {e}")
            return response.content
        else:
            return "生成需求分析报告时出现错误，请重试。"
    except Exception as e:
        return f"生成需求分析报告时出错：{str(e)}"


def get_response(user_input, conversation_history):
    """获取AI回复"""
    if not user_input or not user_input.strip():
        return "请输入有效的需求描述"

    # 限制对话历史长度
    max_history = 10
    if len(conversation_history) > max_history:
        conversation_history = conversation_history[-max_history:]

    llm = get_llm()
    prompt_template = load_prompt()

    # 构建对话历史
    history_text = ""
    if conversation_history:
        history_lines = []
        history_lines.append("=== 对话历史 ===")
        for msg in conversation_history:
            role = "用户" if msg['role'] == 'user' else "助手"
            content = msg['content'][:500]
            history_lines.append(f"{role}: {content}")
        history_lines.append("=== 历史结束 ===")
        history_text = "\n\n".join(history_lines) + "\n\n"

    # 检查是否需要搜索
    search_info = ""
    should_search = False
    is_initial_requirement = len(conversation_history) == 0
    is_accept_request = user_input.lower() == "accept"

    # 处理Accept请求
    if is_accept_request and len(conversation_history) >= 3:
        return generate_comprehensive_requirement_report(conversation_history)

    # 初始需求的网络搜索
    if (is_initial_requirement and
        SEARCH_ENABLED and
        web_searcher.enabled and
        st.session_state.get('enable_search', False) and
        len(user_input) > 10):
        should_search = True
        try:
            search_info = search_requirement_context(user_input)
            if search_info and len(search_info.strip()) > 0:
                search_info = f"\n\n网络搜索信息：{search_info}"
        except Exception as e:
            search_info = f"\n\n搜索时出现错误：{str(e)}"

    # 构建完整提示词
    full_prompt = f"""
{prompt_template}

{history_text}
用户当前输入：{user_input}
{search_info}

请根据对话历史和用户当前输入，生成适当的回复：
- 如果这是初始需求，请提出第一个澄清问题
- 如果用户在回答问题，请基于回答提出下一个问题
- 提供A/B/C/D选项帮助用户明确选择
- Accept功能会单独生成完整的需求分析报告{"，已为您提供相关网络搜索信息作为参考" if should_search else ""}

开始回复："""

    try:
        response = llm.invoke(full_prompt)
        if response and response.content:
            return response.content
        else:
            return "抱歉，没有收到有效的回复。请重试。"
    except Exception as e:
        return f"抱歉，处理您的请求时遇到了问题：{str(e)}"


def process_user_message(user_input: str):
    """处理用户消息"""
    if not user_input or not user_input.strip():
        return

    try:
        # 添加用户消息
        add_minimal_message("user", user_input)

        # 保存到数据库
        if DB_ENABLED and db_manager:
            try:
                db_manager.save_message(
                    st.session_state.conversation_id, "user", user_input
                )
            except Exception as e:
                print(f"保存消息失败: {e}")

        # 显示加载状态
        show_minimal_loading()

        # 获取AI回复
        response = get_response(user_input, get_minimal_messages())

        # 添加AI回复
        add_minimal_message("assistant", response)

        # 保存AI回复到数据库
        if DB_ENABLED and db_manager:
            try:
                db_manager.save_message(
                    st.session_state.conversation_id, "assistant", response
                )
            except Exception as e:
                print(f"保存消息失败: {e}")

        # 检查是否有优化后的需求
        optimized_req = extract_optimized_requirement(response)
        if optimized_req:
            st.markdown(f"""
            <div style="max-width: 600px; margin: 2rem auto; padding: 1rem;
                        background: #2D3748; border-radius: 8px; border: 1px solid #4A5568;">
                <div style="font-weight: 600; margin-bottom: 0.5rem; color: #E2E8F0;">
                    📋 优化后的需求
                </div>
                <div style="white-space: pre-wrap; line-height: 1.6; color: #CBD5E0;">
                    {optimized_req}
                </div>
                <div style="margin-top: 0.5rem; text-align: right; color: #718096; font-size: 12px;">
                    💡 请选择上方文本并复制
                </div>
            </div>
            """, unsafe_allow_html=True)

    except Exception as e:
        error_msg = f"处理消息时发生错误：{str(e)}"
        add_minimal_message("assistant", "抱歉，处理您的消息时出现了问题。请尝试重新发送或刷新页面。")


def handle_quick_action(selected_option: str):
    """处理快捷操作"""
    if selected_option:
        if selected_option.lower() == "accept":
            process_user_message("Accept")
        else:
            process_user_message(selected_option)


def main():
    """极简主义主界面"""

    # 初始化会话状态
    if "messages" not in st.session_state:
        st.session_state.messages = []

    if "conversation_id" not in st.session_state:
        import uuid
        st.session_state.conversation_id = f"minimal_{uuid.uuid4().hex[:8]}"

    if "enable_search" not in st.session_state:
        st.session_state.enable_search = SEARCH_ENABLED and web_searcher.enabled if SEARCH_ENABLED else False

    # 创建极简界面
    interface_result = create_minimal_interface()

    # 处理快捷操作
    if interface_result.get('selected_option'):
        handle_quick_action(interface_result['selected_option'])
        st.rerun()

    # 处理按钮操作
    handle_minimal_actions(
        interface_result.get('clear_button', False),
        interface_result.get('history_button', False)
    )

    # 处理发送消息
    send_button = interface_result.get('send_button', False)
    user_input = interface_result.get('user_input', '')

    if send_button and user_input.strip():
        process_user_message(user_input)
        st.rerun()

    # 搜索状态显示已集成到minimal_ui中


if __name__ == "__main__":
    main()