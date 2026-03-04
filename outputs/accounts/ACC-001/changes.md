# Changelog: v1 → v2

**Generated**: 2026-03-04T19:44:31.309Z

## Account Memo Changes

| Field | Old Value | New Value | Reason |
|-------|-----------|-----------|--------|
| business_hours_saturday | null | {"days":"Saturday","start":null,"end":null,"timezone":"Central Time","voicemail_only":true} | Added during onboarding |
| emergency_contact_numbers | null | [{"name":"Angela","number":"555-123-4567","role":"Account Manager"}] | Added during onboarding |
| escalation_procedures | null | {"initial_response_time":null,"response_time_after_initial":null,"response_time_after_second":null} | Added during onboarding |
| routing_rules | null | {"office_hours":{"action":"Answer calls professionally, take order details, and relay to fleet","details":"Use Google Maps and a simple spreadsheet"},"after_hours":{"action":"Take messages and have those calls logged","details":"Email message to customer by 9 AM next business day"}} | Added during onboarding |
| integration_requirements | null | {"google_maps":{"integration_type":"relay","details":"Relay routing info via phone or SMS to drivers"}} | Added during onboarding |
| training_requirements | null | {"training_type":"30-minute training session","training_details":"Call scripts, confirm procedures"} | Added during onboarding |
| quality_control | null | {"call_recording":true,"transcript":true,"review_and_correct":true} | Added during onboarding |

## Agent Spec Changes

| Field | Change Type | Details |
|-------|-------------|--------|
| version | modified | v1 → v2 |
