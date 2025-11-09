"""
FastAPI后端服务
为需求澄清助手提供RESTful API接口
与现有Streamlit前端并行运行，不影响现有功能
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import asyncio
from datetime import datetime
from dotenv import load_dotenv

from langchain_openai import ChatOpenAI
from search import search_requirement_context

load_dotenv()

# FastAPI应用
app = FastAPI(
    title="需求澄清助手API",
    description="AI需求澄清助手的RESTful API接口",
    version="1.0.0"
)

# CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8501", "http://localhost:8504"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 数据模型
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    conversation_history: List[ChatMessage] = []
    enable_search: bool = True

class ChatResponse(BaseModel):
    response: str
    timestamp: str
    search_info: Optional[str] = None
    conversation_id: str

class RequirementAnalysis(BaseModel):
    original_requirement: str
    optimized_requirement: str
    key_questions: List[Dict[str, str]]
    suggestions: List[str]

# 全局变量
llm = ChatOpenAI(
    model="deepseek-chat",
    openai_api_key=os.getenv("DEEPSEEK_API_KEY"),
    openai_api_base=os.getenv("DEEPSEEK_BASE_URL"),
)

# 内存存储（生产环境应使用数据库）
conversations: Dict[str, List[ChatMessage]] = {}

def generate_conversation_id() -> str:
    """生成对话ID"""
    return f"conv_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "需求澄清助手API服务运行中",
        "version": "1.0.0",
        "endpoints": {
            "chat": "/chat - 对话接口",
            "analyze": "/analyze - 需求分析",
            "health": "/health - 健康检查"
        }
    }

@app.get("/health")
async def health_check():
    """健康检查"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "llm": "connected" if os.getenv("DEEPSEEK_API_KEY") else "disconnected",
            "search": "enabled" if os.getenv("SERPER_API_KEY") else "disabled"
        }
    }

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, background_tasks: BackgroundTasks):
    """对话接口"""
    try:
        conversation_id = generate_conversation_id()

        # 转换对话历史
        history = [{"role": msg.role, "content": msg.content} for msg in request.conversation_history]

        # 搜索信息
        search_info = ""
        if (request.enable_search and
            len(history) == 0 and
            len(request.message) > 10 and
            os.getenv("SERPER_API_KEY")):
            try:
                search_info = search_requirement_context(request.message)
            except Exception as e:
                search_info = f"搜索时出现错误：{str(e)}"

        # 构建提示词
        prompt = f"""你是一个需求澄清助手。根据用户需求和对话历史，提出有针对性的澄清问题。

用户当前输入：{request.message}

{search_info if search_info else ""}

请根据对话历史和用户当前输入，生成适当的回复。
- 如果这是初始需求，请提出第一个澄清问题
- 如果用户在回答问题，请基于回答提出下一个问题
- 如果用户说"Accept"，请生成完整的需求分析报告

开始回复："""

        # 获取AI回复
        response = llm.invoke(prompt)

        # 保存对话（异步）
        background_tasks.add_task(
            save_conversation,
            conversation_id,
            request.message,
            response.content
        )

        return ChatResponse(
            response=response.content,
            timestamp=datetime.now().isoformat(),
            search_info=search_info if search_info else None,
            conversation_id=conversation_id
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def save_conversation(conversation_id: str, user_message: str, ai_response: str):
    """保存对话历史"""
    if conversation_id not in conversations:
        conversations[conversation_id] = []

    conversations[conversation_id].extend([
        ChatMessage(role="user", content=user_message),
        ChatMessage(role="assistant", content=ai_response)
    ])

@app.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str):
    """获取对话历史"""
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="对话不存在")

    return {
        "conversation_id": conversation_id,
        "messages": conversations[conversation_id]
    }

@app.post("/analyze", response_model=RequirementAnalysis)
async def analyze_requirement(request: ChatRequest):
    """需求分析接口"""
    try:
        # 搜索相关信息
        search_info = ""
        if os.getenv("SERPER_API_KEY"):
            try:
                search_info = search_requirement_context(request.message)
            except Exception as e:
                search_info = f"搜索时出现错误：{str(e)}"

        # 构建分析提示
        prompt = f"""请对以下用户需求进行深度分析：

用户需求：{request.message}

{search_info if search_info else ""}

请提供：
1. 优化后的需求描述（更清晰、具体、完整）
2. 关键问题列表（每个问题包含问题和建议答案）
3. 实现建议列表

请以JSON格式返回结果：
{{
    "optimized_requirement": "优化后的需求描述",
    "key_questions": [
        {{"question": "问题1", "suggested_answer": "建议答案1"}},
        {{"question": "问题2", "suggested_answer": "建议答案2"}}
    ],
    "suggestions": ["建议1", "建议2", "建议3"]
}}"""

        response = llm.invoke(prompt)

        # 尝试解析JSON响应
        try:
            import json
            analysis_data = json.loads(response.content)
        except:
            # 如果JSON解析失败，返回基本分析
            analysis_data = {
                "optimized_requirement": request.message,
                "key_questions": [],
                "suggestions": ["需求分析完成"]
            }

        return RequirementAnalysis(
            original_requirement=request.message,
            optimized_requirement=analysis_data.get("optimized_requirement", request.message),
            key_questions=analysis_data.get("key_questions", []),
            suggestions=analysis_data.get("suggestions", [])
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
async def get_stats():
    """获取统计信息"""
    total_conversations = len(conversations)
    total_messages = sum(len(msgs) for msgs in conversations.values())

    return {
        "total_conversations": total_conversations,
        "total_messages": total_messages,
        "average_messages_per_conversation": total_messages / total_conversations if total_conversations > 0 else 0,
        "active_conversations": len([conv for conv in conversations.values() if len(conv) > 0])
    }

if __name__ == "__main__":
    import uvicorn

    # 启动API服务器
    uvicorn.run(
        "api_server:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )