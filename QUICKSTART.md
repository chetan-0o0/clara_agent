# Clara Agent - Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Prerequisites
- Node.js v18+ ([Download](https://nodejs.org/))
- Free Groq API Key ([Get it here](https://console.groq.com))

### 2. Clone & Install
```bash
git clone https://github.com/chetan-0o0/clara_agent.git
cd clara_agent
npm install
```

### 3. Configure
```bash
cp .env.example .env
```

Then edit `.env` and add your Groq API key:
```env
GROQ_API_KEY=your_key_from_console_groq_com_here
PORT=3000
```

### 4. Start
```bash
npm start
```

### 5. Use
Open: **http://localhost:3000** in your browser

---

## 🧪 Test It Out

### Option A: Web Interface (Easiest)
1. Go to http://localhost:3000
2. Paste a call transcript in the text box
3. Click "Process"
4. See generated agent specification!

### Option B: Sample Transcript
```bash
npm run batch
```
Processes all demo transcripts in `data/transcripts/`

### Option C: REST API
```bash
curl -X POST http://localhost:3000/process \
  -H "Content-Type: application/json" \
  -d '{"transcript":"Agent: Hello. Customer: Hi there.","accountId":"ACC-001"}'
```

---

## 📁 Output Location

Check results here:
```
outputs/accounts/ACC-001/v1/
├── agent_spec.json       → Complete agent configuration
├── account_memo.json     → Agent metadata
└── changelog.json        → Version history
```

---

## ❌ Troubleshooting

| Problem | Fix |
|---------|-----|
| Port 3000 in use | Change `PORT=3001` in `.env` |
| API key error | Verify key from https://console.groq.com |
| Can't connect | Check server running: `npm start` |
| No output | Check `.env` file exists |

---

## 📚 More Info

- **Full Setup:** See [SETUP.md](SETUP.md)
- **Full Documentation:** See [README.md](README.md)
- **API Endpoints:** See [README.md](README.md#api-endpoints)

---

## ✅ What You Get

After processing:
- 📄 Agent configuration (JSON)
- 📋 Agent metadata
- 📊 Version history
- 🔄 Change tracking

---

**Ready to go!** Start with: `npm start`
