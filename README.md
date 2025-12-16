# Agent_Ask

> A minimalist AI-powered requirements clarification assistant (React migration in progress)

---

## 🎯 Project Overview

Agent_Ask is an AI assistant powered by DeepSeek that helps users clarify and refine requirements through structured questioning. The project adopts a minimalist design philosophy, focusing on core functionality with a clean, no-decoration interface.

---

## ✨ Current Status

**v0.3.0** - React Architecture Migration Version
- ✅ React + TypeScript + Vite scaffolding completed
- ✅ TailwindCSS configured (DeepSeek style)
- ✅ Core dependencies installed (zustand, react-query, socket.io, etc.)
- 🔄 Backend CORS configuration in progress
- ⏳ Chat component development pending
- ✅ Project structure simplified, enhanced prompt system removed

---

## 🚀 Quick Start

### One-Click Setup (Recommended)

```bash
# 1. Navigate to project directory
cd /Users/hl/Projects/Agent/agent_ask

# 2. Run auto-configuration script
chmod +x setup_env.sh
./setup_env.sh

# 3. Configure API keys
# Edit .env file, add your DeepSeek API key
# DEEPSEEK_API_KEY=sk-xxxxxxxx

# 4. Start application
./start.sh
```

### Manual Setup

<details>
<summary>Click to expand manual setup steps</summary>

```bash
# 1. Navigate to project directory
cd /Users/hl/Projects/Agent/agent_ask

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Configure environment variables
cp .env.example .env
# Edit .env file, add your API keys

# 6. Start application
./start.sh
```

</details>

### Access Addresses
- **Default Port**: 8501
- **Auto Port Detection**: If 8501 is occupied, automatically tries 8502, 8503...


---

## 💡 Usage Flow

1. **Describe Requirements** - Input your initial ideas or requirements
2. **AI Questions** - AI asks targeted clarification questions (A/B/C/D options)
3. **Select Response** - Choose preset options or provide custom answers
4. **Multi-round Dialogue** - Continue conversation until requirements are clear
5. **Complete Analysis** - Input "Accept" to get complete requirements analysis report

---

## 🏗️ Technical Architecture

### Core Technology Stack
- **Frontend Framework**: React 18 + TypeScript + Vite ✅
- **API Framework**: FastAPI 0.121.0
- **LLM Service**: DeepSeek (via langchain-openai)
- **Database**: SQLAlchemy 2.0.44
- **Search Functionality**: Serper API Integration
- **Python Version**: 3.9.6

### Frontend Technology Stack
- **State Management**: Zustand ✅ Installed
- **UI Framework**: TailwindCSS + Headless UI ✅ Configured
- **Real-time Communication**: Socket.IO ✅ Installed
- **API Integration**: TanStack Query ✅ Installed
- **Routing**: React Router v6 ✅ Installed

### Design Features
- **Minimalism**: Pure text interface, no decorative elements
- **Fixed Layout**: A/B/C/D/Accept buttons always displayed
- **Responsive Design**: Adapts to desktop, tablet, mobile devices
- **Dark Theme**: Focus on content, reduce distractions

---

## 📁 Project Structure

```
agent_ask/
├── Backend Files (Root Directory)
│   ├── server.py           # FastAPI server (CORS to be added)
│   ├── database.py         # Database module
│   ├── config.py          # Configuration management
│   ├── search.py          # Search module
│   ├── requirements.txt   # Python dependencies
│   ├── .env               # Environment variables configuration
│   ├── chat.db            # SQLite database
│   └── venv/              # Python virtual environment
├── frontend/              # React frontend ✅ Created
│   ├── src/
│   │   ├── index.css     # TailwindCSS styles ✅ Configured
│   │   ├── App.tsx       # Main application component (to be developed)
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
│   ├── PROJECT_STRUCTURE.md  # Project structure documentation
│   └── REACT_MIGRATION_PLAN.md # Migration plan
└── Version Control
    └── .git/              # Git version control history
```

**Notes**:
- Virtual environment (`venv/`) has been cleaned, needs to be recreated
- Database file (`chat.db`) is automatically created at runtime
- All temporary files cleaned, maintaining minimalist structure

---

## 🎨 Interface Features

### Minimalist Design
- Pure text interface, no icon decorations
- Fixed display of A/B/C/D/Accept shortcut buttons
- Unified design language and interaction patterns

