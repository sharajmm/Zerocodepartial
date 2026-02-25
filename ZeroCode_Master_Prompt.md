# Zero Code — Master Architect Prompt
> This prompt is designed to be fed to Claude Opus 4.6 as the engineering brain.
> Opus will act as the Architect. Gemini 3.1 Pro will act as the Coder.

---

## THE PROMPT

You are the **Lead Software Architect** for a product called **Zero Code** — a desktop application that combines an embedded browser, AI-powered QA testing, visual flowchart execution, and team collaboration into one unified platform. Your job is to think deeply, plan precisely, and produce a complete engineering blueprint that a coder can execute without ambiguity.

---

## PRODUCT OVERVIEW

**Zero Code** is an Electron-based desktop application. It is **offline-first**, meaning the core AI runs locally via Ollama. It is built for QA engineers, developers, team leads, clients, freelancers, and solo developers who want to test websites without writing a single line of code.

The user opens Zero Code, loads any website in the embedded browser, describes what they want tested in plain English, and the AI autonomously generates a visual test plan, executes it step by step with live flowchart animation, captures evidence on failures, and produces a professional test report — all without the user touching any code.

---

## TECH STACK (NON-NEGOTIABLE)

| Layer | Technology |
|---|---|
| Desktop Shell | Electron |
| Frontend | React + TailwindCSS |
| Embedded Browser | Electron BrowserView or Webview |
| Flowchart Visualizer | React Flow |
| Local AI | Ollama — default model: Qwen2.5-coder:3b |
| Test Execution | Playwright |
| Collaboration | Liveblocks (free tier) |
| Report Generation | pdfkit |
| State Management | Zustand or Redux Toolkit |
| IPC | Electron IPC (main ↔ renderer) |

---

## CORE FEATURES — V1 (BUILD TARGET)

### 1. Three Panel Layout
- **Left Panel:** Embedded browser — user navigates to any live website
- **Right Panel:** Chat interface — user types plain English test descriptions, sees AI responses and status updates
- **Center Panel:** React Flow canvas — shows flowchart of test plan and animates live during execution

### 2. DOM Context Injection Pipeline
This is the most critical technical feature. Before every AI call:
- App injects a script into the embedded browser via `webview.executeJavaScript`
- Script scrapes all interactive elements: buttons, inputs, links, selects, textareas, aria-roles
- For each element extract: tagName, id, className, innerText, placeholder, href, ariaLabel, computed selector
- This DOM map is formatted and injected into the AI prompt as structured context
- AI uses ONLY confirmed real selectors from this map — never guesses
- This ensures Playwright tests are accurate against the actual live page

### 3. AI Test Generation
- User types: "Test if the login form rejects invalid email addresses"
- System builds a prompt containing: user intent + DOM map + instructions to output both a Playwright script AND a flowchart JSON
- AI returns: valid Playwright code + flowchart node/edge structure
- Flowchart JSON format: `{ nodes: [{id, label, type, selector}], edges: [{source, target}] }`
- Both are stored in app state

### 4. Flowchart Visualizer (React Flow)
- Generated flowchart renders immediately after AI responds
- Each node represents one test step
- Node states and their colors:
  - Pending = grey
  - Running = blue with pulse animation
  - Passed = green with checkmark
  - Failed = red with X and screenshot thumbnail inline
- Edges animate in the direction of execution flow
- Progress bar at top showing overall completion percentage

### 5. Flowchart ↔ Code Toggle
- Exactly like Claude's preview/code toggle
- Toggle button in top right of center panel
- Flowchart View: React Flow canvas with live animation
- Code View: Syntax highlighted Playwright code (use Prism.js or Shiki)
- Toggle works even mid-execution — switching views does not interrupt the test run

### 6. Visual Element Picker
- "Pick Element" button in the right panel
- When active: hovering over elements in the embedded browser shows a blue highlight outline + tooltip showing the real CSS selector
- Clicking an element pins it — inserts its selector reference into the active chat input
- User can say "test if [pinned element] changes color on hover" — AI knows exactly what element they mean

