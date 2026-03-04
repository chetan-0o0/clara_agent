// Clara Answers Pipeline — Dashboard Client JS

const API_BASE = '';

// ===== State =====
let accounts = [];
let tasks = [];

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
    refreshAccounts();
    loadTasks();
    loadTranscripts();
    setupDragDrop();
});

// ===== Tab Navigation =====
function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));

    document.querySelector(`.tab[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');

    if (tabName === 'tasks') loadTasks();
    if (tabName === 'diff') populateDiffSelect();
}

// ===== Data Loading =====
async function refreshAccounts() {
    try {
        const res = await fetch(`${API_BASE}/api/accounts`);
        const data = await res.json();
        if (data.success) {
            accounts = data.accounts;
            renderAccountCards();
            updateStats();
            populateAccountSelect();
            populateDiffSelect();
        }
    } catch (err) {
        showToast('Failed to load accounts: ' + err.message, 'error');
    }
}

async function loadTranscripts() {
    try {
        const res = await fetch(`${API_BASE}/api/transcripts`);
        const data = await res.json();
        if (data.success) {
            document.getElementById('transcriptCount').textContent = data.transcripts.length;
            document.getElementById('uploadedCount').textContent = `${data.transcripts.length} files`;
            renderUploadedFiles(data.transcripts);
        }
    } catch (err) { /* ignore */ }
}

async function loadTasks() {
    try {
        const res = await fetch(`${API_BASE}/api/tasks`);
        const data = await res.json();
        if (data.success) {
            tasks = data.tasks;
            renderKanban();
        }
    } catch (err) {
        showToast('Failed to load tasks', 'error');
    }
}

// ===== Stats =====
function updateStats() {
    document.getElementById('totalAccounts').textContent = accounts.length;
    document.getElementById('v1Count').textContent = accounts.filter(a => a.has_v1).length;
    document.getElementById('v2Count').textContent = accounts.filter(a => a.has_v2).length;
}

// ===== Account Cards =====
function renderAccountCards() {
    const grid = document.getElementById('accountsGrid');

    if (accounts.length === 0) {
        grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1">
        <span class="empty-icon">📭</span>
        <p>No accounts processed yet. Run the batch pipeline to get started.</p>
      </div>`;
        return;
    }

    grid.innerHTML = accounts.map(acc => `
    <div class="account-card" onclick="viewAccount('${acc.account_id}')">
      <div class="account-card-header">
        <div>
          <div class="account-card-title">${escapeHtml(acc.company_name)}</div>
          <div class="account-card-id">${acc.account_id}</div>
        </div>
      </div>
      <div class="account-card-badges">
        ${acc.has_v1 ? '<span class="badge badge-blue">V1</span>' : ''}
        ${acc.has_v2 ? '<span class="badge badge-green">V2</span>' : ''}
        ${acc.has_changelog ? '<span class="badge badge-purple">Changelog</span>' : ''}
      </div>
    </div>
  `).join('');
}

function viewAccount(id) {
    switchTab('accounts');
    document.getElementById('accountSelect').value = id;
    loadAccountDetail(id);
}

// ===== Account Detail =====
function populateAccountSelect() {
    const select = document.getElementById('accountSelect');
    const current = select.value;
    select.innerHTML = '<option value="">Select an account...</option>' +
        accounts.map(a => `<option value="${a.account_id}">${a.company_name} (${a.account_id})</option>`).join('');
    if (current) select.value = current;
}

async function loadAccountDetail(accountId) {
    if (!accountId) return;

    const container = document.getElementById('accountDetail');
    container.innerHTML = '<div class="empty-state"><span class="empty-icon">⏳</span><p>Loading...</p></div>';

    try {
        const res = await fetch(`${API_BASE}/api/accounts/${accountId}`);
        const data = await res.json();

        if (!data.success) {
            container.innerHTML = `<div class="empty-state"><span class="empty-icon">❌</span><p>${data.error}</p></div>`;
            return;
        }

        let currentDetailTab = 'v1-memo';

        const renderDetail = () => {
            let content = '';

            switch (currentDetailTab) {
                case 'v1-memo':
                    content = data.v1 ? renderJson(data.v1.memo) : '<p style="color:var(--text-muted)">No V1 memo available</p>';
                    break;
                case 'v1-spec':
                    content = data.v1 ? renderJson(data.v1.spec) : '<p style="color:var(--text-muted)">No V1 spec available</p>';
                    break;
                case 'v2-memo':
                    content = data.v2 ? renderJson(data.v2.memo) : '<p style="color:var(--text-muted)">No V2 memo available</p>';
                    break;
                case 'v2-spec':
                    content = data.v2 ? renderJson(data.v2.spec) : '<p style="color:var(--text-muted)">No V2 spec available</p>';
                    break;
                case 'changelog':
                    content = data.changelog ? renderChangelog(data.changelog) : '<p style="color:var(--text-muted)">No changelog available</p>';
                    break;
            }

            container.innerHTML = `
        <div class="detail-tabs">
          <button class="detail-tab ${currentDetailTab === 'v1-memo' ? 'active' : ''}" onclick="window._setDetailTab('v1-memo')">V1 Memo</button>
          <button class="detail-tab ${currentDetailTab === 'v1-spec' ? 'active' : ''}" onclick="window._setDetailTab('v1-spec')">V1 Agent Spec</button>
          <button class="detail-tab ${currentDetailTab === 'v2-memo' ? 'active' : ''}" onclick="window._setDetailTab('v2-memo')">V2 Memo</button>
          <button class="detail-tab ${currentDetailTab === 'v2-spec' ? 'active' : ''}" onclick="window._setDetailTab('v2-spec')">V2 Agent Spec</button>
          <button class="detail-tab ${currentDetailTab === 'changelog' ? 'active' : ''}" onclick="window._setDetailTab('changelog')">Changelog</button>
        </div>
        <div>${content}</div>
      `;
        };

        window._setDetailTab = (tab) => {
            currentDetailTab = tab;
            renderDetail();
        };

        renderDetail();
    } catch (err) {
        container.innerHTML = `<div class="empty-state"><span class="empty-icon">❌</span><p>${err.message}</p></div>`;
    }
}

function renderJson(obj) {
    const json = JSON.stringify(obj, null, 2);
    const highlighted = json
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
        .replace(/: "([^"]*)"/g, ': <span class="json-string">"$1"</span>')
        .replace(/: (\d+\.?\d*)/g, ': <span class="json-number">$1</span>')
        .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>')
        .replace(/: (null)/g, ': <span class="json-null">$1</span>');

    return `<div class="json-view"><pre>${highlighted}</pre></div>`;
}

function renderChangelog(changelog) {
    if (!changelog.memo_changes || changelog.memo_changes.length === 0) {
        return '<p style="color:var(--text-muted)">No changes detected</p>';
    }

    let html = `
    <div class="diff-summary">
      <div class="diff-summary-title">📝 ${changelog.summary}</div>
      <div class="diff-summary-text">
        Account: ${changelog.company_name} (${changelog.account_id}) · 
        Generated: ${new Date(changelog.generated_at).toLocaleString()}
      </div>
    </div>
    <table class="diff-table">
      <thead>
        <tr>
          <th>Field</th>
          <th>Type</th>
          <th>Old Value</th>
          <th>New Value</th>
          <th>Reason</th>
        </tr>
      </thead>
      <tbody>
  `;

    for (const change of changelog.memo_changes) {
        const oldVal = formatValue(change.old_value);
        const newVal = formatValue(change.new_value);
        html += `
      <tr>
        <td><span class="diff-field">${change.field}</span></td>
        <td><span class="diff-type ${change.type}">${change.type}</span></td>
        <td><span class="diff-old">${oldVal}</span></td>
        <td><span class="diff-new">${newVal}</span></td>
        <td style="color:var(--text-muted);font-size:11px">${change.reason || ''}</td>
      </tr>
    `;
    }

    html += '</tbody></table>';
    return html;
}

function formatValue(val) {
    if (val === null || val === undefined) return '—';
    if (Array.isArray(val)) return escapeHtml(val.join(', '));
    if (typeof val === 'object') return escapeHtml(JSON.stringify(val));
    return escapeHtml(String(val));
}

// ===== Kanban Board =====
function renderKanban() {
    const columns = {
        'pending_demo': [],
        'v1_complete': [],
        'pending_onboarding': [],
        'v2_complete': []
    };

    for (const task of tasks) {
        const status = task.status || 'pending_demo';
        if (columns[status]) {
            columns[status].push(task);
        } else {
            columns['pending_demo'].push(task);
        }
    }

    for (const [status, items] of Object.entries(columns)) {
        const container = document.getElementById(`kanban-${status}`);
        if (!container) continue;

        if (items.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:12px">No items</div>';
        } else {
            container.innerHTML = items.map(task => `
        <div class="kanban-card" onclick="viewAccount('${task.account_id}')">
          <div class="kanban-card-title">${escapeHtml(task.company_name)}</div>
          <div class="kanban-card-id">${task.id} · ${task.account_id}</div>
          <div class="kanban-card-time">${new Date(task.updated_at).toLocaleString()}</div>
        </div>
      `).join('');
        }
    }
}

// ===== Diff Viewer =====
function populateDiffSelect() {
    const select = document.getElementById('diffAccountSelect');
    if (!select) return;
    const v2Accounts = accounts.filter(a => a.has_v2);
    select.innerHTML = '<option value="">Select an account...</option>' +
        v2Accounts.map(a => `<option value="${a.account_id}">${a.company_name} (${a.account_id})</option>`).join('');
}

async function loadDiff(accountId) {
    if (!accountId) return;

    const viewer = document.getElementById('diffViewer');
    viewer.innerHTML = '<div class="empty-state"><span class="empty-icon">⏳</span><p>Loading diff...</p></div>';

    try {
        const res = await fetch(`${API_BASE}/api/accounts/${accountId}/diff`);
        const data = await res.json();

        if (!data.success) {
            viewer.innerHTML = `<div class="empty-state"><span class="empty-icon">❌</span><p>${data.error}</p></div>`;
            return;
        }

        viewer.innerHTML = renderChangelog(data.changelog);
    } catch (err) {
        viewer.innerHTML = `<div class="empty-state"><span class="empty-icon">❌</span><p>${err.message}</p></div>`;
    }
}

// ===== Pipeline Controls =====
async function runDemos() {
    const btn = document.getElementById('demosBtn');
    const progress = document.getElementById('batchProgress');

    btn.disabled = true;
    btn.innerHTML = '<span class="btn-icon">⏳</span> Running...';
    progress.style.display = 'block';

    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const batchStatus = document.getElementById('batchStatus');

    progressFill.style.width = '20%';
    progressText.textContent = 'Running Pipeline A: Demo transcripts → v1 Agent Specs...';

    try {
        const res = await fetch(`${API_BASE}/api/batch/demos`, { method: 'POST' });
        const data = await res.json();

        if (data.success) {
            progressFill.style.width = '100%';
            batchStatus.textContent = 'Demos Complete';
            batchStatus.className = 'badge badge-green';
            progressText.textContent = `Processed ${data.summary.total_demos} demo(s) (${data.summary.total_errors} errors)`;
            showToast(`Pipeline A complete! ${data.summary.total_demos} demos processed`, 'success');
            await refreshAccounts();
            await loadTasks();
            loadTranscripts();
        } else {
            batchStatus.textContent = 'Error';
            batchStatus.className = 'badge badge-red';
            progressText.textContent = data.error;
            showToast('Demos failed: ' + data.error, 'error');
        }
    } catch (err) {
        batchStatus.textContent = 'Error';
        batchStatus.className = 'badge badge-red';
        progressText.textContent = err.message;
        showToast('Demos failed: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<span class="btn-icon">📄</span> Run Demos';
    }
}

async function runOnboardings() {
    const btn = document.getElementById('onboardingsBtn');
    const progress = document.getElementById('batchProgress');

    btn.disabled = true;
    btn.innerHTML = '<span class="btn-icon">⏳</span> Running...';
    progress.style.display = 'block';

    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const batchStatus = document.getElementById('batchStatus');

    progressFill.style.width = '20%';
    progressText.textContent = 'Running Pipeline B: Onboarding transcripts → v2 Updates...';

    try {
        const res = await fetch(`${API_BASE}/api/batch/onboardings`, { method: 'POST' });
        const data = await res.json();

        if (data.success) {
            progressFill.style.width = '100%';
            batchStatus.textContent = 'Onboardings Complete';
            batchStatus.className = 'badge badge-green';
            progressText.textContent = `Processed ${data.summary.total_onboardings} onboarding(s) (${data.summary.total_errors} errors)`;
            showToast(`Pipeline B complete! ${data.summary.total_onboardings} onboardings processed`, 'success');
            await refreshAccounts();
            await loadTasks();
            loadTranscripts();
        } else {
            batchStatus.textContent = 'Error';
            batchStatus.className = 'badge badge-red';
            progressText.textContent = data.error;
            showToast('Onboardings failed: ' + data.error, 'error');
        }
    } catch (err) {
        batchStatus.textContent = 'Error';
        batchStatus.className = 'badge badge-red';
        progressText.textContent = err.message;
        showToast('Onboardings failed: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<span class="btn-icon">🔄</span> Run Onboardings';
    }
}

// ===== Batch Processing =====
async function runBatch() {
    const btn = document.getElementById('batchBtn');
    const progress = document.getElementById('batchProgress');

    btn.disabled = true;
    btn.innerHTML = '<span class="btn-icon">⏳</span> Running...';
    progress.style.display = 'block';

    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const batchStatus = document.getElementById('batchStatus');

    progressFill.style.width = '10%';
    progressText.textContent = 'Starting full batch pipeline (demos + onboardings)...';

    try {
        const res = await fetch(`${API_BASE}/api/batch/run`, { method: 'POST' });
        const data = await res.json();

        if (data.success) {
            progressFill.style.width = '100%';
            batchStatus.textContent = 'Complete';
            batchStatus.className = 'badge badge-green';
            progressText.textContent =
                `Processed ${data.summary.total_demos} demos + ${data.summary.total_onboardings} onboardings (${data.summary.total_errors} errors)`;
            showToast(`Batch complete! ${data.summary.total_demos} demos, ${data.summary.total_onboardings} onboardings`, 'success');

            // Refresh data
            await refreshAccounts();
            await loadTasks();
            loadTranscripts();
        } else {
            batchStatus.textContent = 'Error';
            batchStatus.className = 'badge badge-red';
            progressText.textContent = data.error;
            showToast('Batch failed: ' + data.error, 'error');
        }
    } catch (err) {
        batchStatus.textContent = 'Error';
        batchStatus.className = 'badge badge-red';
        progressText.textContent = err.message;
        showToast('Batch failed: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<span class="btn-icon">▶</span> Run Full Batch';
    }
}

// ===== File Upload =====
function setupDragDrop() {
    const zone = document.getElementById('uploadZone');
    if (!zone) return;

    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('drag-over');
    });
    zone.addEventListener('dragleave', () => {
        zone.classList.remove('drag-over');
    });
    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files);
        }
    });
}

async function handleFileUpload(files) {
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (const file of files) {
        formData.append('files', file);
    }

    showToast(`Uploading ${files.length} file(s)...`, 'info');

    try {
        const res = await fetch(`${API_BASE}/api/transcripts/upload`, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (data.success) {
            showToast(`Uploaded ${data.uploaded.length} file(s) successfully!`, 'success');
            loadTranscripts();
        } else {
            showToast('Upload failed: ' + data.error, 'error');
        }
    } catch (err) {
        showToast('Upload error: ' + err.message, 'error');
    }

    // Reset file input
    document.getElementById('fileInput').value = '';
}

function renderUploadedFiles(transcripts) {
    const container = document.getElementById('uploadedFiles');
    if (!container) return;

    if (transcripts.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = transcripts.map(t => `
        <div class="uploaded-file">
            <div class="uploaded-file-info">
                <span class="uploaded-file-name">${escapeHtml(t.filename)}</span>
                <span class="uploaded-file-type ${t.type}">${t.type}</span>
                <span style="color:var(--text-muted);font-size:11px">${formatFileSize(t.size)}</span>
            </div>
            <button class="uploaded-file-delete" onclick="deleteTranscript('${escapeHtml(t.filename)}')" title="Delete">✕</button>
        </div>
    `).join('');
}

async function deleteTranscript(filename) {
    if (!confirm(`Delete ${filename}?`)) return;
    try {
        const res = await fetch(`${API_BASE}/api/transcripts/${encodeURIComponent(filename)}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            showToast(`Deleted ${filename}`, 'success');
            loadTranscripts();
        } else {
            showToast('Delete failed: ' + data.error, 'error');
        }
    } catch (err) {
        showToast('Delete error: ' + err.message, 'error');
    }
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ===== Helpers =====
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 4000);
}
