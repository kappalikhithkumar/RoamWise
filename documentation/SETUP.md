# Setup and Development Guide

### Prerequisites
* **Node.js**: v18+ (verified: v24.18.0)
* **Python**: 3.10+ (verified: 3.12.14)

### Quick Start

#### 1. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python run.py
```
Backend runs at `http://127.0.0.1:5000`
Health Check: `http://127.0.0.1:5000/api/health`

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`