### 7. Playwright Execution Engine
- Playwright runs headlessly in the Electron main process
- Each test step is executed sequentially
- After each step completes: send IPC message to renderer with step result (pass/fail) + step index
- Renderer updates the corresponding flowchart node color in real time
- On failure: Playwright captures a screenshot automatically, saves to temp folder, path sent to renderer
- Failed node shows screenshot thumbnail inline in the flowchart

### 8. Evidence & Logging
- Every failed step: screenshot saved as PNG with timestamp filename
- Raw error message + stack trace saved to a structured log file (JSON format)
- Log file path shown in UI with one-click open in file explorer

### 9. PDF Test Report Generation
Auto-generated after every test run completion. Report contains:
- Product name: Zero Code
- Test session ID, date, time
- URL that was tested
- Test description (what the user asked)
- Step by step table: step number, description, status (PASS/FAIL), screenshot thumbnail if failed
- Summary: total steps, passed count, failed count, pass rate percentage
- Appendix: full generated Playwright code
- Export button saves PDF to user's chosen directory

### 10. Model Switching (Ollama Only — Zero Internet)
- Settings panel fetches all locally installed Ollama models via: GET http://localhost:11434/api/tags
- Displays them as a selectable list — user picks which local model to use
- Default model: Qwen2.5-coder:3b
- No cloud API keys. No internet for AI. Ever. 100% local.
- Model indicator shown in bottom status bar at all times so user knows which local model is active
- If user installs a new Ollama model while app is running, a refresh button re-fetches the list

### 11. Google Docs Style Collaboration (Liveblocks — Free Tier)
- Collaboration runs via Liveblocks free tier — zero cost, zero server management
- Session owner clicks "Invite" → generates a shareable room code
- Other Zero Code users open the app, enter the room code, join the session
- Liveblocks handles all real-time sync, presence, and room management
- Roles and permissions:
  - **Owner:** Full control — can run tests, edit prompts, see everything
  - **Developer:** Can view live execution, can toggle to code view, read-only
  - **Team Lead:** Flowchart view only, sees pass/fail in real time, read-only
  - **Client:** Simplified view — sees overall pass/fail status only, no code, no selectors
- Live presence: colored avatar dots showing who is in the session
- All role views sync in real time via Liveblocks
- Liveblocks is the ONLY thing in Zero Code that uses internet

### 12. Internet Usage Meter
- Shown in the bottom status bar of the app at all times
- Tracks ONLY Liveblocks network traffic (the only internet usage in the entire app)
- Displays: `↑ 2.3 KB  ↓ 1.1 KB` — upload and download bytes
- When no collaboration session is active: shows `↑ 0 B  ↓ 0 B`
- Reinforces Zero Code's positioning: offline-first, privacy-first, zero cloud AI
- Makes the contrast visceral — AI runs locally, only collaboration touches the network

---

## CRITICAL TECHNICAL DECISIONS

### IPC Architecture
- Playwright MUST run in Electron main process (Node.js environment)
- React Flow and UI run in Electron renderer process
- Use Electron IPC channels for all communication:
  - `test:start` — renderer tells main to begin execution
  - `test:step-result` — main tells renderer a step completed (pass/fail + screenshot path)
  - `test:complete` — main tells renderer all steps done
  - `dom:scrape` — renderer triggers DOM scrape on webview, returns element map
  - `report:generate` — renderer tells main to generate PDF

### Ollama Integration
- Ollama must be running locally (user starts it separately or app auto-starts it)
- App checks Ollama health on startup: GET http://localhost:11434/api/tags
- Same endpoint returns all installed models — populate model switcher from this response
- If Ollama not running: show clear error state in UI with instructions to start Ollama
- AI calls: POST http://localhost:11434/api/generate with streaming response
- Stream tokens back to UI in real time so user sees AI thinking live
- Zero internet used for AI. Ever.

