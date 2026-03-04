# Clara Agent - Detailed Setup Guide for Evaluators

## Quick Start (5 minutes)

```bash
# 1. Clone repository
git clone https://github.com/chetan-0o0/clara_agent.git
cd clara_agent

# 2. Install dependencies
npm install

# 3. Get Groq API Key (free)
# Visit: https://console.groq.com
# Create account → Generate API Key → Copy key

# 4. Create .env file
cp .env.example .env
# Edit .env and paste your API key

# 5. Start server
npm start

# 6. Open browser
# Navigate to: http://localhost:3000
```

---

## Step-by-Step Installation

### Step 1: Prerequisites Check

**Windows:**
```bash
node --version    # Should be v18.0.0 or higher
npm --version     # Should be 9.0.0 or higher
```

**Mac/Linux:**
```bash
node --version
npm --version
```

If not installed, download from: https://nodejs.org/

### Step 2: Clone Repository

```bash
git clone https://github.com/chetan-0o0/clara_agent.git
cd clara_agent
```

### Step 3: Install Dependencies

```bash
npm install
```

This installs:
- Express.js (web server)
- Groq SDK (AI model access)
- Multer (file upload)
- CORS (cross-origin requests)
- And other utilities

**Expected output:**
```
added 123 packages in 45 seconds
```

### Step 4: Get Groq API Key (FREE)

**Duration: 2 minutes**

1. Visit: https://console.groq.com
2. Click "Sign Up" 
3. Create account with email
4. Verify email
5. Go to "API Keys" section
6. Click "Create New API Key"
7. Copy the key (starts with `gsk_`)

**Important:** Keep this key secret!

### Step 5: Configure Environment

Create `.env` file:

**Option A: Command Line**
```bash
cp .env.example .env
```

**Option B: Manual**
1. Create file named `.env` in project root
2. Copy content from `.env.example`
3. Edit and replace `your_api_key_here` with your actual Groq API key

**Final `.env` file:**
```env
GROQ_API_KEY=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
PORT=3000
GROQ_MODEL=llama-3.3-70b-versatile
RATE_LIMIT_DELAY_MS=2500
```

### Step 6: Start Application

```bash
npm start
```

**Expected output:**
```
Server running on http://localhost:3000
```

### Step 7: Access Web Interface

1. Open browser (Chrome, Firefox, Safari, Edge)
2. Go to: http://localhost:3000
3. You should see the Clara Agent interface

---

## Testing the Installation

### Test 1: Web Interface
```
✓ Page loads
✓ Text area visible
✓ Process button clickable
```

### Test 2: Basic Processing
```bash
# Paste this sample transcript in web interface:

Agent: Hello, welcome to our service.
Customer: Hi, I'd like to know about your pricing plans.
Agent: We have three plans - Basic at $29, Pro at $79, and Enterprise custom pricing.
Customer: What's included in Pro?
Agent: Pro includes 24/7 support, advanced analytics, and priority processing.
Customer: That sounds good, I'll go with Pro.
Agent: Great! I'll set that up for you.

# Expected: JSON output with agent specifications
```

### Test 3: Batch Processing
```bash
npm run batch
```
**Expected:** Processing of all demo transcripts complete

---

## Understanding the Output

### Generated Files

When you process a transcript, files are created in:
```
outputs/accounts/ACC-001/v1/
├── agent_spec.json      # Full agent configuration
├── account_memo.json    # Agent metadata
└── (at v2/ when updated)
```

### Sample agent_spec.json
```json
{
  "accountId": "ACC-001",
  "agentName": "Sales Agent",
  "version": "v1",
  "prompt": "You are a helpful sales representative...",
  "capabilities": [
    "answer_pricing_questions",
    "process_orders"
  ],
  "systemMessage": "Provide clear and helpful responses...",
  "extractedInfo": {
    "services": ["pricing", "support"],
    "tone": "professional"
  }
}
```

---

## Common Issues & Solutions

### Issue 1: "Cannot find module 'groq-sdk'"
**Solution:**
```bash
npm install
npm start
```

