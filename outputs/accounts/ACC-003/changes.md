# Changelog: v1 → v2

**Generated**: 2026-03-04T19:44:19.094Z

## Account Memo Changes

| Field | Old Value | New Value | Reason |
|-------|-----------|-----------|--------|
| business_hours.timezone | null | Central Time (US & Canada) | Updated during onboarding |
| services_supported | ["Circuit breaker issues","Electrical maintenance","Generator hookups","Networking cable modification","Outlet replacement"] | ["Circuit breaker issues","Electrical maintenance","Generator hookups","Networking cable modification","Outlet replacement","UPS system upgrade"] | Updated list: +1 added, -0 removed |
| emergency_routing_rules.who_to_call | [{"name":"Robert Torres","phone_number":null}] | [{"name":"Robert Torres","phone_number":"+1-512-123-4567"}] | Updated list: +1 added, -1 removed |
| non_emergency_routing_rules.details | Robert will come out himself, probably tomorrow afternoon | Robert will come out himself, probably within 1-2 business days | Updated during onboarding |
| call_transfer_rules.timeout_seconds | null | 30 | Updated during onboarding |
| call_transfer_rules.max_retries | null | 3 | Updated during onboarding |
| call_transfer_rules.failure_message | null | Unable to reach Guardian Electrical. Please try again later. | Updated during onboarding |
| after_hours_flow_summary | 2-3 hours response time, Robert can be there in 1 hour if needed | 2-3 hours response time, Robert can be there in 1 hour if needed, capped at $150 | Updated during onboarding |
| office_hours_flow_summary | 1-2 hours response time | 1-2 hours response time, capped at $150 for emergency service calls | Updated during onboarding |
| questions_or_unknowns | ["Integration with other systems","Liability coverage details","Timezone"] | ["Integration with other systems","Liability coverage details"] | Updated list: +0 added, -1 removed |
| notes | null | Retainer agreement and terms will be emailed to Lisa for signature. First maintenance visit scheduled for early April. | Updated during onboarding |

## Agent Spec Changes

| Field | Change Type | Details |
|-------|-------------|--------|
| system_prompt | modified | System prompt regenerated with updated account information |
| key_variables.timezone | modified | Changed from "EST" to "Central Time (US & Canada)" |
| key_variables.business_hours | modified | Changed from "Monday-Friday, 8:00 AM - 5:00 PM " to "Monday-Friday, 8:00 AM - 5:00 PM Central Time (US & Canada)" |
| key_variables.emergency_contacts | modified | Changed from "[1 items]" to "[1 items]" |
| key_variables.services | modified | Changed from "[5 items]" to "[6 items]" |
| call_transfer_protocol.contacts | modified | Emergency contacts updated |
| fallback_protocol | modified | Fallback protocol updated with new information |
| version | modified | v1 → v2 |