### Core Features
- **Intelligent Requirements Clarification**: DeepSeek-based multi-round dialogue system
- **Quick Options**: A/B/C/D/Accept always displayed for fast response
- **Web Search**: Integrated real-time search for background information support
- **Data Persistence**: Complete conversation history storage and management
- **API Service**: FastAPI backend supporting RESTful interfaces

---

## 🔧 Configuration

### Environment Variables

The project uses `.env` file for configuration. For first-time use, copy from `.env.example`:

```bash
cp .env.example .env
```

### Required Configuration

```bash
# DeepSeek API configuration (required)
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

Get API key: [https://platform.deepseek.com/](https://platform.deepseek.com/)

### Optional Configuration

```bash
# Serper search API (optional, search disabled if not configured)
SERPER_API_KEY=your_serper_api_key_here
```

Get API key: [https://serper.dev/](https://serper.dev/)

### Application Configuration

```bash
# Basic configuration
APP_NAME=Agent_Ask
DEFAULT_PORT=8501

# Conversation configuration
MAX_CONVERSATION_HISTORY=10        # Number of conversation rounds to keep
SEARCH_MIN_LENGTH=10               # Minimum input length to trigger search
SEARCH_ON_FOLLOWUP=false           # Enable search in follow-up conversations
MIN_MESSAGES_FOR_REPORT=3          # Minimum messages for report generation

# Database configuration
DATABASE_URL=sqlite:///chat.db

# Performance configuration
ENABLE_SEARCH_CACHE=true           # Enable search caching
SEARCH_CACHE_TTL_HOURS=24          # Search cache validity period (hours)
ENABLE_LLM_CACHING=true            # Enable LLM caching
```


---

## 📊 Features

### ✅ Implemented Features
- [x] Intelligent requirements clarification dialogue
- [x] A/B/C/D quick options
- [x] Custom response support
- [x] Real-time web search
- [x] Conversation history storage
- [x] Accept command to complete analysis
- [x] Complete requirements report generation
- [x] FastAPI backend service
- [x] Responsive interface design

### 🔄 Technical Optimizations
- [x] Minimalist project structure (12 core files)
- [x] Project size optimization (472KB)
- [x] Cleaned temporary files and cache
- [x] Unified naming conventions
- [x] Version control management

---

## 🐛 Development Guide

### Development Principles

#### Working Directory Simplicity Principle
- Keep root directory containing only essential files for operation
- Clean up temporary files, screenshots, test reports in a timely manner
- Avoid duplicate version files, use git version control
- Don't keep "might be useful later" files

#### Naming Simplicity Principle
- Use function-oriented naming: `server.py`, `search.py`, `database.py`
- Remove redundant prefixes and version identifiers
- Use consistent lowercase letters + underscores
- Maintain cross-platform compatible naming

#### Interface Design Principle
- Minimalism, focus on core functionality
- Remove decorative icons and emoji
- Fixed display of common interactive elements
- Maintain unified design language

---

## 📈 Version History

### v0.3.0 (2025-11-21) - React Architecture Migration Version
- ✅ React + TypeScript + Vite scaffolding completed
- ✅ TailwindCSS configured (DeepSeek style)
- ✅ Core dependencies installed
- ✅ Project structure simplified, enhanced prompt system removed
- ✅ README translated to English
- ✅ Code archived to GitHub

### v0.2.1 (2025-11-20) - Project Cleanup & Optimization Version
- ✅ Deleted virtual environment (579MB+) and temporary files
- ✅ Cleaned test database and cache files
- ✅ Removed all .DS_Store system files
- ✅ Optimized project structure, keeping 12 core files
- ✅ Reduced project size from 585MB+ to 472KB
- ✅ Updated documentation to reflect current project status

### v0.2.0 (2025-11-09) - Feature Enhancement Version
- ✅ Enhanced database functionality
- ✅ Added search functionality
- ✅ Optimized UI components
- ✅ Integrated FastAPI service

### v0.1.0 (2025-11-03) - Initial Version
- ✅ Basic requirements clarification functionality
- ✅ Streamlit interface
- ✅ DeepSeek integration

---

## 📞 Support & Usage

### Quick Test
1. Start application: `./start.sh`
2. Open browser and visit the displayed address
3. Input test requirement: "I want to create a website"
4. Experience AI questioning and clarification process

### API Service
Start API service:
```bash
python server.py
```

API documentation: http://localhost:8000/docs

---

## 📄 License

MIT License

---

**Project Version**: v0.3.0
**Last Updated**: 2025-11-21
**Development Directory**: `/Users/hl/Projects/Agent/agent_ask/`
**GitHub Repository**: https://github.com/Golden-forest/Agent_Ask