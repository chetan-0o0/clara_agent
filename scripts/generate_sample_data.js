// Generate sample transcript data - 5 demo calls + 5 onboarding calls
// Each pair represents a fictional HVAC/plumbing/electrical company
const fs = require('fs');
const path = require('path');

const TRANSCRIPTS_DIR = path.join(__dirname, '..', 'data', 'transcripts');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ============ DEMO TRANSCRIPTS ============

const demoTranscripts = [
    {
        filename: 'demo_01.txt',
        content: `DEMO CALL TRANSCRIPT
Company: Apex Heating & Cooling
Date: 2024-11-15
Participants: Sarah (Clara Sales Rep), Mike Reynolds (Owner, Apex)

Sarah: Hi Mike, thanks for taking the time today. I'm Sarah from Clara Answers. I'd love to learn about your business so we can set up the perfect answering solution for you.

Mike: Sure thing, Sarah. We're Apex Heating & Cooling. We've been serving the greater Charlotte, North Carolina area for about 15 years now.

Sarah: That's great! What services do you provide?

Mike: We do residential and commercial HVAC — heating, air conditioning, ventilation. We also do duct cleaning and indoor air quality assessments. And we recently started offering heat pump installation.

Sarah: Wonderful. And what are your business hours?

Mike: We're open Monday through Friday, 7 AM to 6 PM Eastern Time. We're closed weekends, but we do have an on-call technician for emergencies.

Sarah: Makes sense. What's your office address?

Mike: We're at 4521 Trade Street, Suite 200, Charlotte, NC 28203.

Sarah: Perfect. Now, how do you handle after-hours calls currently?

Mike: Right now it just goes to voicemail, and we check it in the morning. But we lose a lot of emergency calls that way. That's why we're looking at Clara.

Sarah: Absolutely. So let's talk about emergencies — what would you consider an emergency call?

Mike: No heat in winter when it's below 40 degrees, no AC when it's above 95, any gas smell or carbon monoxide alarm, and water leaking from the HVAC system. Those are the big ones.

Sarah: Got it. And who should we try to reach for emergencies?

Mike: First try me, Mike Reynolds, at 704-555-0142. If I don't answer, try our lead tech Dave Martinez at 704-555-0198. If neither of us answers, take a detailed message and tell the customer we'll call back within 30 minutes.

Sarah: And for non-emergency calls during business hours?

Mike: Try to transfer to our office at 704-555-0100. If the office doesn't pick up, take a message with the caller's name, number, and what they need. We'll get back to them same day.

Sarah: What about after-hours non-emergency calls?

Mike: Just take a message. Let them know we'll call back first thing the next business day. Always get their name, number, and a brief description of what they need.

Sarah: Any integrations or systems we should be aware of?

Mike: We use ServiceTitan for dispatching. But honestly, just taking messages is fine for now. Don't try to create any jobs or appointments in our system.

Sarah: Perfect, that keeps it simple. Anything else I should know?

Mike: Just be friendly and professional. We pride ourselves on customer service. Oh, and never give out pricing over the phone — always say a technician will provide a quote on-site.

Sarah: Got it, Mike. This is very helpful. We'll get a preliminary agent set up for you.
`
    },
    {
        filename: 'demo_02.txt',
        content: `DEMO CALL TRANSCRIPT
Company: BlueLine Plumbing Services
Date: 2024-11-16
Participants: Sarah (Clara Sales Rep), Jennifer Torres (Office Manager, BlueLine)

Sarah: Hi Jennifer, thanks for meeting with me. Tell me about BlueLine Plumbing.

Jennifer: Hi Sarah! BlueLine Plumbing has been around for 22 years. We're based in Austin, Texas and we cover the entire Austin metro area including Round Rock, Cedar Park, and Georgetown.

Sarah: What services do you offer?

Jennifer: Full plumbing services — drain cleaning, water heater repair and replacement, sewer line work, leak detection, fixture installation, and we just added water treatment systems. We also do gas line work.

Sarah: Great. What are your office hours?

Jennifer: Monday through Friday 8 AM to 5 PM Central Time. We also have Saturday hours from 9 AM to 1 PM, but that's just for the office. Technicians don't go out on Saturdays unless it's an emergency.

Sarah: And your office location?

Jennifer: 7890 Research Boulevard, Suite 150, Austin, TX 78759.

Sarah: What qualifies as a plumbing emergency for you?

Jennifer: Burst pipes, major water leaks — like water actively flowing and can't be shut off, sewer backups inside the home, no hot water in winter, and gas leaks. Gas leaks are the most critical — we tell people to leave the house and call the gas company first, then call us.

Sarah: Good to know. Who do we contact for emergencies?

Jennifer: Our on-call dispatcher is first — that number rotates weekly. The current on-call number is always at 512-555-0300. If that doesn't work, call our owner Tom Torres at 512-555-0155. As a last resort, take the info and text Tom at the same number.

Sarah: How long should we wait when trying to transfer?

Jennifer: Give it 45 seconds before trying the next person. And try each number twice at most.

Sarah: And non-emergency calls?

Jennifer: During business hours, try to send them to the office at 512-555-0100. If no one picks up, take a message and make sure you ask if they need morning or afternoon for a callback. After hours, just take a message. Reassure them we'll call first thing Monday, or next business day.

Sarah: Any system integrations?

Jennifer: We use Housecall Pro for scheduling. But don't create any jobs through it — just take messages and we'll handle scheduling internally. One important thing — never give estimates or pricing. Always say our dispatcher will schedule a technician visit and they'll provide pricing on-site.

Sarah: Anything else?

Jennifer: Yes — if someone calls about a warranty claim, make sure to note that separately. We need to handle those differently. And always ask for the service address, not just the caller's name and number.

Sarah: Perfect, Jennifer. Very thorough. We'll get started on your agent.
`
    },
    {
        filename: 'demo_03.txt',
        content: `DEMO CALL TRANSCRIPT
Company: Evergreen Electrical Solutions
Date: 2024-11-17
Participants: James (Clara Sales Rep), Patricia Nguyen (VP Operations, Evergreen)

James: Patricia, great to connect. Tell me about Evergreen Electrical.

Patricia: Thanks James. Evergreen Electrical Solutions is a commercial and residential electrical contractor. We're based in Denver, Colorado. Founded 8 years ago, but we've grown fast. We do work across the front range — Denver, Boulder, Fort Collins, Colorado Springs.

James: That's a wide coverage area! What services?

Patricia: Commercial electrical installation and maintenance, residential rewiring, panel upgrades, EV charger installation — that's a big one for us now — generator installation and service, lighting design, and emergency electrical repairs. We also do electrical safety inspections.

James: Your business hours?

Patricia: Monday through Friday, 7:30 AM to 5:30 PM Mountain Time. We don't have weekend office hours, but we have a 24/7 emergency line.

James: Office address?

Patricia: 2100 Blake Street, Suite 400, Denver, CO 80205.

James: What counts as an electrical emergency?

Patricia: Complete power loss not caused by the utility company, sparking or burning smell from outlets or panels, exposed live wires, electrical fires or smoke, and downed power lines on property — although for that last one, they should call the utility first and stay away.

James: Who should we reach for emergencies?

Patricia: Call our emergency line at 303-555-0250 first. That goes to our dispatch team. If no answer, try Patricia Nguyen — that's me — at 303-555-0177. If I'm not available, try our field supervisor Carlos Ruiz at 303-555-0188.

James: How about the transfer protocol?

Patricia: Ring for 30 seconds, then try the next number. Maximum two attempts per number. If nobody answers, take all the details and tell the caller we'll have someone reach out within 20 minutes for emergencies. For non-emergencies, within one business day.

James: Non-emergency call handling?

Patricia: During business hours, transfer to our main office at 303-555-0200. If they don't pick up, take a message. After hours, just take messages and let callers know we'll call back next business day. Unless it's an emergency, of course.

James: Integrations or systems?

Patricia: We use Jobber for project management. Don't create anything in Jobber — just collect information. We'll handle job creation internally. Also, never discuss pricing. Commercial projects especially — tell them we'll schedule a consultation.

James: Anything else notable?

Patricia: We get a lot of calls about EV charger installations. Those aren't emergencies but they are high-priority leads. If someone calls about EV chargers, make sure to mark that specifically. Also, we're licensed in Colorado only — if someone calls from out of state, politely let them know we can't help and suggest they find a local electrician.

James: Great info, Patricia.
`
    },
    {
        filename: 'demo_04.txt',
        content: `DEMO CALL TRANSCRIPT
Company: Reliable Restoration & Water Damage
Date: 2024-11-18
Participants: Sarah (Clara Sales Rep), Greg Patterson (General Manager, Reliable)

Sarah: Hi Greg, thanks for your time. Let's learn about Reliable Restoration.

Greg: Hey Sarah. Reliable Restoration & Water Damage — we've been operating in the Miami-Dade and Broward County area of South Florida for 10 years. We're one of the top-rated restoration companies here.

Sarah: What services do you provide?

Greg: Water damage restoration, mold remediation, fire and smoke damage restoration, storm damage repair, sewage cleanup, and we also do reconstruction after damage. Basically, anything from the initial emergency through to full rebuild.

Sarah: Hours of operation?

Greg: Here's the thing — our office is open Monday through Friday, 8 AM to 6 PM Eastern. But our emergency response is 24/7, 365 days a year. We're a restoration company — emergencies don't wait. When a pipe bursts at 2 AM, we need to be there.

Sarah: Understood. Office address?

Greg: 3300 Biscayne Boulevard, Suite 102, Miami, FL 33137.

Sarah: What counts as an emergency?

Greg: Almost everything we do is time-sensitive, but the real emergencies are: active water flooding, sewage backup, fire or smoke damage that just happened, mold discovered in a property that's inhabited — especially with kids or elderly — and storm damage with structural concern. Basically, if water is actively flowing or there's immediate health or safety risk.

Sarah: Who handles emergency calls?

Greg: Our emergency dispatch operates 24/7 at 305-555-0400. Always try there first. If that line is down or busy, try me directly at 305-555-0122. Third option is our operations director Maria Sanchez at 305-555-0133. One of us will always answer.

Sarah: Transfer timeout?

Greg: 20 seconds. We move fast. Try each number once, then move to the next. If you go through all three and nobody picks up, take ALL the details — name, phone, address, what happened, when it happened, insurance company if they know it — and tell them we'll have a team calling back in 15 minutes max.

Sarah: Non-emergency calls?

Greg: For estimates, inspections, follow-ups — transfer to the office at 305-555-0100 during business hours. After hours, take a message and say we'll call back next business day.

Sarah: System integrations?

Greg: We use DASH by Xactimate for claims and project tracking. Don't interact with it at all. Just collect the info. Also — important — if someone mentions insurance, always ask for the insurance company name, claim number if they have one, and date of loss. We need that info upfront for restoration jobs.

Sarah: Anything else?

Greg: Yeah, always express urgency and empathy. People calling us are often in crisis. Don't be too casual. And never tell them what the cost will be — insurance usually covers it, but we can only make that determination after inspection. Also, if someone from an insurance company calls, transfer them directly to the office — don't take a message, transfer them no matter what.

Sarah: Got it, Greg. We'll set up something great for you.
`
    },
    {
        filename: 'demo_05.txt',
        content: `DEMO CALL TRANSCRIPT
Company: Summit Mechanical Services
Date: 2024-11-19
Participants: James (Clara Sales Rep), Karen Brooks (Owner, Summit)

James: Karen, thanks for the demo call. Tell me about Summit Mechanical.

Karen: Hi James. Summit Mechanical Services — we're based in Nashville, Tennessee. We do HVAC and plumbing under one roof. My husband Bill and I started the company 18 years ago. We have about 30 employees now.

James: That's impressive growth. What services specifically?

Karen: HVAC side — installation, repair, and maintenance for both residential and commercial. Plumbing side — all standard plumbing services, water heaters, gas line work, sewer and drain. We also do ductwork fabrication in-house, which is kind of our specialty. And we offer maintenance contracts.

James: Business hours?

Karen: Monday through Friday, 8 AM to 5 PM Central Time. We also have limited Saturday hours — 8 AM to noon, but that's just phones. We have on-call technicians for both HVAC and plumbing emergencies 24/7.

James: Office address?

Karen: 1450 Broadway, Nashville, TN 37203.

James: What constitutes an emergency?

Karen: HVAC emergencies — no heat when it's below 35 degrees, no AC when it's over 95, any gas smell or carbon monoxide detector going off, refrigerant leaks. Plumbing emergencies — burst pipes, active flooding, sewer backup, gas line leaks, no water at all to the property. Basically, anything that puts health, safety, or property at immediate risk.

James: Emergency escalation — who do we contact?

Karen: First try our dispatch team at 615-555-0500. They're staffed 24/7. If no answer, try me — Karen Brooks — at 615-555-0166. Then Bill Brooks at 615-555-0177. If you can't reach any of us, take the message with all details and assure a callback within 20 minutes.

James: Transfer guidelines?

Karen: 25-second timeout. Two attempts per number. When transferring, tell the caller you're connecting them now. If transfer fails, don't just hang up — stay on the line, collect their information, and give them a clear expectation for callback.

James: Non-emergency handling?

Karen: Business hours — try the main office at 615-555-0100. If no answer, take a message. Ask for their preferred callback time. After hours — take a message, assure next business day callback. On Saturdays between 8 and noon, try the office number first.

James: Any system or integration notes?

Karen: We use ServiceTrade for our commercial accounts and FieldEdge for residential. Don't create anything in either system. Just take messages. Oh — really important — for commercial calls, always ask if they have a maintenance contract with us. That changes priority. Contract customers get bumped up.

James: Anything else?

Karen: We get a lot of calls from property managers. They manage multiple properties, so always ask for the specific property address, not just the caller's info. Also, never promise same-day service — say we'll do our best but a scheduler will confirm the appointment. And always be upbeat and warm — Nashville hospitality, you know?

James: Love it, Karen. We'll build something great.
`
    }
];

