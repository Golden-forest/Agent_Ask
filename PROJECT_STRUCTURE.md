# 智能澄清Agent - 项目结构说明

## 📁 最终项目结构

```
智能澄清Agent/
├── 📄 配置文件
│   ├── .env                    # 环境变量配置
│   ├── .gitignore             # Git忽略规则
│   └── requirements.txt       # Python依赖包
├── 📄 文档文件
│   ├── README.md              # 项目说明文档
│   └── PROJECT_STRUCTURE.md   # 本文档
├── 📄 数据文件
│   └── chat.db                # 聊天历史数据库
├── 📄 核心代码文件
│   ├── main.py                # 主程序入口
│   ├── config.py              # 配置管理
│   ├── ui.py                  # UI组件系统
│   ├── search.py              # 网络搜索功能
│   ├── database.py            # 数据库操作
│   └── server.py              # FastAPI服务器
├── 📄 脚本文件
│   └── start.sh               # 启动脚本
└── 📁 开发环境
    ├── .git/                  # Git版本控制
    └── venv/                  # Python虚拟环境
```

## 📝 文件命名规范

### 命名原则
- **简洁明了**: 使用简短但有意义的名称
- **一致风格**: 全部使用小写字母和下划线
- **功能导向**: 文件名直接反映其功能
- **易于维护**: 便于开发者快速定位

### 文件命名映射

| 原名称 | 新名称 | 说明 |
|--------|--------|------|
| `api_server.py` | `server.py` | API服务器，简化命名 |
| `web_search.py` | `search.py` | 网络搜索功能，简化命名 |
| `minimal_ui.py` | `ui.py` | UI组件系统，作为唯一UI使用 |
| `start_minimal.sh` | `start.sh` | 启动脚本，简化命名 |
| `chat_history.db` | `chat.db` | 聊天数据库，简化命名 |

## 🔧 模块功能说明

### 核心模块
- **main.py**: 主程序入口，整合所有功能模块
- **config.py**: 统一配置管理，包含所有应用设置
- **ui.py**: 极简主义UI组件，DeepSeek风格设计

### 功能模块
- **search.py**: 网络搜索功能，集成Serper API
- **database.py**: 数据库操作，使用SQLAlchemy
- **server.py**: FastAPI后端服务，提供RESTful接口

### 数据和配置
- **chat.db**: SQLite数据库，存储对话历史
- **.env**: 环境变量配置，包含API密钥等
- **requirements.txt**: Python依赖包列表

## 🚀 使用方法

### 快速启动
```bash
# 使用启动脚本
./start.sh

# 或直接启动
source venv/bin/activate
streamlit run main.py
```

### API服务
```bash
# 启动API服务器
source venv/bin/activate
python server.py
```

## 📊 优化效果

### 文件数量优化
- **清理前**: 90+ 个文件
- **清理后**: 14 个文件/目录
- **减少比例**: 84%

### 命名规范化
- ✅ 统一使用小写字母和下划线
- ✅ 移除冗余描述词汇
- ✅ 保持功能语义清晰
- ✅ 符合Python命名规范

### 代码维护性
- ✅ 模块导入关系清晰
- ✅ 依赖关系明确
- ✅ 功能职责分明
- ✅ 便于团队协作

## 🎯 项目特色

1. **极简设计**: 类似DeepSeek的简洁界面风格
2. **模块化架构**: 清晰的功能模块划分
3. **智能搜索**: 集成实时网络搜索功能
4. **数据持久化**: 完整的对话历史存储
5. **API支持**: 提供RESTful接口
6. **一键启动**: 便捷的启动脚本

---

**更新时间**: 2025-11-09 16:45
**项目版本**: v2.0 (清理和优化版)
**维护状态**: ✅ 活跃维护