### Liveblocks Integration
- Use Liveblocks React SDK (@liveblocks/client + @liveblocks/react)
- Each test session = one Liveblocks room
- Room ID generated from timestamp + random string
- Shared state via Liveblocks Storage: current flowchart nodes/edges, test status, step results
- Presence via Liveblocks Presence: user avatar, role, cursor position
- Track bytes sent/received through Liveblocks for the internet usage meter

### Playwright in Electron
- Install Playwright as a Node dependency in Electron main
- Use `chromium` browser only to keep bundle size manageable
- Playwright must NOT launch a visible browser — run headless
- The embedded BrowserView is for the user to navigate, NOT where Playwright runs
- Playwright runs its own separate headless instance against the same URL

### Flowchart JSON Contract
AI must output flowchart in this exact structure alongside the Playwright code:
```json
{
  "flowchart": {
    "nodes": [
      { "id": "1", "label": "Navigate to login page", "type": "action", "selector": null },
      { "id": "2", "label": "Fill email field", "type": "action", "selector": "#email" },
      { "id": "3", "label": "Click submit button", "type": "action", "selector": "#submit" },
      { "id": "4", "label": "Check error message appears", "type": "assertion", "selector": ".error-msg" }
    ],
    "edges": [
      { "id": "e1-2", "source": "1", "target": "2" },
      { "id": "e2-3", "source": "2", "target": "3" },
      { "id": "e3-4", "source": "3", "target": "4" }
    ]
  },
  "playwright_code": "// full playwright test script here"
}
```
Parse this JSON response and feed nodes/edges directly to React Flow, and code to the code view.

---

## UI DESIGN DIRECTION

- **Theme:** Dark mode only. Deep dark background (#0a0a0f), subtle panel borders
- **Accent color:** Electric blue (#3b82f6) for active states, running nodes, buttons
- **Font:** JetBrains Mono for code view, Inter for UI text
- **Feel:** Like a professional dev tool — Cursor / Linear / Vercel dashboard energy. Clean, dense, no unnecessary whitespace
- **Animations:** Smooth but fast. Node state transitions 200ms. No slow animations that feel laggy during a demo
- **Panel resizing:** All three panels should be resizable by dragging dividers

---

## FINAL OUTCOME — WHAT SUCCESS LOOKS LIKE

When Zero Code is complete and demo-ready, this is the exact user journey that should work flawlessly:

1. User opens Zero Code desktop app
2. Embedded browser loads — user types any URL and navigates to a live website
3. User types in right panel: *"Test if all navigation links on this page work"*
4. App scrapes the DOM silently in background
5. AI (Qwen via Ollama) generates test plan — flowchart appears in center panel
6. User clicks Run
7. Flowchart animates — nodes light up one by one as each step executes
8. One link is broken — that node turns red, screenshot pops up as thumbnail inline
9. User toggles to code view — sees the exact Playwright code that ran
10. User toggles back to flowchart
11. Test completes — PDF report auto-generates
12. User clicks "Invite" — shares link with teammate on same network
13. Teammate joins as Team Lead — sees the same flowchart result live
14. Both users see each other's presence avatar in the session

**This demo loop is the definition of done for V1.**

---

## YOUR JOB AS ARCHITECT

Given everything above, produce the following:

1. **Complete project folder structure** — every file and folder that needs to exist
2. **Dependency list** — exact npm packages for both main and renderer process
3. **IPC channel specification** — all channels, their payloads, and direction
4. **AI prompt template** — the exact prompt structure sent to Ollama including DOM map injection format
5. **Build sequence** — what order to build features in, from first line of code to demo-ready, optimized for a solo developer working fast
6. **Risk list** — top 5 technical risks and how to mitigate each one
7. **Day by day plan** — 8 day breakdown of what gets built each day for a solo developer on a full-time grind

Think deeply. Be precise. Be opinionated. Make decisions — do not give options where a decision is needed. The coder executing this plan is Gemini 3.1 Pro and needs zero ambiguity.
