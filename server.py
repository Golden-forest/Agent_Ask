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
from prompts.enhancement_manager import get_enhancement_manager
from prompts.version_manager import get_version_manager

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
    enable_enhancements: bool = True
    allowed_enhancements: List[str] = []
    disabled_enhancements: List[str] = []

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

# 增强提示词管理器
enhancement_manager = get_enhancement_manager()

# 版本管理器
version_manager = get_version_manager()

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
        enable_enhancements = data.get('enable_enhancements', True)
        allowed_enhancements = data.get('allowed_enhancements', [])
        disabled_enhancements = data.get('disabled_enhancements', [])
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

        # ⚠️ 修改提示词的重要规则和注意事项：
        # 1. 【绝对禁止】修改Accept按钮的响应逻辑！用户点击Accept必须直接输出优化提示词
        # 2. 【绝对禁止】添加复杂的Accept检测条件，如"对话深度"、"有意义的交流"等判断
        # 3. 【禁止】破坏选项解析功能，前端依赖固定的选项格式
        # 4. 【允许】优化问题质量和提示词的专业性
        # 5. 【允许】改进选项的相关性和实用性
        # 6. 【必须】保持简化的响应逻辑：Accept = 直接输出最终结果
        #
        # 如需修改提示词，请严格在以下范围内进行：
        # - 优化问题的质量和针对性
        # - 改进选项的实用性和多样性
        # - 提升最终输出提示词的专业性
        # - 保持和优化现有的响应格式
        # - 绝对不能破坏用户交互功能！

        # 构建基础提示词
        base_prompt_content = f"""你是一个专业的需求澄清助手，帮助用户将模糊的需求转化为清晰、可执行的提示词。

## 最重要规则：Accept检测（最高优先级）

**检查用户当前输入**：如果用户输入 exactly "Accept"（不区分大小写），立即跳过所有澄清，直接输出最终的优化提示词格式。

用户当前输入："{message}"

**Accept检查结果**：{"检测到Accept，将输出最终结果" if message.strip().lower() == "accept" else "未检测到Accept，继续澄清流程"}

对话历史：{history}

{search_info if search_info else ""}

## 响应规则：

1. **如果检测到Accept**：直接输出最终结果格式（下方定义）
2. **如果这是初始需求**：提出第一个澄清问题，提供3-4个选项
3. **如果用户在回答问题**：基于回答提出下一个澄清问题，继续提供选项
4. **每个回复只提一个问题**，专注于一个澄清维度

## 响应格式：

**澄清问题格式**：
```
🔍 **Question**: [针对用户需求的澄清问题]

**Strategic Options**:
- [选项1：具体的方向或方法]
- [选项2：替代方案或不同角度]
- [选项3：其他考虑因素]
- [选项4：补充性的建议]

💡 **Action**: 选择一个或多个选项，或描述你的想法
```

**最终结果格式（用户说Accept时使用）**：
```
✅ **Requirement Summary**:
[基于对话总结的清晰需求描述]

🚀 **Optimized Prompt**:
[专业、完整、可直接使用的优化提示词]

📋 **Implementation Notes**:
[使用建议和注意事项]
```

开始回复："""

        # 应用增强提示词
        prompt = base_prompt_content
        used_enhancements = []

        if enable_enhancements:
            try:
                enhanced_prompt, used_enhancements = enhancement_manager.get_merged_prompt(
                    base_prompt_name="websocket_chat",
                    user_input=message,
                    allowed_enhancements=allowed_enhancements,
                    disabled_enhancements=disabled_enhancements
                )
                prompt = enhanced_prompt
                print(f"已使用增强提示词: {used_enhancements}")
            except Exception as e:
                print(f"增强提示词加载失败，使用基础提示词: {e}")
                prompt = base_prompt_content

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

        # 构建基础提示词
        base_prompt_content = f"""You are a professional requirement clarification assistant. Help users clarify their needs through targeted questions, ultimately outputting an optimized prompt.

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

Start analysis:""""

        # 应用增强提示词
        prompt = base_prompt_content
        used_enhancements = []

        if request.enable_enhancements:
            try:
                enhanced_prompt, used_enhancements = enhancement_manager.get_merged_prompt(
                    base_prompt_name="rest_chat",
                    user_input=request.message,
                    allowed_enhancements=request.allowed_enhancements,
                    disabled_enhancements=request.disabled_enhancements
                )
                prompt = enhanced_prompt
                print(f"REST API已使用增强提示词: {used_enhancements}")
            except Exception as e:
                print(f"REST API增强提示词加载失败，使用基础提示词: {e}")
                prompt = base_prompt_content

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

