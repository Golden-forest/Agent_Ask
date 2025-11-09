"""
数据持久化模块
使用SQLAlchemy存储对话历史和分析结果
与现有实现并行，不影响现有功能
"""

from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
import os
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv
import json

load_dotenv()

# 基础模型类
Base = declarative_base()

class Conversation(Base):
    """对话模型"""
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String(50), unique=True, index=True)
    user_id = Column(String(50), default="default")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)

class Message(Base):
    """消息模型"""
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String(50), index=True)
    role = Column(String(20))  # user, assistant
    content = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    search_info = Column(Text, nullable=True)
    message_metadata = Column(JSON, nullable=True)

class RequirementAnalysis(Base):
    """需求分析模型"""
    __tablename__ = "requirement_analyses"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String(50), index=True)
    original_requirement = Column(Text)
    optimized_requirement = Column(Text)
    key_questions = Column(JSON)  # 存储为JSON
    suggestions = Column(JSON)    # 存储为JSON
    created_at = Column(DateTime, default=datetime.utcnow)
    search_results = Column(Text, nullable=True)

class SearchCache(Base):
    """搜索缓存模型"""
    __tablename__ = "search_cache"

    id = Column(Integer, primary_key=True, index=True)
    query_hash = Column(String(64), unique=True, index=True)
    query = Column(Text)
    results = Column(Text)  # JSON格式的搜索结果
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)

