# Changelog: v1 → v2

**Generated**: 2026-03-04T19:44:48.276Z

## Account Memo Changes

| Field | Old Value | New Value | Reason |
|-------|-----------|-----------|--------|
| emergency_routing_rules.who_to_call | [{"name":"James Washington","phone":null}] | [{"name":"James Washington","phone":"415-555-0456"}] | Updated list: +1 added, -1 removed |
| call_transfer_rules.timeout_seconds | null | 30 | Updated during onboarding |
| after_hours_flow_summary | Available for critical calls, 3-4 hours response time | Available for critical calls, 30 minutes response time | Updated during onboarding |

## Agent Spec Changes

| Field | Change Type | Details |
|-------|-------------|--------|
| system_prompt | modified | System prompt regenerated with updated account information |
| key_variables.emergency_contacts | modified | Changed from "[1 items]" to "[1 items]" |
| key_variables.services | modified | Changed from "[3 items]" to "[3 items]" |
| call_transfer_protocol.contacts | modified | Emergency contacts updated |
| version | modified | v1 → v2 |
