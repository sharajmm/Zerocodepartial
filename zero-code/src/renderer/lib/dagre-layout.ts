import dagre from 'dagre';
import type { FlowchartNode, FlowchartEdge } from '../types/flowchart';

export function getLayoutedElements(nodes: FlowchartNode[], edges: FlowchartEdge[], direction = 'TB') {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    // Width 200, height 60
    const nodeWidth = 200;
    const nodeHeight = 60;

    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);

        // Offset for centering React Flow nodes
        node.targetPosition = direction === 'TB' ? 'top' : 'left' as any;
        node.sourcePosition = direction === 'TB' ? 'bottom' : 'right' as any;

        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };
    });

    return { nodes, edges };
}