### Issue 2: "Port 3000 already in use"
**Solution:** Edit `.env`:
```env
PORT=3001  # Try a different port
```

### Issue 3: "API key is invalid or has been revoked"
**Solution:**
1. Check `.env` file has correct key
2. Verify key from https://console.groq.com
3. Regenerate key if needed

### Issue 4: "GROQ_API_KEY is not set"
**Solution:**
1. Verify `.env` file exists in project root
2. Check exact formatting: `GROQ_API_KEY=your_key`
3. Restart server: `npm start`

### Issue 5: "Cannot access http://localhost:3000"
**Solution:**
1. Verify server is running (check terminal output)
2. Check if port 3000 is correct
3. Try: http://127.0.0.1:3000
4. Check firewall settings

---

## Advanced Usage

### Batch Process All Transcripts

```bash
npm run batch
```

This processes:
- `data/transcripts/demo_001.txt` → `outputs/accounts/ACC-001/v1/`
- `data/transcripts/demo_002.txt` → `outputs/accounts/ACC-002/v1/`
- etc.

### Generate Sample Data

```bash
npm run generate-data
```

Creates test transcripts in `data/transcripts/`

### API Testing with curl

```bash
curl -X POST http://localhost:3000/process \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "Agent: Hello. Customer: Hi there.",
    "accountId": "ACC-TEST",
    "callType": "demo"
  }'
```

---

## Performance Expectations

| Operation | Time | Notes |
|-----------|------|-------|
| Server startup | < 2 seconds | First run may be slower |
| Process 1 transcript | 3-5 seconds | Depends on API response |
| Batch process 10 | 30-50 seconds | With rate limiting |
| Web interface load | < 1 second | Instant |

---

## Troubleshooting Checklist

- [ ] Node.js v18+ installed
- [ ] npm packages installed (`npm install` completed)
- [ ] `.env` file created with correct path
- [ ] `GROQ_API_KEY` is set in `.env`
- [ ] API key is valid (from console.groq.com)
- [ ] Port 3000 is not blocked/in use
- [ ] Server started successfully (`npm start`)
- [ ] Browser can access http://localhost:3000
- [ ] No error messages in terminal

---

## Docker Alternative

If you prefer containerization:

```bash
# Build image
docker build -t clara-agent .

# Run container
docker run -p 3000:3000 -e GROQ_API_KEY=your_key clara-agent

# Or use Docker Compose
docker-compose up
```

---

## Project Structure Reference

```
clara_agent/
├── src/                    # Source code
│   ├── index.js           # Main server (start here)
│   ├── extractor.js       # Text extraction logic
│   ├── promptGenerator.js # AI prompt creation
│   ├── storage.js         # File I/O operations
│   ├── taskTracker.js     # Pipeline progress
│   └── versioning.js      # Version management
├── public/                 # Frontend (web UI)
│   ├── index.html
│   ├── app.js
│   └── styles.css
├── data/                   # Input transcripts
│   └── transcripts/
│       ├── demo_*.txt
│       └── onboarding_*.txt
├── outputs/                # Generated output (created at runtime)
│   ├── tasks.json
│   ├── accounts/
│   └── ...
├── scripts/                # Utility scripts
├── .env.example           # Environment template
├── package.json           # Dependencies
└── README.md              # Main documentation
```

---

## Support Resources

1. **API Documentation:** https://console.groq.com/docs
2. **Node.js Guide:** https://nodejs.org/docs
3. **Express.js Docs:** https://expressjs.com
4. **GitHub Issues:** Check repository for known issues

---

## Next Steps After Setup

1. ✅ Installation complete
2. ✅ Server running
3. ✅ Web interface accessible
4. **Next:** Process a transcript (see "Testing the Installation")
5. **Next:** Review generated output in `outputs/` folder
6. **Next:** Try batch processing with `npm run batch`
7. **Next:** Explore the code in `src/` folder

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm start` | Start web server |
| `npm run batch` | Process all transcripts |
| `npm run generate-data` | Create sample data |
| `cp .env.example .env` | Create environment file |

---

**Edition:** v1.0  
**Last Updated:** March 5, 2026  
**Status:** Production Ready ✓