class DatabaseManager:
    """数据库管理器"""

    def __init__(self, database_url: str = None):
        """初始化数据库连接"""
        if database_url is None:
            # 默认使用SQLite数据库
            database_url = os.getenv("DATABASE_URL", "sqlite:///./chat.db")

        self.engine = create_engine(
            database_url,
            echo=False,  # 设为True可查看SQL语句
            connect_args={"check_same_thread": False} if "sqlite" in database_url else {}
        )

        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)

        # 创建表
        Base.metadata.create_all(bind=self.engine)

    def get_session(self) -> Session:
        """获取数据库会话"""
        return self.SessionLocal()

    def save_conversation(self, conversation_id: str, user_id: str = "default") -> bool:
        """保存对话"""
        try:
            session = self.get_session()
            conversation = session.query(Conversation).filter(
                Conversation.conversation_id == conversation_id
            ).first()

            if not conversation:
                conversation = Conversation(
                    conversation_id=conversation_id,
                    user_id=user_id
                )
                session.add(conversation)
            else:
                conversation.updated_at = datetime.utcnow()

            session.commit()
            session.close()
            return True

        except Exception as e:
            print(f"保存对话失败: {e}")
            return False

    def save_message(self, conversation_id: str, role: str, content: str,
                    search_info: str = None, metadata: Dict = None) -> bool:
        """保存消息"""
        try:
            session = self.get_session()

            # 确保对话存在
            self.save_conversation(conversation_id)

            message = Message(
                conversation_id=conversation_id,
                role=role,
                content=content,
                search_info=search_info,
                message_metadata=metadata or {}
            )

            session.add(message)
            session.commit()
            session.close()
            return True

        except Exception as e:
            print(f"保存消息失败: {e}")
            return False

    def get_conversation_messages(self, conversation_id: str) -> List[Dict]:
        """获取对话消息"""
        try:
            session = self.get_session()
            messages = session.query(Message).filter(
                Message.conversation_id == conversation_id
            ).order_by(Message.timestamp).all()

            result = []
            for msg in messages:
                result.append({
                    "role": msg.role,
                    "content": msg.content,
                    "timestamp": msg.timestamp.isoformat(),
                    "search_info": msg.search_info,
                    "metadata": msg.message_metadata
                })

            session.close()
            return result

        except Exception as e:
            print(f"获取对话失败: {e}")
            return []

    def save_requirement_analysis(self, conversation_id: str, analysis: Dict) -> bool:
        """保存需求分析"""
        try:
            session = self.get_session()

            req_analysis = RequirementAnalysis(
                conversation_id=conversation_id,
                original_requirement=analysis.get("original_requirement", ""),
                optimized_requirement=analysis.get("optimized_requirement", ""),
                key_questions=analysis.get("key_questions", []),
                suggestions=analysis.get("suggestions", []),
                search_results=analysis.get("search_results")
            )

            session.add(req_analysis)
            session.commit()
            session.close()
            return True

        except Exception as e:
            print(f"保存需求分析失败: {e}")
            return False

    def cache_search_results(self, query: str, results: Dict, ttl_hours: int = 24) -> bool:
        """缓存搜索结果"""
        try:
            import hashlib
            from datetime import timedelta

            query_hash = hashlib.md5(query.encode()).hexdigest()
            expires_at = datetime.utcnow() + timedelta(hours=ttl_hours)

            session = self.get_session()

            # 检查是否已存在
            existing = session.query(SearchCache).filter(
                SearchCache.query_hash == query_hash
            ).first()

            if existing:
                existing.results = json.dumps(results)
                existing.expires_at = expires_at
            else:
                cache = SearchCache(
                    query_hash=query_hash,
                    query=query,
                    results=json.dumps(results),
                    expires_at=expires_at
                )
                session.add(cache)

            session.commit()
            session.close()
            return True

        except Exception as e:
            print(f"缓存搜索结果失败: {e}")
            return False

    def get_cached_search_results(self, query: str) -> Optional[Dict]:
        """获取缓存的搜索结果"""
        try:
            import hashlib

            query_hash = hashlib.md5(query.encode()).hexdigest()
            session = self.get_session()

            cache = session.query(SearchCache).filter(
                SearchCache.query_hash == query_hash,
                SearchCache.expires_at > datetime.utcnow()
            ).first()

            if cache:
                results = json.loads(cache.results)
                session.close()
                return results

            session.close()
            return None

        except Exception as e:
            print(f"获取缓存失败: {e}")
            return None

    def get_stats(self) -> Dict:
        """获取统计信息"""
        try:
            session = self.get_session()

            # 对话统计
            total_conversations = session.query(Conversation).count()
            active_conversations = session.query(Conversation).filter(
                Conversation.is_active == True
            ).count()

            # 消息统计
            total_messages = session.query(Message).count()
            user_messages = session.query(Message).filter(Message.role == "user").count()
            assistant_messages = session.query(Message).filter(Message.role == "assistant").count()

            # 分析统计
            total_analyses = session.query(RequirementAnalysis).count()

            # 搜索缓存统计
            cached_searches = session.query(SearchCache).filter(
                SearchCache.expires_at > datetime.utcnow()
            ).count()

            session.close()

            return {
                "conversations": {
                    "total": total_conversations,
                    "active": active_conversations
                },
                "messages": {
                    "total": total_messages,
                    "user": user_messages,
                    "assistant": assistant_messages
                },
                "analyses": {
                    "total": total_analyses
                },
                "cache": {
                    "searches": cached_searches
                }
            }

        except Exception as e:
            print(f"获取统计信息失败: {e}")
            return {}

    def cleanup_old_data(self, days: int = 30) -> bool:
        """清理旧数据"""
        try:
            from datetime import timedelta

            cutoff_date = datetime.utcnow() - timedelta(days=days)
            session = self.get_session()

            # 清理旧消息
            session.query(Message).filter(Message.timestamp < cutoff_date).delete()

            # 清理过期缓存
            session.query(SearchCache).filter(SearchCache.expires_at < datetime.utcnow()).delete()

            session.commit()
            session.close()
            return True

        except Exception as e:
            print(f"清理数据失败: {e}")
            return False

    def save_requirement_analysis(self, conversation_id: str, original_requirements: List[str],
                                analysis_result: str, ai_responses: List[str] = None) -> bool:
        """保存需求分析结果"""
        try:
            session = self.get_session()

            # 检查是否已存在该对话的分析
            existing = session.query(RequirementAnalysis).filter(
                RequirementAnalysis.conversation_id == conversation_id
            ).first()

            if existing:
                # 更新现有分析
                existing.original_requirement = json.dumps(original_requirements, ensure_ascii=False)
                existing.optimized_requirement = analysis_result
                existing.key_questions = ai_responses[:5] if ai_responses else []  # 保存前5个关键问题
                existing.search_results = json.dumps({
                    "total_inputs": len(original_requirements),
                    "total_responses": len(ai_responses) if ai_responses else 0,
                    "analysis_length": len(analysis_result)
                }, ensure_ascii=False)
            else:
                # 创建新分析记录
                analysis = RequirementAnalysis(
                    conversation_id=conversation_id,
                    original_requirement=json.dumps(original_requirements, ensure_ascii=False),
                    optimized_requirement=analysis_result,
                    key_questions=ai_responses[:5] if ai_responses else [],
                    search_results=json.dumps({
                        "total_inputs": len(original_requirements),
                        "total_responses": len(ai_responses) if ai_responses else 0,
                        "analysis_length": len(analysis_result)
                    }, ensure_ascii=False)
                )
                session.add(analysis)

            session.commit()
            session.close()
            return True

        except Exception as e:
            print(f"保存需求分析失败: {e}")
            return False

    def get_requirement_analysis(self, conversation_id: str) -> Optional[Dict]:
        """获取需求分析结果"""
        try:
            session = self.get_session()
            analysis = session.query(RequirementAnalysis).filter(
                RequirementAnalysis.conversation_id == conversation_id
            ).first()

            if analysis:
                result = {
                    "original_requirement": json.loads(analysis.original_requirement) if analysis.original_requirement else [],
                    "optimized_requirement": analysis.optimized_requirement,
                    "key_questions": analysis.key_questions or [],
                    "search_results": json.loads(analysis.search_results) if analysis.search_results else {},
                    "created_at": analysis.created_at.isoformat() if analysis.created_at else None
                }
                session.close()
                return result

            session.close()
            return None

        except Exception as e:
            print(f"获取需求分析失败: {e}")
            return None

    def get_all_requirement_analyses(self, limit: int = 10) -> List[Dict]:
        """获取所有需求分析结果"""
        try:
            session = self.get_session()
            analyses = session.query(RequirementAnalysis).order_by(
                RequirementAnalysis.created_at.desc()
            ).limit(limit).all()

            results = []
            for analysis in analyses:
                result = {
                    "conversation_id": analysis.conversation_id,
                    "original_requirement": json.loads(analysis.original_requirement) if analysis.original_requirement else [],
                    "optimized_requirement": analysis.optimized_requirement[:200] + "..." if analysis.optimized_requirement and len(analysis.optimized_requirement) > 200 else analysis.optimized_requirement,
                    "created_at": analysis.created_at.isoformat() if analysis.created_at else None
                }
                results.append(result)

            session.close()
            return results

        except Exception as e:
            print(f"获取需求分析列表失败: {e}")
            return []

# 全局数据库管理器实例
db_manager = DatabaseManager()

def init_database():
    """初始化数据库"""
    global db_manager
    print("数据库初始化完成")

def get_db_manager() -> DatabaseManager:
    """获取数据库管理器实例"""
    return db_manager

# 测试函数
def test_database():
    """测试数据库功能"""
    print("🧪 测试数据库功能...")

    # 测试保存和获取消息
    conv_id = f"test_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    db_manager.save_message(conv_id, "user", "测试消息")
    messages = db_manager.get_conversation_messages(conv_id)

    if messages:
        print(f"数据库测试通过，保存并获取了 {len(messages)} 条消息")
    else:
        print("数据库测试失败")

if __name__ == "__main__":
    init_database()
    test_database()