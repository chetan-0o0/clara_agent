// Extractor - Groq-based transcript → Account Memo extraction
const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const FALLBACK_MODEL = process.env.GROQ_FALLBACK_MODEL || 'llama-3.1-8b-instant';
const RATE_LIMIT_DELAY = parseInt(process.env.RATE_LIMIT_DELAY_MS) || 3000;
const MAX_RETRIES = 3;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Groq API call with retry + backoff + model fallback
async function callGroq(messages, attempt = 1, model = MODEL) {
    await sleep(RATE_LIMIT_DELAY);

    try {
        const response = await groq.chat.completions.create({
            model,
            messages,
            temperature: 0.1,
            max_tokens: 4000,
            response_format: { type: 'json_object' }
        });

        const content = response.choices[0].message.content;
        try {
            return JSON.parse(content);
        } catch (e) {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) return JSON.parse(jsonMatch[0]);
            throw new Error(`Failed to parse response: ${content.substring(0, 200)}`);
        }
    } catch (err) {
        const isRateLimit = err.message?.includes('rate_limit') || err.message?.includes('Rate limit') ||
            err.status === 429 || err.error?.code === 'rate_limit_exceeded';
        const isDailyLimit = err.message?.includes('tokens per day') || err.message?.includes('per day');

        console.log(`  ⚠ API error (attempt ${attempt}/${MAX_RETRIES}): ${err.message?.substring(0, 100)}`);

        // If daily limit hit and we're on the primary model, try fallback
        if (isDailyLimit && model === MODEL && model !== FALLBACK_MODEL) {
            console.log(`  → Switching to fallback model: ${FALLBACK_MODEL}`);
            return callGroq(messages, 1, FALLBACK_MODEL);
        }

        // Retry with exponential backoff for rate limits
        if (isRateLimit && attempt < MAX_RETRIES) {
            const delay = RATE_LIMIT_DELAY * Math.pow(2, attempt);
            console.log(`  → Retrying in ${delay}ms...`);
            await sleep(delay);
            return callGroq(messages, attempt + 1, model);
        }

        throw err;
    }
}

const DEMO_EXTRACTION_PROMPT = `You are a data extraction specialist for Clara Answers, an AI answering service company. 
You will be given a transcript of a DEMO CALL between a Clara Answers sales rep and a potential client (typically an HVAC, plumbing, electrical, or similar service company).

Extract ALL of the following fields into a valid JSON object. Be precise. Do NOT hallucinate or invent information. If a field is not mentioned in the transcript, set it to null or leave the array empty. Add it to questions_or_unknowns instead.

Required JSON schema:
{
  "account_id": "<generate a short ID like ACC-XXXX based on company name>",
  "company_name": "<exact company name>",
  "business_hours": {
    "days": "<e.g. Monday-Friday>",
    "start": "<e.g. 8:00 AM>",
    "end": "<e.g. 5:00 PM>",
    "timezone": "<e.g. EST>"
  },
  "office_address": "<full address or null>",
  "services_supported": ["<list of services they provide>"],
  "emergency_definition": ["<list of what counts as an emergency>"],
  "emergency_routing_rules": {
    "who_to_call": ["<ordered list of contacts with phone numbers if given>"],
    "fallback": "<what to do if no one answers>"
  },
  "non_emergency_routing_rules": {
    "action": "<what to do with non-emergency calls>",
    "details": "<scheduling info, voicemail, etc.>"
  },
  "call_transfer_rules": {
    "timeout_seconds": <number or null>,
    "max_retries": <number or null>,
    "failure_message": "<what to say if transfer fails>"
  },
  "integration_constraints": ["<any system restrictions, e.g. never create sprinkler jobs in ServiceTrade>"],
  "after_hours_flow_summary": "<brief description of what happens after hours>",
  "office_hours_flow_summary": "<brief description of what happens during office hours>",
  "questions_or_unknowns": ["<list any info that seems missing or unclear>"],
  "notes": "<any additional context>"
}

IMPORTANT RULES:
- Return ONLY the JSON object, no markdown formatting, no code blocks, no extra text
- Every field must be present in the output
- Do not wrap in backticks or any formatting
- Be conservative: only extract what is explicitly stated
- If unsure, add to questions_or_unknowns`;

const ONBOARDING_EXTRACTION_PROMPT = `You are a data extraction specialist for Clara Answers. 
You will be given:
1. A transcript of an ONBOARDING CALL with a client who has already completed a demo
2. The EXISTING account memo (v1) from their demo call

Your job is to extract UPDATES and CORRECTIONS from the onboarding call. The onboarding typically provides:
- More detailed or corrected business hours
- Specific emergency contact numbers and escalation procedures
- Detailed routing rules
- Integration requirements
- After-hours and office-hours flow details
- Any corrections to what was discussed in the demo

Return a COMPLETE updated account memo JSON (not just the changes). Merge the onboarding information with the existing v1 data. Where the onboarding provides new or different info, use the onboarding version. Where the onboarding doesn't mention something, keep the v1 value.

The JSON schema is the same as the v1 memo but with version field added. Return ONLY valid JSON, no markdown, no code blocks.`;

async function extractFromDemo(transcript) {
    return callGroq([
        { role: 'system', content: DEMO_EXTRACTION_PROMPT },
        { role: 'user', content: `Here is the demo call transcript:\n\n${transcript}` }
    ]);
}

async function extractFromOnboarding(transcript, existingMemo) {
    return callGroq([
        { role: 'system', content: ONBOARDING_EXTRACTION_PROMPT },
        {
            role: 'user',
            content: `EXISTING V1 ACCOUNT MEMO:\n${JSON.stringify(existingMemo, null, 2)}\n\nONBOARDING CALL TRANSCRIPT:\n${transcript}`
        }
    ]);
}

module.exports = { extractFromDemo, extractFromOnboarding };

