const fs = require('fs');
const path = require('path');

const files = [
    'src/main/ipc-handlers.ts',
    'src/main/browser-view.ts',
    'src/main/playwright-engine.ts',
    'src/main/report-generator.ts',
    'src/main/ollama-client.ts',
    'src/main/evidence-manager.ts',

    'src/renderer/components/browser/EmbeddedBrowser.tsx',
    'src/renderer/components/browser/ElementPicker.tsx',

    'src/renderer/components/chat/ChatPanel.tsx',
    'src/renderer/components/chat/ChatInput.tsx',
    'src/renderer/components/chat/ChatMessage.tsx',
    'src/renderer/components/chat/StreamingIndicator.tsx',

    'src/renderer/components/flowchart/FlowchartPanel.tsx',
    'src/renderer/components/flowchart/FlowchartCanvas.tsx',
    'src/renderer/components/flowchart/CodeView.tsx',
    'src/renderer/components/flowchart/ViewToggle.tsx',
    'src/renderer/components/flowchart/ProgressBar.tsx',
    'src/renderer/components/flowchart/nodes/ActionNode.tsx',
    'src/renderer/components/flowchart/nodes/AssertionNode.tsx',

    'src/renderer/components/collaboration/CollabProvider.tsx',
    'src/renderer/components/collaboration/InviteModal.tsx',
    'src/renderer/components/collaboration/JoinModal.tsx',
    'src/renderer/components/collaboration/PresenceAvatars.tsx',
    'src/renderer/components/collaboration/RoleGate.tsx',

    'src/renderer/components/settings/SettingsModal.tsx',
    'src/renderer/components/settings/ModelSwitcher.tsx',

    'src/renderer/components/report/ReportActions.tsx',

    'src/renderer/store/index.ts',
    'src/renderer/store/testStore.ts',
    'src/renderer/store/chatStore.ts',
    'src/renderer/store/browserStore.ts',
    'src/renderer/store/settingsStore.ts',
    'src/renderer/store/collabStore.ts',

    'src/renderer/hooks/useIPC.ts',
    'src/renderer/hooks/useDOMScraper.ts',
    'src/renderer/hooks/useTestExecution.ts',
    'src/renderer/hooks/useOllamaStream.ts',
    'src/renderer/hooks/useElementPicker.ts',

    'src/renderer/lib/prompt-builder.ts',
    'src/renderer/lib/flowchart-parser.ts',
    'src/renderer/lib/dom-scrape-script.ts',
    'src/renderer/lib/liveblocks.config.ts',

    'src/renderer/types/ipc.ts',
    'src/renderer/types/flowchart.ts',
    'src/renderer/types/dom.ts',
    'src/renderer/types/test.ts',

    'src/shared/constants.ts',
];

files.forEach(f => {
    const filepath = path.resolve(__dirname, f);
    if (!fs.existsSync(filepath)) {
        fs.mkdirSync(path.dirname(filepath), { recursive: true });
        fs.writeFileSync(filepath, f.endsWith('.tsx') ? "import React from 'react'; export default function Placeholder() { return <></>; }" : 'export {}');
    }
});
