// Storage module - File-based JSON storage for account data
const fs = require('fs');
const path = require('path');

const OUTPUTS_DIR = path.join(__dirname, '..', 'outputs', 'accounts');
const TASKS_FILE = path.join(__dirname, '..', 'outputs', 'tasks.json');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getAccountDir(accountId, version) {
  return path.join(OUTPUTS_DIR, accountId, version);
}

function saveV1(accountId, memo, spec) {
  const dir = getAccountDir(accountId, 'v1');
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, 'account_memo.json'), JSON.stringify(memo, null, 2));
  fs.writeFileSync(path.join(dir, 'agent_spec.json'), JSON.stringify(spec, null, 2));
  return { accountId, version: 'v1', path: dir };
}

function saveV2(accountId, memo, spec, changelog) {
  const dir = getAccountDir(accountId, 'v2');
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, 'account_memo.json'), JSON.stringify(memo, null, 2));
  fs.writeFileSync(path.join(dir, 'agent_spec.json'), JSON.stringify(spec, null, 2));

  // Save changelog at account level
  const accountDir = path.join(OUTPUTS_DIR, accountId);
  fs.writeFileSync(path.join(accountDir, 'changelog.json'), JSON.stringify(changelog, null, 2));

  // Also save human-readable changelog
  const changesMd = generateChangesMd(changelog);
  fs.writeFileSync(path.join(accountDir, 'changes.md'), changesMd);

  return { accountId, version: 'v2', path: dir };
}

function generateChangesMd(changelog) {
  let md = `# Changelog: v1 → v2\n\n`;
  md += `**Generated**: ${new Date().toISOString()}\n\n`;

  if (changelog.memo_changes && changelog.memo_changes.length > 0) {
    md += `## Account Memo Changes\n\n`;
    md += `| Field | Old Value | New Value | Reason |\n`;
    md += `|-------|-----------|-----------|--------|\n`;
    for (const change of changelog.memo_changes) {
      const oldVal = typeof change.old_value === 'object' ? JSON.stringify(change.old_value) : (change.old_value || '—');
      const newVal = typeof change.new_value === 'object' ? JSON.stringify(change.new_value) : (change.new_value || '—');
      md += `| ${change.field} | ${oldVal} | ${newVal} | ${change.reason || 'Updated during onboarding'} |\n`;
    }
    md += `\n`;
  }

  if (changelog.spec_changes && changelog.spec_changes.length > 0) {
    md += `## Agent Spec Changes\n\n`;
    md += `| Field | Change Type | Details |\n`;
    md += `|-------|-------------|--------|\n`;
    for (const change of changelog.spec_changes) {
      md += `| ${change.field} | ${change.type} | ${change.details || ''} |\n`;
    }
  }

  return md;
}

function loadV1(accountId) {
  const dir = getAccountDir(accountId, 'v1');
  if (!fs.existsSync(dir)) return null;

  const memo = JSON.parse(fs.readFileSync(path.join(dir, 'account_memo.json'), 'utf-8'));
  const spec = JSON.parse(fs.readFileSync(path.join(dir, 'agent_spec.json'), 'utf-8'));
  return { memo, spec };
}

function loadV2(accountId) {
  const dir = getAccountDir(accountId, 'v2');
  if (!fs.existsSync(dir)) return null;

  const memo = JSON.parse(fs.readFileSync(path.join(dir, 'account_memo.json'), 'utf-8'));
  const spec = JSON.parse(fs.readFileSync(path.join(dir, 'agent_spec.json'), 'utf-8'));
  return { memo, spec };
}

function loadChangelog(accountId) {
  const changelogPath = path.join(OUTPUTS_DIR, accountId, 'changelog.json');
  if (!fs.existsSync(changelogPath)) return null;
  return JSON.parse(fs.readFileSync(changelogPath, 'utf-8'));
}

function listAccounts() {
  ensureDir(OUTPUTS_DIR);
  const entries = fs.readdirSync(OUTPUTS_DIR, { withFileTypes: true });
  return entries
    .filter(e => e.isDirectory())
    .map(e => {
      const id = e.name;
      const hasV1 = fs.existsSync(getAccountDir(id, 'v1'));
      const hasV2 = fs.existsSync(getAccountDir(id, 'v2'));
      const hasChangelog = fs.existsSync(path.join(OUTPUTS_DIR, id, 'changelog.json'));

      let companyName = id;
      if (hasV1) {
        try {
          const memo = JSON.parse(fs.readFileSync(path.join(getAccountDir(id, 'v1'), 'account_memo.json'), 'utf-8'));
          companyName = memo.company_name || id;
        } catch (e) { /* ignore */ }
      }

      return {
        account_id: id,
        company_name: companyName,
        has_v1: hasV1,
        has_v2: hasV2,
        has_changelog: hasChangelog,
        status: hasV2 ? 'v2_complete' : hasV1 ? 'v1_complete' : 'pending'
      };
    });
}

function v1Exists(accountId) {
  return fs.existsSync(getAccountDir(accountId, 'v1'));
}

function v2Exists(accountId) {
  return fs.existsSync(getAccountDir(accountId, 'v2'));
}

module.exports = {
  saveV1, saveV2, loadV1, loadV2, loadChangelog,
  listAccounts, v1Exists, v2Exists, ensureDir, OUTPUTS_DIR
};
