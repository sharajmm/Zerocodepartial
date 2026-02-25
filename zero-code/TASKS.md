# Zero Code Project Tasks

## Phase 1: Skeleton + Shell + 3-Panel Layout
- [x] Initialized Vite + React + TypeScript + TailwindCSS project
- [x] Configured Vite to run Electron main and preload scripts
- [x] Fixed main entry point mismatch (`dist-electron/index.js`)
- [x] Set up standard folders: `main`, `renderer`, `components`, `store`, `lib`
- [x] Implemented React routing / base structure in `App.tsx`
- [x] Configured Tailwind CSS v4 styling with new `@theme` API setup
- [x] Built `ThreePanelLayout` component with resizable sections using `allotment`
- [x] Implemented `TopBar` component for Electron app dragging & Window controls
- [x] Implemented `StatusBar` for Ollama tracking and Liveblocks usage
- [x] Scaffolding all component files for future phases

## Phase 2: Embedded Browser + DOM Scraping + Element Picker
- [x] Implement `browser-view.ts` natively in Electron Main
- [x] Build `EmbeddedBrowser.tsx` URL bar with navigate button, back/forward, reload
- [x] Wire `browser:navigate` and `browser:get-url` IPC
- [x] Implement `dom-scrape-script.ts` and `dom:scrape` IPC handler
- [x] Build `ElementPicker.tsx` overlay
- [x] Wire `picker:start`, `picker:stop`, and `picker:element-selected` over IPC

## Phase 3: Ollama Integration + Chat UI + AI Streaming
- [x] Build `ollama-client.ts` in Main process
- [x] Wire AI generation IPC endpoints
- [x] Build `ChatPanel` and `ChatMessage` UI
- [x] Implement `prompt-builder.ts` combining structured prompt, DOM Map Context, and Chat 
- [x] Implement UI streaming updates using Zustand
- [x] Fix NDJSON stream chopping with string buffer parsing
- [x] Upgrade to `/api/chat` for full conversational memory tracking
- [x] Add live `Context Used` progress bar UI with visual token calculation
- [x] Dynamically scale Token Limits based on user's active local model size
- [x] Add clear chat context handlers (Trash UI & Memory Reset Button)

## Phase 4: React Flow Flowchart + Code Toggle
- [x] Build `flowchart-parser.ts` JSON parser from text
- [x] Build Dagre-based `FlowchartCanvas` UI
- [x] Implement nodes (`ActionNode`, `AssertionNode`)
- [x] Build CodeView Syntax Highlighter (Prism.js)
- [x] Build `ViewToggle` button for Flowchart ↔ Code switching
- [x] Optimize DOM scraping size with visibility and semantic validation
- [x] Set intelligent fallback defaults (qwen2.5-coder:7b / 0.1 Temperature)

## Phase 5: Playwright Execution Engine
- [x] Implement headless `playwright-engine.ts` in node (Spawn approach to avoid `eval()`)
- [x] Connect IPC `test:start`, `test:step-result`, `test:complete`, `test:abort`
- [x] Update Node State animations dynamically (blue running, green check, red X)
- [x] Render Screenshots on UI for Failed tests

## Phase 6: PDF Reports + Evidence Logging
- [x] Build `report-generator.ts` with PDFKit
- [x] Wire `report:generate` and `report:export` IPC handlers
- [x] Auto-generate test report on completion 
- [x] Build `ReportActions` UI inside chat
- [x] Establish screenshot mapping + saving
- [x] Save raw session JSON evidence in Evidence Manager

## Phase 7: Live Collaboration
- [x] Initialize `Liveblocks` endpoints
- [x] Connect multi-user Presence dots
- [x] Track WS bandwidth inside metric Status Bar

## Phase 8: Final Polish
- [x] Add loading skeletons
- [x] Handle AI parse errors natively
- [x] Implement persistent localized Chat History serialization and reloading
