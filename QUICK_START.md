# Quick Start Guide

## ✅ Current Status
- ✅ Dependencies installed
- ✅ Environment file created
- ✅ Server code ready
- ⚠️  Supabase not configured (optional for testing)

## 🚀 Start the Server

### Option 1: Start and Keep Running
```bash
npm run dev
```
**Keep this terminal window open** - the server will run and watch for changes.

### Option 2: Test Without Supabase
The server will run in development mode without database functionality.

## 🧪 Test the API

Open a **new terminal window** and run:

```bash
node test-api.js
```

Or visit these URLs in your browser:
- http://localhost:3001 - API info
- http://localhost:3001/health - Health check
- http://localhost:3001/api/evaluate/health - Evaluation service health

## 📋 Expected Output

When you start the server (`npm run dev`), you should see:
```
⚠️  Supabase configuration missing - running in development mode without database
🚀 TrustWeave Backend API running on port 3001
📊 Environment: development
🔗 API Base URL: http://localhost:3001
📋 Available endpoints:
   POST /api/evaluate/full - Full evaluation pipeline
   POST /api/evaluate/debug - Debug evaluation with intermediate outputs
   GET  /api/evaluate/health - Service health check
   GET  /health - Overall system health
```

## 🔧 Next Steps

### 1. Set up Supabase (Optional)
- Follow `SUPABASE_SETUP.md`
- Update `.env` with real credentials
- Run `npm run test:supabase`

### 2. Integrate Your Agents
- Edit `src/agents/index.ts`
- Replace placeholder implementations with your actual agents

### 3. Test Full Pipeline
- Use the frontend demo: `frontend-example/index.html`
- Or test with curl/Postman using examples in `examples/`

## 🐛 Troubleshooting

### "tsx is not recognized"
```bash
npm install
```

### "Missing Supabase configuration"
This is expected - the server runs without Supabase in development mode.

### "Port 3001 already in use"
Change the port in `.env`:
```
PORT=3002
```

### Server won't start
1. Make sure you're in the project directory
2. Check that `.env` file exists
3. Try: `npm install` then `npm run dev`