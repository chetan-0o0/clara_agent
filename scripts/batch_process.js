// Batch process all transcripts - CLI runner
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { extractFromDemo, extractFromOnboarding } = require('../src/extractor');
const { generateAgentSpec } = require('../src/promptGenerator');
const { generateChangelog } = require('../src/versioning');
const storage = require('../src/storage');
const taskTracker = require('../src/taskTracker');

const TRANSCRIPTS_DIR = path.join(__dirname, '..', 'data', 'transcripts');

// Classify a transcript file as 'demo' or 'onboarding'
function classifyTranscript(filename, content) {
    const fLower = filename.toLowerCase();
    if (fLower.includes('demo')) return 'demo';
    if (fLower.includes('onboarding') || fLower.includes('onboard')) return 'onboarding';

    const cLower = content.toLowerCase();
    const demoSignals = ['demo call', 'demo transcript', 'sales rep', 'tell me about your business', 'learn about your business', 'what services do you'];
    const onboardSignals = ['onboarding call', 'onboarding transcript', 'onboarding session', 'confirm and fill in', 'welcome to onboarding', 'from your demo', 'updates from the demo'];
    const demoScore = demoSignals.filter(s => cLower.includes(s)).length;
    const onboardScore = onboardSignals.filter(s => cLower.includes(s)).length;
    if (onboardScore > demoScore) return 'onboarding';
    if (demoScore > 0) return 'demo';

    const num = fLower.match(/(\d+)/);
    if (num && parseInt(num[1]) > 5) return 'onboarding';
    return 'demo';
}

