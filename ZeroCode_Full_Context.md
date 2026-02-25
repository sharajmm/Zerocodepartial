# Zero Code — Full Platform Context Document
> Created for continuity across brainstorming sessions. Feed this entire document to a new Claude session to continue from exactly where we left off.

---

## 👤 About the Builder

- **Name context:** Top 1 student, Final year CS, Tier 2 college
- **Role:** Leading the college product expo event (March 2-3)
- **Goal:** Win "Best CS Software Project of the Year" at the college expo
- **Team:** Solo
- **Judges:** College Professors / HOD + Industry Professionals / Guests
- **Time:** Full-time grind, ~7-8 days to build V1
- **Stack:** Python / ML / AI APIs, React / JS / Node, Flutter, C++
- **Registered Expo Title:** "EvaQA - An Autonomous AI QA Agent" (can bring a second project since leading the event)

---

## 💡 What is Zero Code?

**Zero Code** is a desktop application (Electron-based) that combines an **embedded browser + AI-powered QA testing + collaborative workspace + (V2) visual web builder** into one unified platform.

The name "Zero Code" means exactly what it says — users test websites, build products, and manage QA workflows without writing a single line of code themselves. The AI does it all, visually, transparently, and collaboratively.

**Target Users:**
- QA Engineers who hate writing test scripts
- Developers who want instant testing without switching tools
- Team Leads and Clients who want visibility into QA without technical knowledge
- Freelancers and solo developers who do both dev and QA alone
- Non-technical startup founders who need testing without hiring QA

**Competitive Landscape (what Zero Code replaces):**
- Selenium / Cypress / Playwright — require coding
- TestRail / Zephyr — manual test case writing
- Cursor — dev focused, no QA
- Webflow / Framer — no AI QA integration
- None of them combine Dev + QA + Collaboration in one offline-first app

---

## 🏗️ Architecture Overview

### Core Tech Stack

| Layer | Technology |
|---|---|
| Desktop App Shell | Electron |
| Frontend UI | React + TailwindCSS |
| Embedded Browser | Electron Webview / BrowserView |
| Flowchart Visualizer | React Flow |
| AI Core (local) | Ollama — Qwen2.5-coder:3b (default) |
| Test Execution Engine | Playwright |
| Collaboration Layer | Liveblocks (free tier) |
| Internet Usage Meter | Custom Liveblocks byte tracker (bottom status bar) |
| Report Generator | PDF export library |
| DOM Scraper | Electron executeJavaScript on webview |

### Multi-Model AI Stack (Ollama only — all local, zero internet)
| Model | Notes |
|---|---|
| Qwen2.5-coder:3b (default) | Ships as default recommendation |
| Any installed Ollama model | User installs whatever they want, Zero Code detects automatically |

> Model switching fetches installed models from Ollama API at `GET http://localhost:11434/api/tags`. No cloud models. No API keys. 100% local AI forever.

---

## 🔑 The Core Technical Problem (SOLVED)

**Problem:** Local AI (Qwen via Ollama) doesn't know real-time CSS selectors or web elements on a live website. It would blindly guess selectors and fail 70% of the time.

**Solution — DOM Context Injection Pipeline:**

1. User describes what to test in plain English
2. Before calling AI, the app runs a DOM scraper on the embedded webview:
```javascript
webview.executeJavaScript(`
  Array.from(document.querySelectorAll(
    'button, a, input, select, textarea, [role="button"]'
  )).map(el => ({
    tag: el.tagName,
    id: el.id,
    classes: el.className,
    text: el.innerText?.trim(),
    placeholder: el.placeholder,
    href: el.href,
    selector: el.id ? '#'+el.id : '.'+el.className.split(' ')[0],
    ariaLabel: el.getAttribute('aria-label')
  }))
`)
```
3. This real DOM map is injected into the AI prompt as context
4. AI generates Playwright code using ONLY confirmed, real selectors
5. Tests are accurate every time — no guessing

**Bonus Feature — Visual Element Picker:**
User can hover over any element in the embedded browser. The app highlights it and shows its real selector. User can "pin" elements into their test description by clicking. This eliminates all ambiguity.

---

## ⚙️ Full Execution Pipeline

```
User types test description in plain English
            ↓
App scrapes live DOM from embedded browser → real selectors extracted
            ↓
DOM map + user intent injected into AI prompt (Qwen / selected model)
            ↓
AI generates Playwright test script
            ↓
AI also generates a flowchart JSON (nodes + edges representing test steps)
            ↓
React Flow renders the flowchart visually
            ↓
Playwright executes the test step by step
            ↓
Each step completion lights up the corresponding flowchart node
            ↓
On failure: screenshot captured as evidence + error logged
            ↓
Full test report generated (PDF) with steps, results, screenshots
```

---

## 🎨 UI / UX Design

### Layout
- **Left Panel:** Embedded browser (user navigates to website they want to test)
- **Right Panel:** Chat/prompt interface where user describes tests
- **Center / Main View:** Flowchart visualizer (React Flow) showing test plan and live execution

### The Toggle (Key UI Feature)
Exactly like Claude's preview/code toggle:
- **Flowchart View** — visual nodes and edges, animates as test runs, color coded (pending = grey, running = blue, pass = green, fail = red)
- **Code View** — the actual generated Playwright code, syntax highlighted
User can switch between both at any time, even mid-execution.

