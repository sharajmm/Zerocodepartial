import type { Node, Edge } from '@xyflow/react';

export interface FlowchartNodeData extends Record<string, unknown> {
    label: string;
    type: 'action' | 'assertion' | 'action|assertion' | 'assertion|displayed';
    selector: string | null;
    status?: 'pending' | 'running' | 'passed' | 'failed';
    screenshotPath?: string;
}

export type FlowchartNode = Node<FlowchartNodeData, 'actionNode' | 'assertionNode'>;
export type FlowchartEdge = Edge;

export interface ParseResult {
    nodes?: FlowchartNode[];
    edges?: FlowchartEdge[];
    code?: string;
    error?: string;
    isConversational?: boolean;
}