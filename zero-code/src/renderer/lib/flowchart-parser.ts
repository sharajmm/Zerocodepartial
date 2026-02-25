import type { FlowchartNode, FlowchartEdge, ParseResult } from '../types/flowchart';

export function parseFlowchartResponse(rawText: string): ParseResult {
    let jsonStr = rawText;

    // First attempt: strip markdown fences
    const mdMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/is);
    if (mdMatch) {
        jsonStr = mdMatch[1];
    } else {
        // Fallback: try to locate the outermost {...} natively
        const braceMatch = jsonStr.match(/\{[\s\S]*\}/s);
        if (braceMatch) {
            jsonStr = braceMatch[0];
        } else {
            // No {...} found at all, it's just raw natural language.
            return { isConversational: true };
        }
    }

    try {
        const parsed = JSON.parse(jsonStr.trim());

        // Check if the AI returned a chat_response instead of a test payload
        if (parsed.chat_response) {
            return { isConversational: true };
        }

        if (!parsed.flowchart || !parsed.flowchart.nodes || !parsed.flowchart.edges || !parsed.playwright_code) {
            return { error: 'Missing fundamental nodes/edges or code structure inside JSON!' };
        }

        const rawNodes = parsed.flowchart.nodes as any[];
        const rawEdges = parsed.flowchart.edges as any[];

        const nodes: FlowchartNode[] = rawNodes.map((n) => {
            const isAssertion = n.type && n.type.toLowerCase().includes('assertion');

            return {
                id: String(n.id),
                type: isAssertion ? 'assertionNode' : 'actionNode',
                position: { x: 0, y: 0 }, // Dagre handles layout
                data: {
                    label: n.label,
                    type: n.type,
                    selector: n.selector || null,
                    status: 'pending' // Default initial state
                }
            };
        });

        const edges: FlowchartEdge[] = rawEdges.map((e) => ({
            id: String(e.id),
            source: String(e.source),
            target: String(e.target)
        }));

        return {
            nodes,
            edges,
            code: parsed.playwright_code
        };

    } catch (e: any) {
        return { error: 'Could not parse AI response into valid JSON structure: ' + e.message };
    }
}