### Visual Execution
- As each test step runs, the corresponding flowchart node pulses/animates
- Failed nodes turn red and show a thumbnail of the screenshot evidence inline
- Passed nodes turn green
- Overall progress shown as a completion bar

### Element Picker Mode
- User clicks "Pick Element" button
- Hovering over elements in the embedded browser highlights them with a blue outline
- Real selector shown in a tooltip
- Click to pin that element into the active test description

---

## 👥 Collaboration Features (Google Docs Style)

- **Invite by link or email** — generate a session invite link
- **Roles:**
  - **Owner/Driver** — the QA engineer running tests, full control
  - **Developer** — can view live execution, can toggle to code view
  - **Team Lead** — read-only view of flowchart and results
  - **Client** — simplified read-only view, sees pass/fail only, no code
- **Live presence** — see who's in the session (colored cursors / avatars)
- **Real-time sync** — everyone sees the same flowchart executing simultaneously via WebSocket
- **Session recording** — entire test run can be replayed later

---

## 📄 Test Reports & Documentation

Auto-generated after every test run:
- **Test Report PDF** containing:
  - Test name and description
  - Date/time and URL tested
  - Step by step breakdown with pass/fail status
  - Screenshot evidence for every failed step
  - Summary stats (X passed, Y failed, Z skipped)
  - Generated Playwright code (appendix)
- **Log File** — raw error logs for developers
- Reports can be exported or shared directly from the app

---

## 🗺️ Product Roadmap

### V1 — Autonomous QA Platform (EXPO TARGET)
- [x] Electron desktop app with embedded browser
- [x] Natural language test description input
- [x] DOM context injection pipeline
- [x] AI test generation (Qwen via Ollama, model switching)
- [x] Playwright test execution engine
- [x] React Flow flowchart visualizer with live animation
- [x] Flowchart ↔ Code toggle
- [x] Visual element picker
- [x] Screenshot evidence capture on failure
- [x] Log file generation
- [x] PDF test report generation
- [x] Google Docs style collaboration (WebSocket)
- [x] Multi-role access (Owner, Developer, Team Lead, Client)

### V2 — Dev + QA Unified Platform (Post Expo)
- [ ] Drag and drop visual web builder integrated into the app
- [ ] Live preview in embedded browser as you build
- [ ] **Drag element from browser into chat** — user grabs a button from the live page, drops it into the chat, says "change this to red" — AI targets that exact element and updates it live
- [ ] AI-powered code generation for the web builder
- [ ] Unified Dev + QA workflow — build in the same tool you test in
- [ ] Target users: freelancers, solo developers, small agencies

---

## 🎯 Expo Demo Script (3 Minutes)

**Setup:** Zero Code is open. Embedded browser is loaded with the college website (or any live site).

**Minute 1 — The Hook:**
Ask a visitor: *"What do you think happens when I type what I want to test here?"*
Type: *"Test if all the navigation links on this page work correctly"*
Hit enter. Watch the flowchart generate in real time — nodes appearing, edges connecting, the full test plan visualized before a single test runs.

**Minute 2 — The Execution:**
Hit Run. Watch the flowchart come alive — nodes lighting up one by one as Playwright runs each step in the embedded browser. One link is broken. That node turns red. A screenshot pops up as evidence automatically. Toggle to code view — show the actual Playwright code that was generated. Toggle back to flowchart.

**Minute 3 — The Closer:**
Open the generated PDF report. Show the pass/fail breakdown, the screenshot evidence embedded in the document. Then pull out a second device — show the collaboration view, Team Lead watching the same session live. Ask the visitor: *"Did you write a single line of code just now?"* They say no. You say — *"That's Zero Code."*

---

## 💬 Key Talking Points for Judges

**For Professor / HOD:**
- Demonstrates NLP, test automation, real-time systems, WebSocket collaboration, PDF generation, Electron desktop development — covers multiple CS domains
- Solves a real industry problem, not a toy project
- Has a clear V1 → V2 product roadmap showing long-term thinking

**For Industry Professionals:**
- QA automation is a massive industry — Selenium, Cypress, Playwright all require engineers who can code
- Zero Code democratizes QA — any team member can run professional tests
- The DOM context injection pipeline is a genuine technical innovation that solves the #1 failure point of AI-generated tests
- Multi-model architecture (local Ollama + cloud model switching) shows understanding of cost, privacy, and performance tradeoffs
- V2 vision (Dev + QA platform) addresses a real gap in the market for freelancers and small teams

---

## 🧠 What Makes Zero Code Unique (The 30 Second Pitch)

*"Every QA tool today requires you to write code or write test cases manually. Zero Code is the first platform where you describe what you want tested in plain English, and it shows you exactly what it's doing — step by step, visually — as it does it. No code. No setup. And your whole team can watch it happen live."*

---

## 📝 Session Continuity Instructions

If you're feeding this to a new Claude session, paste this entire document and say:

**"This is the full context of a product called Zero Code that I'm building for my college expo. Continue brainstorming / helping me build from exactly where this document leaves off. Ask me what I need help with next."**

---

*Document generated: February 24, 2026*
*Builder: Final year CS student, Tier 2 college, Solo*
*Expo Date: March 2-3, 2026*