// ============ ONBOARDING TRANSCRIPTS ============

const onboardingTranscripts = [
    {
        filename: 'onboarding_01.txt',
        content: `ONBOARDING CALL TRANSCRIPT
Account ID: ACC-APEX
Company: Apex Heating & Cooling
Date: 2024-12-01
Participants: Rachel (Clara Onboarding), Mike Reynolds (Owner, Apex)

Rachel: Hi Mike, welcome to Clara Answers! During this onboarding session, I'd like to confirm and fill in some details from your demo. Let's make sure we get everything right.

Mike: Sure, let's do it.

Rachel: Great. First, your business hours — we have Monday through Friday, 7 AM to 6 PM Eastern. Is that still correct?

Mike: Actually, we just made a change. Starting next month, we're extending to Monday through Saturday. Saturday hours will be 8 AM to 2 PM. Our Friday hours are now until 7 PM because we added a second shift.

Rachel: Got it. Monday through Thursday 7 AM to 6 PM, Friday 7 AM to 7 PM, Saturday 8 AM to 2 PM, all Eastern?

Mike: That's right.

Rachel: Now, emergency contacts. We have you first at 704-555-0142, then Dave Martinez at 704-555-0198.

Mike: Yes, but I want to add a third contact. We hired a new service manager, Lisa Chen, her number is 704-555-0210. She should be between me and Dave. So it's me, then Lisa, then Dave.

Rachel: Perfect. Any changes to what counts as an emergency?

Mike: Add one more — refrigerant leaks. We've had a few of those recently and they need immediate attention. Oh, and any issue at a commercial client site is automatically elevated to emergency-level priority.

Rachel: Understood. What about transfer timeouts?

Mike: Let's do 25 seconds instead of whatever we said before. And try each number twice. If all three contacts fail, take the message and tell them 20-minute callback, not 30.

Rachel: Great. Non-emergency calls?

Mike: Same as before — transfer to office during hours, take a message if nobody answers. But add this: if they're calling about a maintenance contract renewal, flag that as high priority and try to transfer to Lisa Chen directly.

Rachel: Got it. Any new integration notes?

Mike: Yeah, we fully moved to ServiceTitan now. Still don't create jobs in it. But if a caller mentions their job number, please capture that in the message. Also, we started using a new customer portal — if someone asks about their invoice or appointment, direct them to portal.apexhvac.com.

Rachel: Systems — anything else about after-hours flow?

Mike: After hours, for emergencies, follow the same escalation but add this: if it's a carbon monoxide alarm, tell the caller to leave the building immediately and call 911 first, then call us. That's critical safety protocol. For non-emergencies after hours, same as before — take a message.

Rachel: This is very helpful, Mike. We'll update your agent configuration.

Mike: Thanks Rachel!
`
    },
    {
        filename: 'onboarding_02.txt',
        content: `ONBOARDING CALL TRANSCRIPT
Account ID: ACC-BLUE
Company: BlueLine Plumbing Services
Date: 2024-12-02
Participants: Rachel (Clara Onboarding), Jennifer Torres (Office Manager, BlueLine)

Rachel: Hi Jennifer, welcome to onboarding! Let's refine the details from your demo.

Jennifer: Great, I have some updates.

Rachel: Let's start with business hours.

Jennifer: Mostly the same — Monday through Friday 8 to 5 Central, Saturday 9 to 1. But I want to add that we're closed entirely on all major holidays. Also, we're adding Sunday emergency-only coverage starting January. So Sundays will have on-call technicians available, but the office is closed.

Rachel: Got it. Emergency contacts?

Jennifer: The on-call dispatcher at 512-555-0300 stays the same. But Tom's number changed — his new cell is 512-555-0199. And we added a night manager, Carlos Vega, at 512-555-0250. The order should be: on-call dispatcher, then Tom Torres, then Carlos Vega.

Rachel: Emergency definitions — any updates?

Jennifer: Add tree root intrusion causing active sewage issues. And I want to be more specific about the gas leak protocol: if someone reports a gas smell, the FIRST thing we tell them is to leave the house, don't turn on any electrical switches, and call the gas company at 1-800-959-5325. Then call us. Do not try to transfer them while they're in the house with a gas leak.

Rachel: Important safety step. Transfer rules?

Jennifer: Keep it at 45 seconds, two attempts. But change the failure message. Instead of a generic message, say: "I've recorded all your details and marked this as urgent. Our dispatch team will contact you within 15 minutes."

Rachel: Non-emergency handling?

Jennifer: During business hours, still try the office at 512-555-0100. But now we have a dedicated scheduling line — 512-555-0101. If someone specifically says they want to schedule an appointment, try the scheduling line first. After hours non-emergency — take a message as before, but also ask them if they'd like a morning or afternoon callback.

Rachel: Service updates?

Jennifer: We added tankless water heater services and whole-house repiping. Please add those to our services list. Oh, and for warranty calls — I mentioned these in the demo — make sure to ask for their original service date and the name of the technician if they remember.

Rachel: Integration notes?

Jennifer: Still using Housecall Pro, still don't create jobs. But we now accept online bookings at bluelineplumbing.com/book. If someone asks about booking online, you can mention that URL. Never give pricing or estimates over the phone.

Rachel: Perfect, Jennifer. All updates noted.
`
    },
    {
        filename: 'onboarding_03.txt',
        content: `ONBOARDING CALL TRANSCRIPT
Account ID: ACC-EVER
Company: Evergreen Electrical Solutions
Date: 2024-12-03
Participants: James (Clara Onboarding), Patricia Nguyen (VP Operations, Evergreen)

James: Patricia, good to have you in onboarding. Let's review and sharpen your setup.

Patricia: Perfect. I've got a list of updates.

James: Business hours first.

Patricia: We're expanding. Monday through Friday stays 7:30 to 5:30 Mountain. But we're adding Saturday hours: 9 AM to 3 PM for our residential team. Commercial remains weekday only.

James: Office address same?

Patricia: Yes, 2100 Blake Street, Suite 400, Denver. But we opened a second office in Colorado Springs at 150 East Pikes Peak Avenue, Suite 300, Colorado Springs, CO 80903. Calls from the southern Colorado area should reference the Springs office.

James: Emergency contacts — any changes?

Patricia: Yes. The emergency line 303-555-0250 stays the same. But we switched the order. Carlos Ruiz should now be second, before me. So it's: emergency line, then Carlos at 303-555-0188, then me at 303-555-0177. Carlos lives closer to most job sites and can respond faster.

James: Emergency definitions?

Patricia: Add one: any electrical issue at a commercial facility that could impact business operations. Also, for downed power lines — make absolutely clear: do NOT approach, stay at least 35 feet away, call 911 first. Then call us. We've had some close calls.

James: Transfer rules?

Patricia: 30 seconds, two attempts — same. But add a note: for commercial clients during business hours, if you can't reach dispatch, try our commercial project manager Angela Wu at 303-555-0195 before taking a message.

James: Non-emergency?

Patricia: During hours, transfer to main office 303-555-0200. After hours, take messages. New addition: for EV charger inquiries, we now have a dedicated EV team. Transfer those calls to 303-555-0260 during business hours. After hours, mark them as high-priority callbacks.

James: New integration notes?

Patricia: We migrated from Jobber to BuildOps. Still don't create anything in the system. But if a caller references a project number — it starts with "EE-" followed by numbers — capture that in the message. We can look it up faster if we have it.

James: Anything else?

Patricia: Updated our service area. We no longer service Fort Collins — we're now Denver, Boulder, Castle Rock, and Colorado Springs. If someone calls from Fort Collins, apologize and suggest they find a local provider. Also, mention we now do solar panel electrical hookups — that's a new service line.

James: Got it all, Patricia. We'll update the agent.
`
    },
    {
        filename: 'onboarding_04.txt',
        content: `ONBOARDING CALL TRANSCRIPT
Account ID: ACC-RELI
Company: Reliable Restoration & Water Damage
Date: 2024-12-04
Participants: Rachel (Clara Onboarding), Greg Patterson (GM, Reliable)

Rachel: Greg, welcome to onboarding. Let's finalize your setup.

Greg: Let's go. I've got a few changes.

Rachel: Business hours?

Greg: Office hours expand slightly. Monday through Friday, 7 AM to 7 PM Eastern now. We keep 24/7 emergency response as always. No weekends for the office, but emergency dispatch is always active.

Rachel: Emergency contacts?

Greg: Same three: dispatch at 305-555-0400, me at 305-555-0122, Maria at 305-555-0133. But add a fourth: our new emergency coordinator, James Rivera, at 305-555-0144. He slots in between me and Maria.

Rachel: Emergency definitions?

Greg: Same as before but I want to add: roof leaks during active rain and any situation where there's standing water greater than 1 inch. Also — and this is critical — if someone reports mold AND they have infants, elderly, or immunocompromised people in the home, that's now an immediate emergency, not just urgent.

Rachel: That's important context. Transfer rules?

Greg: Stay at 20 seconds per attempt, one try per number before moving to next. But now with four contacts, the chain is: dispatch, me, James Rivera, Maria. If all four fail — and this should almost never happen — take everything down and promise a 10-minute callback, not 15. We've improved our response times.

Rachel: Non-emergency handling?

Greg: Same as demo. Transfer to office during hours, take messages after hours. But add this: if an insurance adjuster calls, NO MATTER WHAT TIME, try to transfer them to Maria Sanchez directly at 305-555-0133. Insurance calls are high priority, any hour.

Rachel: Services — anything new?

Greg: We added content pack-out and storage services. That's when we pack up a homeowner's belongings during restoration and store them. Also added biohazard cleanup. And we now have a separate division for commercial restoration — if a commercial property calls, make sure to tag it as commercial.

Rachel: Integration or system updates?

Greg: We still use DASH/Xactimate. Don't touch it. New addition — we now require adjusters or callers to provide a policy number along with the claim number. So the list for insurance-related calls is: name, phone, address, date of loss, insurance company, claim number, and policy number. Seven items — make sure we get all of them.

Rachel: That's very thorough. Anything else?

Greg: One more — during hurricane season, June through November, if someone calls about storm damage, always ask if they've filed a claim with their insurance yet. If not, remind them to start that process and give them our direct office number 305-555-0100 for follow-up. Empathy is key — these people are stressed.

Rachel: Understood, Greg. We'll update everything.
`
    },
    {
        filename: 'onboarding_05.txt',
        content: `ONBOARDING CALL TRANSCRIPT
Account ID: ACC-SUMM
Company: Summit Mechanical Services
Date: 2024-12-05
Participants: James (Clara Onboarding), Karen Brooks (Owner, Summit)

James: Karen, thanks for joining the onboarding session. Let's refine things.

Karen: Let's do it. I've been thinking about this a lot.

James: Business hours first.

Karen: Updating slightly. Monday through Friday stays 8 AM to 5 PM Central. Saturday stays 8 AM to noon. But we want to add that we're closed the week between Christmas and New Year's every year — emergency-only during that week. All other holidays, we have at least on-call coverage.

James: Emergency contacts?

Karen: Our dispatch at 615-555-0500 stays. My number stays at 615-555-0166. Bill's number changed — new number is 615-555-0188. And we hired a 24/7 on-call coordinator, Rachel Park, at 615-555-0200. The order should be: dispatch, Rachel Park, me, Bill. Rachel sleeps with her phone on — she's our always-on person.

James: Emergency definitions?

Karen: Everything from the demo still applies. Adding: any issue at a hospital, nursing home, or school is automatically an emergency regardless of what the actual issue is. Those are critical facilities for us. Also, any gas line work request becomes urgent — not all are emergencies, but we want same-day response on gas.

James: Got it. Transfer protocol?

Karen: 25 seconds, two attempts. But for critical facility calls — hospitals, schools, nursing homes — skip the queue and go straight to dispatch plus Rachel Park simultaneously if possible. If not possible, try dispatch, then Rachel, then me. Don't even bother with Bill for those — he's more admin side.

James: Non-emergency calls?

Karen: Same as before mostly. Try office at 615-555-0100 during hours. Saturday 8-noon try office. After hours, take messages. NEW: we have a dedicated maintenance contract line now — 615-555-0550. If any current contract customer calls, try that line first. They pay for priority service.

James: How do we know if they're a contract customer?

Karen: They'll usually say "I have a maintenance contract" or "I'm a contract customer." If they don't volunteer it, still ask: "Do you have a maintenance contract with Summit?" That should be a standard question during the call.

James: Service updates?

Karen: We now do boiler repair and installation — didn't mention that in the demo. We also started offering free estimates on new system installations. So if someone calls asking about installing a new HVAC system or water heater, let them know we'd be happy to schedule a free in-home estimate. Don't give pricing though — just the free estimate offer.

James: Integration updates?

Karen: We consolidated everything to ServiceTrade. Dropped FieldEdge. Still don't create jobs. But if someone mentions a service agreement number — starts with "SM-" plus digits — capture that. For commercial callers, also ask for the building or property name, not just the address. Sometimes one company manages many buildings.

James: Anything else?

Karen: Tone is really important to us. We want the agent to feel like a warm Nashville receptionist. Use phrases like "happy to help," "sure thing," and "y'all have a great day." But keep it natural — don't overdo the southern charm. And NEVER say "I don't know" — if unsure, say "Let me make sure the right person gets back to you on that."

James: Love the attention to brand voice. We'll make it happen, Karen.
`
    }
];

function generate() {
    ensureDir(TRANSCRIPTS_DIR);

    console.log('Generating sample transcripts...\n');

    for (const t of demoTranscripts) {
        const filePath = path.join(TRANSCRIPTS_DIR, t.filename);
        fs.writeFileSync(filePath, t.content.trim());
        console.log(`  ✓ ${t.filename}`);
    }

    for (const t of onboardingTranscripts) {
        const filePath = path.join(TRANSCRIPTS_DIR, t.filename);
        fs.writeFileSync(filePath, t.content.trim());
        console.log(`  ✓ ${t.filename}`);
    }

    console.log(`\nGenerated ${demoTranscripts.length} demo + ${onboardingTranscripts.length} onboarding transcripts`);
    console.log(`Location: ${TRANSCRIPTS_DIR}`);
}

generate();
