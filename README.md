# Clara Answers — Zero-Cost Automation Pipeline

> **Demo Call → Retell Agent Draft → Onboarding Updates → Agent Revision**

A fully automated pipeline that processes demo call transcripts into Retell AI agent configurations (v1), then updates them via onboarding call transcripts (v2). Built with zero-cost tools only.

---

## 🏗 Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌───────────────┐     ┌──────────────┐
│  Transcript      │────▶│  Groq LLM    │────▶│ Account Memo  │────▶│  Agent Spec  │
│  (demo/onboard)  │     │  (free tier)  │     │  (JSON)       │     │  (JSON)      │
└─────────────────┘     └──────────────┘     └───────────────┘     └──────────────┘
                                                     │                      │
                                                     ▼                      ▼
                                              ┌──────────────┐     ┌──────────────┐
                                              │  Storage      │     │  Task Tracker │
                                              │  (local JSON) │     │  (local JSON) │
                                              └──────────────┘     └──────────────┘
```

### Data Flow

1. **Pipeline A (Demo → v1)**: Transcript → Groq extraction → Account Memo v1 → Agent Spec v1 → Storage
2. **Pipeline B (Onboarding → v2)**: Transcript + v1 Memo → Groq extraction → Account Memo v2 → Agent Spec v2 → Changelog → Storage

### Tech Stack

| Component | Tool | Cost |
|-----------|------|------|
| LLM | Groq API (`llama-3.3-70b-versatile`) | Free tier |
| Orchestrator | n8n (self-hosted Docker) | Free |
| Backend | Node.js / Express | Free |
| Storage | Local JSON files | Free |
| Task Tracker | Local JSON (Asana alternative) | Free |
| Dashboard | Vanilla HTML/CSS/JS | Free |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18
- **Docker & Docker Compose** (for n8n)
- **Groq API Key** — free at [console.groq.com](https://console.groq.com)

### 1. Clone & Install

```bash
git clone <repo-url>
cd claraagent
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
```

### 3. Plug In the Dataset

**Option A — Use evaluator-provided transcripts:**
```bash
# Place the 10 transcript files into data/transcripts/
# Any naming convention works — the pipeline auto-classifies files as demo/onboarding
# based on filename keywords and content analysis
mkdir -p data/transcripts
cp /path/to/your/transcripts/* data/transcripts/
```

The pipeline automatically:
- **Classifies** files as demo or onboarding (by filename keywords or content heuristics)
- **Matches** onboarding transcripts to their demo counterparts (by Account ID, company name, file number, or position)
- **Supports** `.txt`, `.md`, and `.text` file formats

**Option B — Use built-in sample data (for testing):**
```bash
npm run generate-data
```
This creates 5 demo + 5 onboarding sample transcripts in `data/transcripts/`.

### 4. Start the Server

```bash
npm start
```

Dashboard available at **http://localhost:3000**

### 5. Run the Full Pipeline

**Option A — Via Dashboard:**
Open http://localhost:3000 and click **"Run Full Batch"**

**Option B — Via CLI:**
```bash
npm run batch
```

**Option C — Via API:**
```bash
curl -X POST http://localhost:3000/api/batch/run
```

---

## 🐳 Docker Setup (with n8n)

```bash
# Start everything
docker compose up -d

# Clara Dashboard: http://localhost:3000
# n8n Workflow UI: http://localhost:5678
```

### Import n8n Workflow

1. Open n8n at http://localhost:5678
2. Go to **Workflows → Import from File**
3. Select `workflows/clara_pipeline.json`
4. Click **Execute Workflow**

---

## 📁 Project Structure

```
claraagent/
├── README.md                          # This file
├── package.json                       # Dependencies
├── docker-compose.yml                 # Docker services
├── Dockerfile                         # App container
├── .env.example                       # Environment template
├── src/
│   ├── index.js                       # Express API server
│   ├── extractor.js                   # Groq-powered transcript extraction
│   ├── promptGenerator.js             # Retell Agent spec + prompt generator
│   ├── versioning.js                  # Diff and changelog engine
│   ├── storage.js                     # File-based JSON storage
│   └── taskTracker.js                 # Local task tracking
├── public/
│   ├── index.html                     # Web dashboard
│   ├── styles.css                     # Dark theme styles
│   └── app.js                         # Dashboard client JS
├── scripts/
│   ├── generate_sample_data.js        # Sample transcript generator
│   └── batch_process.js               # CLI batch runner
├── data/
│   └── transcripts/                   # Input transcripts
│       ├── demo_01.txt ... demo_05.txt
│       └── onboarding_01.txt ... onboarding_05.txt
├── outputs/
│   └── accounts/                      # Generated outputs
│       └── <account_id>/
│           ├── v1/
│           │   ├── account_memo.json   # Extracted account data
│           │   └── agent_spec.json     # Retell agent config
│           ├── v2/
│           │   ├── account_memo.json   # Updated account data
│           │   └── agent_spec.json     # Updated agent config
│           ├── changelog.json          # Structured changes
│           └── changes.md              # Human-readable changelog
└── workflows/
    └── clara_pipeline.json            # n8n workflow export
```

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/accounts` | List all processed accounts |
| `GET` | `/api/accounts/:id` | Get account details (v1, v2, changelog) |
| `GET` | `/api/accounts/:id/diff` | Get v1→v2 diff data |
| `POST` | `/api/pipeline/demo` | Pipeline A: process demo transcript |
| `POST` | `/api/pipeline/onboarding` | Pipeline B: process onboarding transcript |
| `POST` | `/api/batch/run` | Run batch pipeline on all transcripts |
| `GET` | `/api/transcripts` | List available transcripts |
| `GET` | `/api/tasks` | Get task tracker items |

---

## 🎙 Retell Agent Setup

### If Retell API is accessible (free tier):
1. Create account at [retellai.com](https://retellai.com)
2. Use the generated `agent_spec.json` to create agents programmatically via Retell API

### If Retell requires payment:
The pipeline generates a complete **Agent Draft Spec JSON** per account. To use it:

1. Open the Retell dashboard
2. Create a new agent
3. Copy the `system_prompt` from the generated spec into the agent's prompt field
4. Set voice settings according to the `voice_style` section
5. Configure call transfer rules as specified in `call_transfer_protocol`

The generated spec includes all Retell-compatible fields and can be directly imported.

---

## 📄 Output Format

### Account Memo JSON (per account)
Contains: `account_id`, `company_name`, `business_hours`, `office_address`, `services_supported`, `emergency_definition`, `emergency_routing_rules`, `non_emergency_routing_rules`, `call_transfer_rules`, `integration_constraints`, `after_hours_flow_summary`, `office_hours_flow_summary`, `questions_or_unknowns`, `notes`

### Agent Spec JSON (per account)  
Contains: `agent_name`, `voice_style`, `system_prompt`, `first_utterance`, `key_variables`, `tool_invocation_placeholders`, `call_transfer_protocol`, `fallback_protocol`, `version`

### Changelog (per account)
Contains: `memo_changes` (field-level diffs), `spec_changes` (agent config diffs), `summary`

---

## ⚠ Known Limitations

1. **Groq Rate Limits**: Free tier limits to ~30 RPM. Built-in delay handles this, but 10 files take ~1-2 minutes.
2. **Retell API**: If Retell requires payment for programmatic agent creation, specs are generated as importable JSON instead.
3. **Transcription**: Pipeline accepts text transcripts. For audio files, use Whisper locally (not included but compatible).
4. **LLM Accuracy**: Extraction quality depends on transcript clarity. The prompt instructs the LLM to flag unknowns.

## 🔧 Production Improvements

With production access, I would add:
- **Retell API integration** for direct agent creation/update
- **Supabase/PostgreSQL** for persistent storage with querying
- **Asana API** for real task management
- **Whisper integration** for automatic transcription
- **Webhook triggers** in n8n for real-time processing
- **Authentication** for the dashboard
- **Monitoring & alerting** for pipeline failures
- **Retry logic** with exponential backoff for API calls
