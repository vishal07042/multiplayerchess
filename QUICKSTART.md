# Quick Start Guide

## Windows Users

### Backend Setup
1. Open PowerShell and navigate to the `backend` folder
2. Create virtual environment: `python -m venv venv`
3. Activate it: `venv\Scripts\activate`
4. Install: `pip install -r requirements.txt`
5. Run: `python main.py`

### Frontend Setup
1. Open Command Prompt and navigate to the `frontend` folder
2. Install: `npm install`
3. Start: `npm start`

## macOS/Linux Users

### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Testing the Game

1. Open `http://localhost:3000` in your browser (or two browser windows)
2. Player 1: Create a game - note the Game ID
3. Player 2: Join the game with the Game ID
4. Start playing!

## Common Issues

**"Port 3000/8000 already in use"**
- Kill the process: `lsof -ti:3000 | xargs kill -9` (macOS/Linux)
- Or change the port in .env file

**WebSocket connection failed**
- Check backend is running on port 8000
- Verify REACT_APP_API_URL in frontend .env matches backend URL

**"ModuleNotFoundError: No module named 'chess'"**
- Ensure virtual environment is activated
- Run: `pip install python-chess`
