// Main Express server - Clara Answers Pipeline API + Web Dashboard
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();

// Multer setup for file uploads
const TRANSCRIPTS_DIR = path.join(__dirname, '..', 'data', 'transcripts');
if (!fs.existsSync(TRANSCRIPTS_DIR)) fs.mkdirSync(TRANSCRIPTS_DIR, { recursive: true });

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, TRANSCRIPTS_DIR),
        filename: (req, file, cb) => cb(null, file.originalname)
    }),
    fileFilter: (req, file, cb) => {
        const allowed = ['.txt', '.md', '.text', '.transcript'];
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, allowed.includes(ext));
    }
});

const { extractFromDemo, extractFromOnboarding } = require('./extractor');
const { generateAgentSpec } = require('./promptGenerator');
const { generateChangelog } = require('./versioning');
const storage = require('./storage');
const taskTracker = require('./taskTracker');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Logging middleware
app.use((req, res, next) => {
    const ts = new Date().toISOString();
    console.log(`[${ts}] ${req.method} ${req.url}`);
    next();
});

// ========== API ROUTES ==========

// List all accounts
app.get('/api/accounts', (req, res) => {
    try {
        const accounts = storage.listAccounts();
        res.json({ success: true, accounts });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get account details
app.get('/api/accounts/:id', (req, res) => {
    try {
        const id = req.params.id;
        const v1 = storage.loadV1(id);
        const v2 = storage.loadV2(id);
        const changelog = storage.loadChangelog(id);
        const task = taskTracker.getTask(id);

        if (!v1 && !v2) {
            return res.status(404).json({ success: false, error: 'Account not found' });
        }

        res.json({
            success: true,
            account_id: id,
            v1: v1,
            v2: v2,
            changelog: changelog,
            task: task
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get diff for account
app.get('/api/accounts/:id/diff', (req, res) => {
    try {
        const id = req.params.id;
        const changelog = storage.loadChangelog(id);
        const v1 = storage.loadV1(id);
        const v2 = storage.loadV2(id);

        if (!changelog) {
            return res.status(404).json({ success: false, error: 'No changelog found (v2 not yet processed)' });
        }

        res.json({
            success: true,
            account_id: id,
            changelog,
            v1_memo: v1?.memo,
            v2_memo: v2?.memo,
            v1_spec: v1?.spec,
            v2_spec: v2?.spec
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Pipeline A: Process demo transcript → v1
app.post('/api/pipeline/demo', async (req, res) => {
    try {
        const { transcript, filename } = req.body;

        if (!transcript) {
            return res.status(400).json({ success: false, error: 'transcript is required' });
        }

        console.log(`[Pipeline A] Processing demo transcript: ${filename || 'inline'}`);

        // Step 1: Extract account memo from transcript
        console.log('  → Extracting account memo via Groq...');
        const memo = await extractFromDemo(transcript);
        const accountId = memo.account_id || `ACC-${Date.now()}`;
        memo.account_id = accountId;

        // Step 2: Check idempotency
        if (storage.v1Exists(accountId)) {
            console.log(`  → v1 already exists for ${accountId}, overwriting...`);
        }

        // Step 3: Generate agent spec
        console.log('  → Generating Retell agent spec v1...');
        const spec = generateAgentSpec(memo, 1);

        // Step 4: Store outputs
        console.log('  → Saving v1 artifacts...');
        const result = storage.saveV1(accountId, memo, spec);

        // Step 5: Create task tracker item
        console.log('  → Creating task tracker entry...');
        const task = taskTracker.createTask(accountId, memo.company_name, 'demo');

        console.log(`[Pipeline A] ✓ Complete for ${accountId} (${memo.company_name})`);

        res.json({
            success: true,
            account_id: accountId,
            company_name: memo.company_name,
            version: 'v1',
            memo,
            spec,
            task,
            storage_path: result.path
        });
    } catch (err) {
        console.error(`[Pipeline A] ✗ Error: ${err.message}`);
        res.status(500).json({ success: false, error: err.message, stack: err.stack });
    }
});

// Pipeline B: Process onboarding transcript → v2
app.post('/api/pipeline/onboarding', async (req, res) => {
    try {
        const { transcript, account_id, filename } = req.body;

        if (!transcript) {
            return res.status(400).json({ success: false, error: 'transcript is required' });
        }

        if (!account_id) {
            return res.status(400).json({ success: false, error: 'account_id is required to match onboarding to existing demo' });
        }

        console.log(`[Pipeline B] Processing onboarding for account: ${account_id}`);

        // Step 1: Load existing v1
        const v1 = storage.loadV1(account_id);
        if (!v1) {
            return res.status(404).json({
                success: false,
                error: `No v1 found for account ${account_id}. Run Pipeline A first.`
            });
        }

        // Step 2: Extract updates from onboarding transcript
        console.log('  → Extracting onboarding updates via Groq...');
        const updatedMemo = await extractFromOnboarding(transcript, v1.memo);
        updatedMemo.account_id = account_id;

        // Step 3: Generate updated agent spec
        console.log('  → Generating Retell agent spec v2...');
        const updatedSpec = generateAgentSpec(updatedMemo, 2);

        // Step 4: Generate changelog
        console.log('  → Generating changelog...');
        const changelog = generateChangelog(v1.memo, updatedMemo, v1.spec, updatedSpec);

        // Step 5: Store outputs
        console.log('  → Saving v2 artifacts...');
        const result = storage.saveV2(account_id, updatedMemo, updatedSpec, changelog);

        // Step 6: Update task tracker
        console.log('  → Updating task tracker...');
        const task = taskTracker.updateTask(account_id, 'v2_complete', 'Onboarding processed');

        console.log(`[Pipeline B] ✓ Complete for ${account_id} (${updatedMemo.company_name})`);

        res.json({
            success: true,
            account_id,
            company_name: updatedMemo.company_name,
            version: 'v2',
            memo: updatedMemo,
            spec: updatedSpec,
            changelog,
            task,
            storage_path: result.path
        });
    } catch (err) {
        console.error(`[Pipeline B] ✗ Error: ${err.message}`);
        res.status(500).json({ success: false, error: err.message, stack: err.stack });
    }
});

// Classify a transcript file as 'demo' or 'onboarding' based on filename and content
function classifyTranscript(filename, content) {
    const fLower = filename.toLowerCase();
    // Filename-based (highest priority)
    if (fLower.includes('demo')) return 'demo';
    if (fLower.includes('onboarding') || fLower.includes('onboard')) return 'onboarding';

    // Content-based heuristics
    const cLower = content.toLowerCase();
    const demoSignals = ['demo call', 'demo transcript', 'sales rep', 'tell me about your business', 'learn about your business', 'what services do you'];
    const onboardSignals = ['onboarding call', 'onboarding transcript', 'onboarding session', 'confirm and fill in', 'welcome to onboarding', 'from your demo', 'updates from the demo'];

    const demoScore = demoSignals.filter(s => cLower.includes(s)).length;
    const onboardScore = onboardSignals.filter(s => cLower.includes(s)).length;

    if (onboardScore > demoScore) return 'onboarding';
    if (demoScore > 0) return 'demo';

    // Default: if filename number exists and is <=5, treat as demo; >5 as onboarding
    const num = fLower.match(/(\d+)/);
    if (num && parseInt(num[1]) > 5) return 'onboarding';
    return 'demo';
}

// Find best matching demo account for an onboarding transcript by company name
function findMatchingAccount(transcript, demoResults) {
    // Try explicit Account ID in transcript
    const idMatch = transcript.match(/Account\s*(?:ID)?[:\s]*(ACC[-_]\w+)/i);
    if (idMatch) return idMatch[1];

    // Try company name matching
    const companyMatch = transcript.match(/Company[:\s]*([^\n\r]+)/i);
    if (companyMatch && demoResults.length > 0) {
        const companyName = companyMatch[1].trim().toLowerCase();
        for (const demo of demoResults) {
            if (demo.company && demo.company.toLowerCase().includes(companyName.split(' ')[0])) {
                return demo.account_id;
            }
            if (companyName.includes(demo.company?.toLowerCase()?.split(' ')[0])) {
                return demo.account_id;
            }
        }
        // Fuzzy: check if any word from the onboarding company appears in demo companies
        const words = companyName.split(/\s+/).filter(w => w.length > 3);
        for (const demo of demoResults) {
            const demoCompany = (demo.company || '').toLowerCase();
            for (const word of words) {
                if (demoCompany.includes(word)) return demo.account_id;
            }
        }
    }

    return null;
}

// Batch process all transcripts
app.post('/api/batch/run', async (req, res) => {
    try {
        const transcriptsDir = path.join(__dirname, '..', 'data', 'transcripts');
        if (!fs.existsSync(transcriptsDir)) {
            return res.status(404).json({ success: false, error: 'No transcripts directory found. Place transcript files in data/transcripts/.' });
        }

        // Support .txt, .md, and other text formats
        const files = fs.readdirSync(transcriptsDir).filter(f =>
            f.endsWith('.txt') || f.endsWith('.md') || f.endsWith('.text') || f.endsWith('.transcript')
        );

        if (files.length === 0) {
            return res.status(404).json({ success: false, error: 'No transcript files found in data/transcripts/. Supported: .txt, .md, .text' });
        }

        // Read all files and classify them
        const classified = files.map(f => {
            const content = fs.readFileSync(path.join(transcriptsDir, f), 'utf-8');
            return { filename: f, content, type: classifyTranscript(f, content) };
        });

        const demoFiles = classified.filter(c => c.type === 'demo').sort((a, b) => a.filename.localeCompare(b.filename));
        const onboardingFiles = classified.filter(c => c.type === 'onboarding').sort((a, b) => a.filename.localeCompare(b.filename));

        console.log(`[Batch] Found ${files.length} files: ${demoFiles.length} demo + ${onboardingFiles.length} onboarding transcripts`);

        const results = { demos: [], onboardings: [], errors: [] };

        // Phase 1: Process all demos first
        for (const { filename: file, content: transcript } of demoFiles) {
            try {
                console.log(`\n[Batch] Processing demo: ${file}`);

                const memo = await extractFromDemo(transcript);
                const accountId = memo.account_id || `ACC-${Date.now()}`;
                memo.account_id = accountId;
                const spec = generateAgentSpec(memo, 1);
                storage.saveV1(accountId, memo, spec);
                taskTracker.createTask(accountId, memo.company_name, 'demo');

                results.demos.push({ file, account_id: accountId, company: memo.company_name, status: 'success' });
                console.log(`  ✓ ${accountId}: ${memo.company_name}`);
            } catch (err) {
                results.errors.push({ file, error: err.message, pipeline: 'demo' });
                console.error(`  ✗ ${file}: ${err.message}`);
            }
        }

        // Phase 2: Process onboardings
        for (let i = 0; i < onboardingFiles.length; i++) {
            const { filename: file, content: transcript } = onboardingFiles[i];
            try {
                // Multi-strategy account matching
                let accountId = null;

                // Strategy 1: Explicit Account ID in transcript
                const metaMatch = transcript.match(/Account\s*(?:ID)?[:\s]*(ACC[-_]\w+)/i);
                if (metaMatch) accountId = metaMatch[1];

                // Strategy 2: Company name matching from transcript content
                if (!accountId) {
                    accountId = findMatchingAccount(transcript, results.demos);
                }

                // Strategy 3: Index-based matching (onboarding_01 → demo_01)
                if (!accountId) {
                    const fileNum = file.match(/(\d+)/)?.[1];
                    if (fileNum && results.demos[parseInt(fileNum) - 1]) {
                        accountId = results.demos[parseInt(fileNum) - 1].account_id;
                    }
                }

                // Strategy 4: Positional fallback (nth onboarding → nth demo)
                if (!accountId && results.demos[i]) {
                    accountId = results.demos[i].account_id;
                }

                if (!accountId) {
                    results.errors.push({ file, error: 'Could not determine matching demo account', pipeline: 'onboarding' });
                    continue;
                }

                console.log(`\n[Batch] Processing onboarding: ${file} → ${accountId}`);

                const v1 = storage.loadV1(accountId);
                if (!v1) {
                    results.errors.push({ file, error: `No v1 for ${accountId}`, pipeline: 'onboarding' });
                    continue;
                }

                const updatedMemo = await extractFromOnboarding(transcript, v1.memo);
                updatedMemo.account_id = accountId;
                const updatedSpec = generateAgentSpec(updatedMemo, 2);
                const changelog = generateChangelog(v1.memo, updatedMemo, v1.spec, updatedSpec);
                storage.saveV2(accountId, updatedMemo, updatedSpec, changelog);
                taskTracker.updateTask(accountId, 'v2_complete', 'Onboarding batch processed');

                results.onboardings.push({
                    file, account_id: accountId,
                    company: updatedMemo.company_name,
                    changes_count: changelog.memo_changes.length,
                    status: 'success'
                });
                console.log(`  ✓ ${accountId}: ${changelog.memo_changes.length} changes applied`);
            } catch (err) {
                results.errors.push({ file, error: err.message, pipeline: 'onboarding' });
                console.error(`  ✗ ${file}: ${err.message}`);
            }
        }

        console.log(`\n[Batch] Complete: ${results.demos.length} demos, ${results.onboardings.length} onboardings, ${results.errors.length} errors`);

        res.json({
            success: true,
            summary: {
                total_demos: results.demos.length,
                total_onboardings: results.onboardings.length,
                total_errors: results.errors.length
            },
            results
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Batch: Demos only (Pipeline A)
app.post('/api/batch/demos', async (req, res) => {
    try {
        if (!fs.existsSync(TRANSCRIPTS_DIR)) {
            return res.status(404).json({ success: false, error: 'No transcripts directory found.' });
        }

        const files = fs.readdirSync(TRANSCRIPTS_DIR).filter(f =>
            f.endsWith('.txt') || f.endsWith('.md') || f.endsWith('.text') || f.endsWith('.transcript')
        );

        const classified = files.map(f => {
            const content = fs.readFileSync(path.join(TRANSCRIPTS_DIR, f), 'utf-8');
            return { filename: f, content, type: classifyTranscript(f, content) };
        });

        const demoFiles = classified.filter(c => c.type === 'demo').sort((a, b) => a.filename.localeCompare(b.filename));
        console.log(`[Batch Demos] Found ${demoFiles.length} demo transcripts`);

        const results = { demos: [], errors: [] };

        for (const { filename: file, content: transcript } of demoFiles) {
            try {
                console.log(`\n[Batch Demos] Processing: ${file}`);
                const memo = await extractFromDemo(transcript);
                const accountId = memo.account_id || `ACC-${Date.now()}`;
                memo.account_id = accountId;
                const spec = generateAgentSpec(memo, 1);
                storage.saveV1(accountId, memo, spec);
                taskTracker.createTask(accountId, memo.company_name, 'demo');

                results.demos.push({ file, account_id: accountId, company: memo.company_name, status: 'success' });
                console.log(`  ✓ ${accountId}: ${memo.company_name}`);
            } catch (err) {
                results.errors.push({ file, error: err.message, pipeline: 'demo' });
                console.error(`  ✗ ${file}: ${err.message}`);
            }
        }

        console.log(`\n[Batch Demos] Complete: ${results.demos.length} demos, ${results.errors.length} errors`);
        res.json({
            success: true,
            summary: { total_demos: results.demos.length, total_errors: results.errors.length },
            results
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Batch: Onboardings only (Pipeline B)
app.post('/api/batch/onboardings', async (req, res) => {
    try {
        if (!fs.existsSync(TRANSCRIPTS_DIR)) {
            return res.status(404).json({ success: false, error: 'No transcripts directory found.' });
        }

        const files = fs.readdirSync(TRANSCRIPTS_DIR).filter(f =>
            f.endsWith('.txt') || f.endsWith('.md') || f.endsWith('.text') || f.endsWith('.transcript')
        );

        const classified = files.map(f => {
            const content = fs.readFileSync(path.join(TRANSCRIPTS_DIR, f), 'utf-8');
            return { filename: f, content, type: classifyTranscript(f, content) };
        });

        const onboardingFiles = classified.filter(c => c.type === 'onboarding').sort((a, b) => a.filename.localeCompare(b.filename));
        console.log(`[Batch Onboardings] Found ${onboardingFiles.length} onboarding transcripts`);

        // Load existing demo accounts for matching
        const existingAccounts = storage.listAccounts().filter(a => a.has_v1);

        const results = { onboardings: [], errors: [] };

        for (let i = 0; i < onboardingFiles.length; i++) {
            const { filename: file, content: transcript } = onboardingFiles[i];
            try {
                // Multi-strategy account matching
                let accountId = null;

                // Strategy 1: Account ID in transcript
                const metaMatch = transcript.match(/Account\s*(?:ID)?[:\s]*(ACC[-_]\w+)/i);
                if (metaMatch) accountId = metaMatch[1];

                // Strategy 2: Company name matching
                if (!accountId) {
                    accountId = findMatchingAccount(transcript, existingAccounts.map(a => ({
                        account_id: a.account_id,
                        company: a.company_name
                    })));
                }

                // Strategy 3: Positional fallback
                if (!accountId && existingAccounts[i]) {
                    accountId = existingAccounts[i].account_id;
                }

                if (!accountId) {
                    results.errors.push({ file, error: 'Could not match to any demo account. Run demos first.', pipeline: 'onboarding' });
                    continue;
                }

                console.log(`\n[Batch Onboardings] Processing: ${file} → ${accountId}`);

                const v1 = storage.loadV1(accountId);
                if (!v1) {
                    results.errors.push({ file, error: `No v1 for ${accountId}. Run demos first.`, pipeline: 'onboarding' });
                    continue;
                }

                const updatedMemo = await extractFromOnboarding(transcript, v1.memo);
                updatedMemo.account_id = accountId;
                const updatedSpec = generateAgentSpec(updatedMemo, 2);
                const changelog = generateChangelog(v1.memo, updatedMemo, v1.spec, updatedSpec);
                storage.saveV2(accountId, updatedMemo, updatedSpec, changelog);
                taskTracker.updateTask(accountId, 'v2_complete', 'Onboarding batch processed');

                results.onboardings.push({
                    file, account_id: accountId,
                    company: updatedMemo.company_name,
                    changes_count: changelog.memo_changes.length,
                    status: 'success'
                });
                console.log(`  ✓ ${accountId}: ${changelog.memo_changes.length} changes applied`);
            } catch (err) {
                results.errors.push({ file, error: err.message, pipeline: 'onboarding' });
                console.error(`  ✗ ${file}: ${err.message}`);
            }
        }

        console.log(`\n[Batch Onboardings] Complete: ${results.onboardings.length} onboardings, ${results.errors.length} errors`);
        res.json({
            success: true,
            summary: { total_onboardings: results.onboardings.length, total_errors: results.errors.length },
            results
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Upload transcripts
app.post('/api/transcripts/upload', upload.array('files', 20), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, error: 'No files uploaded. Supported formats: .txt, .md, .text' });
        }
        const uploaded = req.files.map(f => ({
            filename: f.originalname,
            size: f.size,
            type: classifyTranscript(f.originalname, fs.readFileSync(f.path, 'utf-8'))
        }));
        console.log(`[Upload] ${uploaded.length} file(s) uploaded: ${uploaded.map(u => u.filename).join(', ')}`);
        res.json({ success: true, uploaded });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Delete a transcript
app.delete('/api/transcripts/:filename', (req, res) => {
    try {
        const filePath = path.join(TRANSCRIPTS_DIR, req.params.filename);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, error: 'File not found' });
        }
        fs.unlinkSync(filePath);
        res.json({ success: true, message: `Deleted ${req.params.filename}` });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// List available transcripts
app.get('/api/transcripts', (req, res) => {
    try {
        if (!fs.existsSync(TRANSCRIPTS_DIR)) {
            return res.json({ success: true, transcripts: [] });
        }
        const files = fs.readdirSync(TRANSCRIPTS_DIR).filter(f =>
            f.endsWith('.txt') || f.endsWith('.md') || f.endsWith('.text') || f.endsWith('.transcript')
        );
        const transcripts = files.map(f => {
            const content = fs.readFileSync(path.join(TRANSCRIPTS_DIR, f), 'utf-8');
            return {
                filename: f,
                type: classifyTranscript(f, content),
                size: fs.statSync(path.join(TRANSCRIPTS_DIR, f)).size
            };
        });
        res.json({ success: true, transcripts });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get tasks
app.get('/api/tasks', (req, res) => {
    try {
        const tasks = taskTracker.listTasks();
        res.json({ success: true, tasks });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Serve dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`\n╔══════════════════════════════════════════════════╗`);
    console.log(`║  Clara Answers Pipeline Server                   ║`);
    console.log(`║  Dashboard:  http://localhost:${PORT}               ║`);
    console.log(`║  API Base:   http://localhost:${PORT}/api            ║`);
    console.log(`║  Groq Model: ${(process.env.GROQ_MODEL || 'llama-3.3-70b-versatile').padEnd(35)}║`);
    console.log(`╚══════════════════════════════════════════════════╝\n`);
});

module.exports = app;
