// Versioning - Diff and changelog generation between v1 and v2

function generateChangelog(v1Memo, v2Memo, v1Spec, v2Spec) {
    const memoChanges = diffObjects(v1Memo, v2Memo, '');
    const specChanges = diffSpecs(v1Spec, v2Spec);

    return {
        account_id: v2Memo.account_id || v1Memo.account_id,
        company_name: v2Memo.company_name || v1Memo.company_name,
        generated_at: new Date().toISOString(),
        from_version: 'v1',
        to_version: 'v2',
        summary: `${memoChanges.length} memo field(s) changed, ${specChanges.length} spec field(s) updated`,
        memo_changes: memoChanges,
        spec_changes: specChanges
    };
}

function diffObjects(oldObj, newObj, prefix) {
    const changes = [];

    const allKeys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);

    for (const key of allKeys) {
        // Skip metadata fields
        if (['account_id', 'version'].includes(key)) continue;

        const fullKey = prefix ? `${prefix}.${key}` : key;
        const oldVal = oldObj?.[key];
        const newVal = newObj?.[key];

        if (oldVal === undefined && newVal !== undefined) {
            changes.push({
                field: fullKey,
                type: 'added',
                old_value: null,
                new_value: newVal,
                reason: 'Added during onboarding'
            });
        } else if (oldVal !== undefined && newVal === undefined) {
            changes.push({
                field: fullKey,
                type: 'removed',
                old_value: oldVal,
                new_value: null,
                reason: 'Removed during onboarding'
            });
        } else if (typeof oldVal === 'object' && typeof newVal === 'object' &&
            !Array.isArray(oldVal) && !Array.isArray(newVal) &&
            oldVal !== null && newVal !== null) {
            // Recurse into nested objects
            const nested = diffObjects(oldVal, newVal, fullKey);
            changes.push(...nested);
        } else if (Array.isArray(oldVal) && Array.isArray(newVal)) {
            const oldStr = JSON.stringify(oldVal.sort());
            const newStr = JSON.stringify(newVal.sort());
            if (oldStr !== newStr) {
                const added = newVal.filter(v => !oldVal.includes(v));
                const removed = oldVal.filter(v => !newVal.includes(v));
                changes.push({
                    field: fullKey,
                    type: 'modified',
                    old_value: oldVal,
                    new_value: newVal,
                    added_items: added,
                    removed_items: removed,
                    reason: `Updated list: +${added.length} added, -${removed.length} removed`
                });
            }
        } else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
            changes.push({
                field: fullKey,
                type: 'modified',
                old_value: oldVal,
                new_value: newVal,
                reason: 'Updated during onboarding'
            });
        }
    }

    return changes;
}

function diffSpecs(v1Spec, v2Spec) {
    const changes = [];

    // Compare key sections
    if (v1Spec.system_prompt !== v2Spec.system_prompt) {
        changes.push({
            field: 'system_prompt',
            type: 'modified',
            details: 'System prompt regenerated with updated account information'
        });
    }

    if (v1Spec.first_utterance !== v2Spec.first_utterance) {
        changes.push({
            field: 'first_utterance',
            type: 'modified',
            details: 'Greeting updated'
        });
    }

    // Compare key variables
    const v1Vars = v1Spec.key_variables || {};
    const v2Vars = v2Spec.key_variables || {};
    for (const key of Object.keys(v2Vars)) {
        if (JSON.stringify(v1Vars[key]) !== JSON.stringify(v2Vars[key])) {
            changes.push({
                field: `key_variables.${key}`,
                type: 'modified',
                details: `Changed from "${summarizeValue(v1Vars[key])}" to "${summarizeValue(v2Vars[key])}"`
            });
        }
    }

    // Compare transfer protocol
    const v1Transfer = v1Spec.call_transfer_protocol || {};
    const v2Transfer = v2Spec.call_transfer_protocol || {};
    if (JSON.stringify(v1Transfer.contacts) !== JSON.stringify(v2Transfer.contacts)) {
        changes.push({
            field: 'call_transfer_protocol.contacts',
            type: 'modified',
            details: 'Emergency contacts updated'
        });
    }

    if (v1Transfer.timeout_seconds !== v2Transfer.timeout_seconds) {
        changes.push({
            field: 'call_transfer_protocol.timeout_seconds',
            type: 'modified',
            details: `Changed from ${v1Transfer.timeout_seconds}s to ${v2Transfer.timeout_seconds}s`
        });
    }

    // Compare fallback
    if (JSON.stringify(v1Spec.fallback_protocol) !== JSON.stringify(v2Spec.fallback_protocol)) {
        changes.push({
            field: 'fallback_protocol',
            type: 'modified',
            details: 'Fallback protocol updated with new information'
        });
    }

    // Version change is always present
    changes.push({
        field: 'version',
        type: 'modified',
        details: 'v1 → v2'
    });

    return changes;
}

function summarizeValue(val) {
    if (val === null || val === undefined) return 'null';
    if (Array.isArray(val)) return `[${val.length} items]`;
    if (typeof val === 'object') return JSON.stringify(val).substring(0, 60);
    return String(val).substring(0, 80);
}

module.exports = { generateChangelog, diffObjects };
