"""
FastAPI后端服务
为需求澄清助手提供RESTful API接口和WebSocket实时通信
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import asyncio
from datetime import datetime
from dotenv import load_dotenv
import socketio

from langchain_openai import ChatOpenAI
from search import search_requirement_context

load_dotenv()

# FastAPI应用
app = FastAPI(
    title="需求澄清助手API",
    description="AI需求澄清助手的RESTful API接口",
    version="1.0.0"
)

# Socket.IO设置
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
socket_app = socketio.ASGIApp(sio, app)

# CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8501", "http://localhost:8504", "http://127.0.0.1:5173"],
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
    streaming=False
)

# 内存存储（生产环境应使用数据库）
conversations: Dict[str, List[ChatMessage]] = {}

def generate_conversation_id() -> str:
    """生成对话ID"""
    return f"conv_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

async def save_conversation(conversation_id: str, user_message: str, ai_response: str):
    """保存对话历史"""
    if conversation_id not in conversations:
        conversations[conversation_id] = []

    conversations[conversation_id].extend([
        ChatMessage(role="user", content=user_message),
        ChatMessage(role="assistant", content=ai_response)
    ])

# Socket.IO 事件处理
@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio.event
async def chat_message(sid, data):
    """处理聊天消息并流式返回"""
    try:
        message = data.get('message')
        history_data = data.get('history', [])
        enable_search = data.get('enable_search', True)
        conversation_id = data.get('conversation_id') or generate_conversation_id()
        
        # 转换历史记录
        history = [{"role": msg['role'], "content": msg['content']} for msg in history_data]
        
        # 搜索信息
        search_info = ""
        if (enable_search and
            len(history) == 0 and
            len(message) > 10 and
            os.getenv("SERPER_API_KEY")):
            try:
                await sio.emit('search_status', {'status': 'searching'}, room=sid)
                # 在线程池中运行同步搜索函数
                search_info = await asyncio.to_thread(search_requirement_context, message)
                await sio.emit('search_status', {'status': 'completed', 'info': search_info}, room=sid)
            except Exception as e:
                print(f"Search error: {e}")
                await sio.emit('search_status', {'status': 'error', 'error': str(e)}, room=sid)

        # 构建提示词
        prompt = f"""### SYSTEM CONTEXT
**C (Context)**: You are an expert-level Prompt Engineer and Requirements Analyst with deep expertise in AI interaction design, software development methodologies, and systematic thinking frameworks. Your audience is users who need professional-grade prompts for complex tasks. Your goal is to transform vague requirements into precise, actionable, and highly effective prompts.

**T (Task)**: Analyze, deconstruct, and systematically clarify the user's requirement by applying structured thinking frameworks. Generate targeted questions using the CTF formula and engineering mindset. Produce exactly ONE key question per response with 3-5 professionally crafted options.

**F (Format)**: Use structured Markdown format with clear sections, emoji indicators, and consistent organization. Separate instructions from content using ### markers.

### INPUT DATA
<requirement>
{message}
</requirement>

<conversation_history>
{history}
</conversation_history>

<search_context>
{search_info if search_info else "No search context available"}
</search_context>

### CORE ENGINEERING PRINCIPLES (Must Follow)

**Task 1: Foundation Engineering**
- Apply CTF (Context-Task-Format) formula to all interactions
- Use positive, action-oriented instructions (Do X, not "Don't do Y")
- Maintain structural separation between System directives and User content
- Use ### markers and XML-style tags for information isolation

**Task 2: Deep Reasoning Activation**
- Strategy Selection: Use Zero-Shot for simple questions, Few-Shot for format-specific guidance
- For logical/complex requirements: Apply Chain-of-Thought ("Let me analyze step by step")
- For ambiguous scenarios: Use Step-Back technique (first establish core principles, then specifics)
- Implement mandatory self-correction: Draft → Identify gaps → Refine

**Task 3: Response Control & Standardization**
- Enforce structured output with consistent formatting
- Maintain professional, objective tone throughout
- Place critical instructions at the end (combat "lost in the middle" effect)

**Task 4: Automated Workflow Architecture**
- Break complex clarification into logical phases
- Each interaction focuses on one specific dimension
- Build progressive understanding through structured questioning

### INTERACTION RULES

**Rule 1**: Ask ONLY ONE key question per response, focusing on a single clarification dimension
**Rule 2**: Provide 3-4 reference options covering different strategic directions
**Rule 3**: Options must be actionable, specific, and mutually exclusive where possible
**Rule 4**: If user says "Accept" (or similar confirmation), provide Requirement Summary AND Optimized Prompt
**Rule 5**: Questions must follow logical progression, diving deeper based on accumulated context
**Rule 6**: For complex technical requirements, apply CoT: "Let me think through this systematically..."