# ====== 增强提示词管理 API ======

@app.get("/enhancements")
async def list_enhancements():
    """列出所有可用的增强功能"""
    try:
        enhancements = enhancement_manager.list_enhancements()
        return {
            "enhancements": enhancements,
            "total_count": len(enhancements),
            "enhancements_enabled": enhancement_manager.config.get("enhancements_enabled", True)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/enhancements/{enhancement_name}/disable")
async def disable_enhancement(enhancement_name: str):
    """禁用特定增强功能"""
    try:
        if enhancement_name in enhancement_manager.config["enhancements"]:
            enhancement_manager.config["enhancements"][enhancement_name]["user_disabled"] = True
            enhancement_manager.save_config()
            return {"message": f"增强功能 {enhancement_name} 已禁用"}
        else:
            raise HTTPException(status_code=404, detail="增强功能不存在")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/enhancements/{enhancement_name}/enable")
async def enable_enhancement(enhancement_name: str):
    """启用特定增强功能"""
    try:
        if enhancement_name in enhancement_manager.config["enhancements"]:
            enhancement_manager.config["enhancements"][enhancement_name]["user_disabled"] = False
            enhancement_manager.config["enhancements"][enhancement_name]["auto_disabled"] = False
            enhancement_manager.save_config()
            return {"message": f"增强功能 {enhancement_name} 已启用"}
        else:
            raise HTTPException(status_code=404, detail="增强功能不存在")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/enhancements/reload")
async def reload_enhancements():
    """重新加载所有增强提示词"""
    try:
        enhancement_manager.reload_enhancements()
        return {"message": "增强提示词已重新加载"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ====== 版本管理 API ======

@app.get("/versions")
async def list_versions():
    """列出所有版本备份"""
    try:
        backups = version_manager.list_backups()
        current_version = version_manager.get_current_version()
        return {
            "backups": backups,
            "current_version": current_version,
            "total_backups": len(backups)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/versions/backup")
async def create_backup(description: str = ""):
    """创建新的版本备份"""
    try:
        version = version_manager.create_backup(description)
        return {
            "message": "备份创建成功",
            "version": version,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/versions/{version}/restore")
async def restore_version(version: str):
    """恢复到指定版本"""
    try:
        success = version_manager.restore_backup(version)
        if success:
            # 重新加载增强管理器
            enhancement_manager.reload_enhancements()
            return {
                "message": f"成功恢复到版本 {version}",
                "version": version
            }
        else:
            raise HTTPException(status_code=400, detail="恢复失败")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/versions/{version}")
async def delete_version(version: str):
    """删除指定版本备份"""
    try:
        success = version_manager.delete_backup(version)
        if success:
            return {"message": f"版本 {version} 删除成功"}
        else:
            raise HTTPException(status_code=400, detail="删除失败")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/versions/{version}")
async def get_version_info(version: str):
    """获取指定版本的详细信息"""
    try:
        version_info = version_manager.get_version_info(version)
        if version_info:
            return version_info
        else:
            raise HTTPException(status_code=404, detail="版本不存在")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/versions/cleanup")
async def cleanup_old_versions(keep_count: int = 10):
    """清理旧版本，保留最近的N个备份"""
    try:
        version_manager.cleanup_old_backups(keep_count)
        return {"message": f"清理完成，保留了最近的 {keep_count} 个备份"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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