# Clara Agent Pipeline

## Overview

Clara Agent is a zero-cost AI automation pipeline that processes demo calls and generates Retell AI agent specifications. The pipeline transforms call transcripts into structured agent configurations through multi-step processing.

**Pipeline Flow:**
1. **Demo Call Processing** → Extract conversation patterns and requirements
2. **Retell Agent Draft** → Generate initial agent specifications
3. **Onboarding Updates** → Apply system-wide updates across agents
4. **Agent Revision** → Refine agent specifications with feedback

**Technology Stack:**
- **Backend:** Node.js + Express.js
- **AI Model:** Groq API (llama-3.3-70b-versatile)
- **Processing:** Multi-stage pipeline with versioning
- **Frontend:** Vanilla JavaScript + HTML/CSS

---

## Prerequisites

- **Node.js** v18.0.0 or higher
- **npm** (comes with Node.js)
- **Groq API Key** (free tier available at https://console.groq.com)

---

## Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/chetan-0o0/clara_agent.git
cd clara_agent
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file by copying the example:
```bash
cp .env.example .env
```

Edit `.env` and add your Groq API key:
```env
# Groq API Key (get free from https://console.groq.com)
GROQ_API_KEY=your_api_key_here

# Server Configuration
PORT=3000

# Groq Model
GROQ_MODEL=llama-3.3-70b-versatile

# Rate Limiting (Groq free tier: 30 RPM)
RATE_LIMIT_DELAY_MS=2500
```

### 4. Verify Installation
```bash
npm run dev
```
Expected output:
```
Server running on http://localhost:3000
```

---

## Usage

### Option 1: Web Interface (Recommended)
```bash
npm start
```
Then open http://localhost:3000 in your browser

### Option 2: Process Single Transcript
```bash
node src/index.js
```

### Option 3: Batch Processing
```bash
npm run batch
```
Processes all transcripts in `data/transcripts/` folder

### Option 4: Generate Sample Data
```bash
npm run generate-data
```
Creates sample data for testing

---

## Project Structure

```
clara_agent/
├── src/
│   ├── index.js           # Main entry point & API server
│   ├── extractor.js       # Call transcript extraction
│   ├── promptGenerator.js # AI prompt generation
│   ├── storage.js         # File system storage
│   ├── taskTracker.js     # Pipeline progress tracking
│   └── versioning.js      # Version management
├── data/
│   └── transcripts/       # Input call transcripts
│       ├── demo_*.txt     # Demo call samples
│       └── onboarding_*.txt # Onboarding call samples
├── outputs/
│   ├── tasks.json         # Pipeline execution logs
│   └── accounts/          # Generated agent specs
│       └── ACC-001/       # Per-account directory
│           ├── changelog.json
│           ├── changes.md
│           ├── v1/        # Version 1 specs
│           └── v2/        # Version 2 specs
├── scripts/
│   ├── batch_process.js   # Batch processing script
│   └── generate_sample_data.js # Sample data generator
├── public/
│   ├── index.html         # Web UI
│   ├── app.js             # Frontend logic
│   └── styles.css         # Styling
└── workflows/
    └── clara_pipeline.json # Pipeline configuration
```

---

## API Endpoints

### GET /
Loads the web interface

### POST /process
**Process a single transcript**

Request body:
```json
{
  "transcript": "Your call transcript text here",
  "accountId": "ACC-001",
  "callType": "demo"
}
```

Response:
```json
{
  "success": true,
  "agentSpec": { /* Generated spec */ },
  "version": "v1"
}
```

### GET /outputs/:accountId
Retrieve generated specifications for an account

### GET /task-status
Check pipeline execution status

---

## Sample Execution

### 1. Start the Server
```bash
npm start
```

### 2. Open Web Interface
Navigate to: `http://localhost:3000`

### 3. Submit a Transcript
- Paste a call transcript in the text area
- Click "Process"
- View generated agent specifications

### 4. Check Outputs
Generated files are saved in `outputs/accounts/<ACCOUNT-ID>/v1/`
- `agent_spec.json` - Full agent configuration
- `account_memo.json` - Agent details
- `changelog.json` - Version history

---

## Example Workflow

1. **Input:** Call transcript from `data/transcripts/demo_001.txt`
2. **Processing:** 
   - Extract key information from transcript
   - Generate prompts for AI model
   - Call Groq API for processing
   - Structure output as agent spec
3. **Output:** 
   - `outputs/accounts/ACC-001/v1/agent_spec.json`
   - `outputs/accounts/ACC-001/v1/account_memo.json`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Port 3000 already in use** | Change `PORT` in `.env` file |
| **API key invalid** | Get a new key from https://console.groq.com |
| **Rate limit errors** | Increase `RATE_LIMIT_DELAY_MS` in `.env` |
| **No API key error** | Verify `.env` file exists and `GROQ_API_KEY` is set |

---

## Performance Notes

- **Free Tier:** 30 requests per minute (RPM)
- **Default Delay:** 2.5 seconds between requests
- **Processing Time:** ~3-5 seconds per transcript
- **Storage:** Versioned outputs stored locally

---

## Docker Support

### Build Docker Image
```bash
docker build -t clara-agent .
```

### Run Container
```bash
docker run -p 3000:3000 -e GROQ_API_KEY=your_key_here clara-agent
```

### Using Docker Compose
```bash
docker-compose up
```

---

## Development

### Available Scripts
```bash
npm start          # Start production server
npm run dev        # Start with auto-reload (same as start)
npm run batch      # Batch process all transcripts
npm run generate-data  # Generate sample data
```

### Adding New Transcripts
1. Add `.txt` files to `data/transcripts/`
2. Run batch processing: `npm run batch`
3. Check outputs in `outputs/accounts/`

---

## License

MIT

## Support

For issues or questions, please check the project repository or documentation.

---

## Getting a Free Groq API Key

1. Visit: https://console.groq.com
2. Sign up for free account
3. Generate API key
4. Add to `.env` file
5. You get 30 requests per minute for free!

---

**Last Updated:** March 5, 2026