### RESPONSE STRUCTURES

**Normal Clarification Format:**
```
🔍 **Question**: [Apply CTF: single, precise question focusing on one dimension]

**Analysis Framework**: [Briefly state the thinking approach - Zero-Shot, CoT, Step-Back, etc.]

**Strategic Options**:
- [Option 1: Clear, actionable direction]
- [Option 2: Alternative approach or focus]
- [Option 3: Different methodology or scope]
- [Option 4: Complementary perspective]

💡 **Action**: Select one or more options, or provide specific details in your own words
```

**Final Acceptance Format:**
```
✅ **Requirement Summary**:
[Apply systematic analysis - distill clarified requirements into coherent brief]

🚀 **Optimized Prompt**:
[Professional-grade prompt applying CTF formula, ready for immediate use]

📋 **Implementation Notes**:
[Key considerations, parameters, or context for best results]
```

### EXECUTION PROTOCOL
Start systematic analysis now. Apply the appropriate reasoning strategy based on requirement complexity."""

        # 一次性生成回复
        full_response = await llm.ainvoke(prompt)

        # 发送完成事件
        await sio.emit('stream_complete', {
            'full_content': full_response.content,
            'conversation_id': conversation_id,
            'search_info': search_info
        }, room=sid)
        
        # 保存对话
        await save_conversation(conversation_id, message, full_response.content)
        
    except Exception as e:
        print(f"Error in chat_message: {e}")
        await sio.emit('error', {'message': str(e)}, room=sid)

# REST API 路由
@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "需求澄清助手API服务运行中 (支持WebSocket)",
        "version": "1.0.0",
        "endpoints": {
            "chat": "/chat - 对话接口 (REST)",
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
            "search": "enabled" if os.getenv("SERPER_API_KEY") else "disabled",
            "websocket": "enabled"
        }
    }

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, background_tasks: BackgroundTasks):
    """对话接口 (REST兼容)"""
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
        prompt = f"""You are a professional requirement clarification assistant. Help users clarify their needs through targeted questions, ultimately outputting an optimized prompt.

User requirement: {request.message}
Conversation history: {history}
{search_info if search_info else ""}

Follow these rules strictly:

**Rule 1:** Ask ONLY ONE key question at a time to help clarify specific needs
**Rule 2:** Provide 3-5 reference options after each question for users to choose from (they can select multiple or provide their own answer)
**Rule 3:** Options should cover different possible directions
**Rule 4:** If user says "Accept" (or similar confirmation), DO NOT ask more questions. Instead, output a "Requirement Summary" and the "Optimized Prompt".
**Rule 5:** Questions should be progressive, diving deeper based on user's answers

Response format (Normal):
```
🔍 **Question**: [Your question here]

**Options**:
- [Option 1 text]
- [Option 2 text]
- [Option 3 text]
- [Option 4 text]

💡 You can select one or more options above, or describe in your own words
```

Response format (When user says "Accept"):
```
✅ **Requirement Summary**:
[Brief summary of the clarified requirements]

🚀 **Optimized Prompt**:
[The final, detailed prompt that the user can use]
```

Start analysis:"""

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
        prompt = f"""请对以下用户需求进行深度分析，生成优化后的提示词：

用户原始需求：{request.message}

{search_info if search_info else ""}

基于用户需求，生成一个完整、清晰、具体的优化提示词。这个提示词应该：

1. **明确目标**：清楚说明要达成的目标
2. **具体要求**：列出详细的功能和特性要求
3. **技术规范**：包含技术栈、架构、性能要求等
4. **用户体验**：描述界面设计、交互流程等
5. **边界条件**：明确包含和不包含的内容

请输出一个完整的优化提示词，格式如下：

```
## 优化提示词

**目标**：[明确的项目目标]

**核心功能**：
- 功能1：[详细描述]
- 功能2：[详细描述]
- 功能3：[详细描述]

**技术要求**：
- 技术栈：[具体技术要求]
- 架构：[架构设计要求]
- 性能：[性能指标要求]

**用户体验**：
- 界面设计：[UI/UX要求]
- 交互流程：[用户操作流程]
- 响应式：[设备兼容性要求]

**其他要求**：
- [其他重要约束和条件]
```

请生成优化提示词："""

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
        "server:socket_app",  # 使用socket_app而不是app
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )