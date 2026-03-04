// Task Tracker - Local JSON-based task tracking (zero-cost Asana alternative)
const fs = require('fs');
const path = require('path');

const TASKS_FILE = path.join(__dirname, '..', 'outputs', 'tasks.json');

function ensureTasksFile() {
    const dir = path.dirname(TASKS_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(TASKS_FILE)) {
        fs.writeFileSync(TASKS_FILE, JSON.stringify({ tasks: [] }, null, 2));
    }
}

function loadTasks() {
    ensureTasksFile();
    return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf-8'));
}

function saveTasks(data) {
    ensureTasksFile();
    fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2));
}

function createTask(accountId, companyName, type = 'demo') {
    const data = loadTasks();

    // Check if task already exists for this account
    const existing = data.tasks.find(t => t.account_id === accountId);
    if (existing) {
        existing.updated_at = new Date().toISOString();
        if (type === 'demo') {
            existing.status = 'v1_complete';
            existing.history.push({ action: 'v1_created', timestamp: new Date().toISOString() });
        }
        saveTasks(data);
        return existing;
    }

    const task = {
        id: `TASK-${String(data.tasks.length + 1).padStart(3, '0')}`,
        account_id: accountId,
        company_name: companyName,
        status: type === 'demo' ? 'v1_complete' : 'pending_demo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        assignee: 'automation',
        priority: 'medium',
        history: [
            { action: `${type}_processed`, timestamp: new Date().toISOString() }
        ]
    };

    data.tasks.push(task);
    saveTasks(data);
    return task;
}

function updateTask(accountId, status, notes = '') {
    const data = loadTasks();
    const task = data.tasks.find(t => t.account_id === accountId);

    if (!task) {
        return createTask(accountId, accountId, 'demo');
    }

    task.status = status;
    task.updated_at = new Date().toISOString();
    task.history.push({
        action: status,
        notes,
        timestamp: new Date().toISOString()
    });

    saveTasks(data);
    return task;
}

function listTasks() {
    const data = loadTasks();
    return data.tasks;
}

function getTask(accountId) {
    const data = loadTasks();
    return data.tasks.find(t => t.account_id === accountId) || null;
}

module.exports = { createTask, updateTask, listTasks, getTask };
