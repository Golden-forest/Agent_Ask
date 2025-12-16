# Agent_Ask

> AI-powered Requirement Clarification Assistant with Minimalist Design

---

## 🎯 Project Overview

Agent_Ask is an AI-powered assistant based on DeepSeek that helps users clarify and optimize requirements through structured questioning. The project adopts a minimalist design philosophy, focusing on core functionality with a clean, distraction-free interface.

---

## ✨ Current Status

**v0.3.0** - React Migration in Progress
- ✅ React + TypeScript + Vite scaffold completed
- ✅ TailwindCSS configured (DeepSeek style)
- ✅ Core dependencies installed (zustand, react-query, socket.io, etc.)
- 🔄 Backend CORS configuration in progress
- ⏳ Chat component development pending
- ✅ Project structure simplified, enhancement system removed

---

## 🚀 Quick Start

### Backend Setup

```bash
# Navigate to project directory
cd /Users/hl/Projects/Agent/agent_ask

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
python server.py
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

### Access Points
- **Frontend**: http://localhost:5173/ (React development server)
- **Backend API**: http://localhost:8000/ (FastAPI server)

---

## 💡 Usage Workflow

1. **Describe Requirement** - Input your initial idea or requirement
2. **AI Questioning** - AI asks targeted clarification questions (A/B/C/D options)
3. **Select Response** - Choose preset options or provide custom answers
4. **Multi-turn Dialogue** - Continue conversation until requirements are clear
5. **Complete Analysis** - Input "Accept" to get comprehensive requirement analysis report

---

## 🏗️ Technical Architecture

### Core Technology Stack
- **Frontend Framework**: React 18 + TypeScript + Vite ✅
- **API Framework**: FastAPI 0.121.0
- **LLM Service**: DeepSeek (via langchain-openai)
- **Database**: SQLAlchemy 2.0.44
- **Search Functionality**: Serper API integration
- **Python Version**: 3.9.6

### Frontend Technology Stack
- **State Management**: Zustand ✅ Installed
- **UI Framework**: TailwindCSS + Headless UI ✅ Configured
- **Real-time Communication**: Socket.IO ✅ Installed
- **API Integration**: TanStack Query ✅ Installed
- **Routing**: React Router v6 ✅ Installed

### Design Features
- **Minimalist**: Clean text interface, no decorative elements
- **Fixed Layout**: A/B/C/D/Accept buttons always visible
- **Responsive Design**: Adapts to desktop, tablet, and mobile devices
- **Dark Theme**: DeepSeek-inspired color scheme

---

## 📁 Project Structure

```
agent_ask/
├── Backend Files (Root Directory)
│   ├── server.py           # FastAPI server (CORS needed)
│   ├── database.py         # Database module
│   ├── config.py          # Configuration management
│   ├── search.py          # Search module
│   ├── requirements.txt   # Python dependencies
│   ├── .env               # Environment variables (NOT in git)
│   ├── chat.db            # SQLite database
│   └── venv/              # Python virtual environment
├── frontend/              # React frontend ✅ Created
│   ├── src/
│   │   ├── index.css     # TailwindCSS styles ✅ Configured
│   │   ├── App.tsx       # Main application component (pending)
│   │   └── main.tsx      # Application entry point
│   ├── public/           # Static assets
│   ├── node_modules/     # npm dependencies
│   ├── package.json      # Project configuration
│   ├── tailwind.config.js # TailwindCSS configuration
│   ├── postcss.config.js  # PostCSS configuration
│   ├── vite.config.ts     # Vite configuration
│   └── tsconfig.json      # TypeScript configuration
├── Documentation Files
│   ├── README.md          # Project documentation
│   ├── PROJECT_STRUCTURE.md  # Project structure guide
│   └── REACT_MIGRATION_PLAN.md # Migration plan
└── Version Control
    └── .git/              # Git version control history
```

**Notes**:
- Virtual environment (`venv/`) has been cleaned, needs recreation
- Database file (`chat.db`) auto-created at runtime
- All temporary files cleaned, maintaining minimal structure

---

## 🎨 Interface Features

### Minimalist Design
- Clean text interface, no icons or decorations
- Fixed display of A/B/C/D/Accept quick action buttons
- Unified design language and interaction patterns

### Core Functionality
- **Intelligent Requirement Clarification**: DeepSeek-based multi-turn dialogue system
- **Quick Options**: A/B/C/D/Accept fixed display for rapid response
- **Web Search**: Real-time search integration for background information support
- **Data Persistence**: Complete conversation history storage and management
- **API Service**: FastAPI backend with RESTful interface support

---

## 🔧 Configuration

### Environment Variable Configuration

The project uses `.env` file for configuration. Copy from `.env.example` for first use:

```bash
cp .env.example .env
```

### Required Configuration

```bash
# DeepSeek API configuration (required)
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