// Find matching demo account for onboarding
function findMatchingAccount(transcript, demoResults) {
    const idMatch = transcript.match(/Account\s*(?:ID)?[:\s]*(ACC[-_]\w+)/i);
    if (idMatch) return idMatch[1];

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

async function batchProcess() {
    console.log('╔═══════════════════════════════════════════╗');
    console.log('║  Clara Answers - Batch Pipeline Runner    ║');
    console.log('╚═══════════════════════════════════════════╝\n');

    if (!fs.existsSync(TRANSCRIPTS_DIR)) {
        console.error('No transcripts found. Place transcript files in data/transcripts/');
        console.error('Supported formats: .txt, .md, .text');
        process.exit(1);
    }

    const files = fs.readdirSync(TRANSCRIPTS_DIR).filter(f =>
        f.endsWith('.txt') || f.endsWith('.md') || f.endsWith('.text') || f.endsWith('.transcript')
    );

    if (files.length === 0) {
        console.error('No transcript files found in data/transcripts/');
        process.exit(1);
    }

    // Classify all files
    const classified = files.map(f => {
        const content = fs.readFileSync(path.join(TRANSCRIPTS_DIR, f), 'utf-8');
        return { filename: f, content, type: classifyTranscript(f, content) };
    });

    const demoFiles = classified.filter(c => c.type === 'demo').sort((a, b) => a.filename.localeCompare(b.filename));
    const onboardingFiles = classified.filter(c => c.type === 'onboarding').sort((a, b) => a.filename.localeCompare(b.filename));

    console.log(`Found ${files.length} files: ${demoFiles.length} demo + ${onboardingFiles.length} onboarding transcripts\n`);

    const results = { demos: [], onboardings: [], errors: [] };

    // Phase 1: Process demo transcripts (Pipeline A)
    console.log('═══ PHASE 1: Demo Calls → v1 Agent Specs ═══\n');

    for (let i = 0; i < demoFiles.length; i++) {
        const { filename: file, content: transcript } = demoFiles[i];

        try {
            console.log(`[${i + 1}/${demoFiles.length}] Processing: ${file}`);

            // Extract memo
            console.log('  → Extracting account memo...');
            const memo = await extractFromDemo(transcript);
            const accountId = memo.account_id || `ACC-${String(i + 1).padStart(3, '0')}`;
            memo.account_id = accountId;

            // Generate agent spec
            console.log('  → Generating agent spec v1...');
            const spec = generateAgentSpec(memo, 1);

            // Save
            storage.saveV1(accountId, memo, spec);
            taskTracker.createTask(accountId, memo.company_name, 'demo');

            results.demos.push({
                file, account_id: accountId,
                company: memo.company_name, status: 'success'
            });
            console.log(`  ✓ ${accountId}: ${memo.company_name}\n`);
        } catch (err) {
            results.errors.push({ file, error: err.message, pipeline: 'demo' });
            console.error(`  ✗ Error: ${err.message}\n`);
        }
    }

    // Phase 2: Process onboarding transcripts (Pipeline B)
    console.log('\n═══ PHASE 2: Onboarding Calls → v2 Updates ═══\n');

    for (let i = 0; i < onboardingFiles.length; i++) {
        const { filename: file, content: transcript } = onboardingFiles[i];

        try {
            console.log(`[${i + 1}/${onboardingFiles.length}] Processing: ${file}`);

            // Multi-strategy account matching
            let accountId = null;

            // Strategy 1: Account ID in transcript
            const metaMatch = transcript.match(/Account\s*(?:ID)?[:\s]*(ACC[-_]\w+)/i);
            if (metaMatch) accountId = metaMatch[1];

            // Strategy 2: Company name matching
            if (!accountId) accountId = findMatchingAccount(transcript, results.demos);

            // Strategy 3: File number matching
            if (!accountId) {
                const fileNum = file.match(/(\d+)/)?.[1];
                if (fileNum && results.demos[parseInt(fileNum) - 1]) {
                    accountId = results.demos[parseInt(fileNum) - 1].account_id;
                }
            }

            // Strategy 4: Positional fallback
            if (!accountId && results.demos[i]) {
                accountId = results.demos[i].account_id;
            }

            if (!accountId) {
                throw new Error('Could not determine matching demo account');
            }

            // Load v1
            const v1 = storage.loadV1(accountId);
            if (!v1) {
                throw new Error(`No v1 data found for ${accountId}`);
            }

            // Extract updates
            console.log(`  → Extracting onboarding updates for ${accountId}...`);
            const updatedMemo = await extractFromOnboarding(transcript, v1.memo);
            updatedMemo.account_id = accountId;

            // Generate updated spec
            console.log('  → Generating agent spec v2...');
            const updatedSpec = generateAgentSpec(updatedMemo, 2);

            // Generate changelog
            console.log('  → Generating changelog...');
            const changelog = generateChangelog(v1.memo, updatedMemo, v1.spec, updatedSpec);

            // Save
            storage.saveV2(accountId, updatedMemo, updatedSpec, changelog);
            taskTracker.updateTask(accountId, 'v2_complete', 'Onboarding processed');

            results.onboardings.push({
                file, account_id: accountId,
                company: updatedMemo.company_name,
                changes: changelog.memo_changes.length,
                status: 'success'
            });
            console.log(`  ✓ ${accountId}: ${changelog.memo_changes.length} changes applied\n`);
        } catch (err) {
            results.errors.push({ file, error: err.message, pipeline: 'onboarding' });
            console.error(`  ✗ Error: ${err.message}\n`);
        }
    }

    // Summary
    console.log('\n═══════════════════════════════════════════');
    console.log('           BATCH PROCESSING SUMMARY');
    console.log('═══════════════════════════════════════════');
    console.log(`  Demo calls processed:       ${results.demos.length}/${demoFiles.length}`);
    console.log(`  Onboarding calls processed: ${results.onboardings.length}/${onboardingFiles.length}`);
    console.log(`  Errors:                     ${results.errors.length}`);
    console.log('═══════════════════════════════════════════\n');

    if (results.demos.length > 0) {
        console.log('Accounts created:');
        for (const d of results.demos) {
            console.log(`  • ${d.account_id}: ${d.company}`);
        }
    }

    if (results.errors.length > 0) {
        console.log('\nErrors:');
        for (const e of results.errors) {
            console.log(`  ✗ ${e.file} (${e.pipeline}): ${e.error}`);
        }
    }

    // Save summary
    const summaryPath = path.join(__dirname, '..', 'outputs', 'batch_summary.json');
    storage.ensureDir(path.dirname(summaryPath));
    fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2));
    console.log(`\nSummary saved to: ${summaryPath}`);
}

batchProcess().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