Get API Key: [https://platform.deepseek.com/](https://platform.deepseek.com/)

### Optional Configuration

```bash
# Serper search API (optional, disables search if not configured)
SERPER_API_KEY=your_serper_api_key_here
```

Get API Key: [https://serper.dev/](https://serper.dev/)

### Application Configuration

```bash
# Basic configuration
APP_NAME=Agent_Ask
DEFAULT_PORT=8501

# Conversation configuration
MAX_CONVERSATION_HISTORY=10        # Number of conversation rounds to keep
SEARCH_MIN_LENGTH=10               # Minimum input length to trigger search
SEARCH_ON_FOLLOWUP=false           # Enable search in follow-up conversations
MIN_MESSAGES_FOR_REPORT=3          # Minimum messages needed to generate report

# Database configuration
DATABASE_URL=sqlite:///chat.db

# Performance configuration
ENABLE_SEARCH_CACHE=true           # Enable search cache
SEARCH_CACHE_TTL_HOURS=24          # Search cache validity period (hours)
ENABLE_LLM_CACHING=true            # Enable LLM caching
```

---

## 📊 Feature Matrix

### ✅ Implemented Features
- [x] Intelligent requirement clarification dialogue
- [x] A/B/C/D quick option buttons
- [x] Custom response support
- [x] Real-time web search
- [x] Conversation history storage
- [x] Accept command to complete analysis
- [x] Complete requirement report generation
- [x] FastAPI backend service
- [x] Responsive interface design

### 🔄 Technical Optimizations
- [x] Minimal project structure (12 core files)
- [x] Project size optimization (472KB)
- [x] Cleaned temporary files and cache
- [x] Unified naming conventions
- [x] Version control management

### ⏳ Migration Tasks
- [ ] Backend CORS configuration
- [ ] Core chat component development
- [ ] API service layer implementation
- [ ] UI optimization and testing
- [ ] Production deployment preparation

---

## 🛠️ Development Guidelines

### Development Principles

#### Workspace Simplicity Principle
- Keep root directory containing only essential files for runtime
- Clean up temporary files, screenshots, test reports promptly
- Avoid duplicate version files, use git version control
- Don't keep "might be useful later" files

#### Minimalist Naming Principle
- Use function-oriented naming: `server.py`, `search.py`, `database.py`
- Remove redundant prefixes and version identifiers
- Use consistent lowercase letters + underscores
- Maintain cross-platform naming compatibility

#### Interface Design Principle
- Minimalist approach, focus on core functionality
- Remove decorative icons and emojis
- Fixed display of common interactive elements
- Maintain unified design language

---

## 📈 Version History

### v0.3.0 (Current) - React Migration in Progress
- ✅ Complete React + TypeScript + Vite scaffold setup
- ✅ TailwindCSS configuration (DeepSeek style)
- ✅ Core dependencies installed (zustand, react-query, socket.io)
- ✅ Project structure simplified, enhancement system removed
- 🔄 Backend CORS configuration in progress
- ⏳ Chat component development pending

### v0.2.1 - Project Cleanup and Optimization
- ✅ Removed virtual environment (579MB+) and temporary files
- ✅ Cleaned test databases and cache files
- ✅ Removed all .DS_Store system files
- ✅ Optimized project structure, maintaining 12 core files
- ✅ Project size reduced from 585MB+ to 472KB

### v0.2.0 - Feature Enhancement
- ✅ Database functionality enhancement
- ✅ Search feature addition
- ✅ UI component optimization
- ✅ FastAPI service integration

### v0.1.0 - Initial Version
- ✅ Basic requirement clarification functionality
- ✅ Streamlit interface
- ✅ DeepSeek integration

---

## 📞 Support and Usage

### Quick Testing
1. Start application: `python server.py`
2. Open browser and navigate to displayed address
3. Input test requirement: "I want to build a website"
4. Experience AI questioning and clarification process

### API Service
Start API service:
```bash
python server.py
```

API documentation access: http://localhost:8000/docs

---

## 📄 License

MIT License

---

**Project Version**: v0.3.0
**Last Updated**: 2025-12-16
**Development Directory**: `/Users/hl/Projects/Agent/agent_ask/`
**GitHub Repository**: [https://github.com/Golden-forest/Agent_Ask](https://github.com/Golden-forest/Agent_Ask)