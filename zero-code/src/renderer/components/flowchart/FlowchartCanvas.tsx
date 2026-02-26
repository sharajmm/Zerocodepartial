import { useEffect, useCallback } from 'react';
import {
    ReactFlow,
    ReactFlowProvider,
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    useReactFlow,
    getNodesBounds,
    getViewportForBounds,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toPng } from 'html-to-image';
import { Download } from 'lucide-react';

import { useTestStore } from '../../store/testStore';
import ActionNode from './nodes/ActionNode';
import AssertionNode from './nodes/AssertionNode';
import { getLayoutedElements } from '../../lib/dagre-layout';

const nodeTypes = {
    actionNode: ActionNode,
    assertionNode: AssertionNode,
};

function FlowchartCanvasInner() {
    const rawNodes = useTestStore(state => state.nodes);
    const rawEdges = useTestStore(state => state.edges);

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { getNodes } = useReactFlow();

    useEffect(() => {
        if (rawNodes.length > 0) {
            // Apply dagre layouting
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(rawNodes, rawEdges);

            // @ts-ignore
            setNodes(layoutedNodes);
            // @ts-ignore
            setEdges(layoutedEdges);
        } else {
            setNodes([]);
            setEdges([]);
        }
    }, [rawNodes, rawEdges, setNodes, setEdges]);

    const onDownload = useCallback(() => {
        const nodesBounds = getNodesBounds(getNodes());
        const transform = getViewportForBounds(
            nodesBounds,
            nodesBounds.width,
            nodesBounds.height,
            0.5,
            2,
            0 // padding
        );

        const viewportElement = document.querySelector('.react-flow__viewport') as HTMLElement;
        if (!viewportElement) return;

        toPng(viewportElement, {
            backgroundColor: '#0a0a0a',
            width: nodesBounds.width,
            height: nodesBounds.height,
            style: {
                width: `${nodesBounds.width}px`,
                height: `${nodesBounds.height}px`,
                transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
            },
        }).then((dataUrl) => {
            const link = document.createElement('a');
            link.download = 'zerocode-flowchart.png';
            link.href = dataUrl;
            link.click();
        }).catch(err => {
            console.error('Failed to download flowchart image', err);
        });
    }, [getNodes]);

    return (
        <div className="w-full h-full bg-[#0a0a0a] relative">
            {nodes.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 font-medium">
                    <p className="mb-2">No flowchart generated yet.</p>
                    <p className="text-sm">Describe a test in the chat panel to begin.</p>
                </div>
            ) : (
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                    minZoom={0.1}
                    maxZoom={2}
                    colorMode="dark"
                    proOptions={{ hideAttribution: true }}
                >
                    <Background color="#333" gap={16} />
                    <Controls showInteractive={false} />
                    <button
                        onClick={onDownload}
                        className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md border border-gray-700 shadow-sm transition-colors text-sm font-medium"
                        title="Download as PNG"
                    >
                        <Download size={14} />
                        Export PNG
                    </button>
                </ReactFlow>
            )}
        </div>
    );
}

export default function FlowchartCanvas() {
    return (
        <ReactFlowProvider>
            <FlowchartCanvasInner />
        </ReactFlowProvider>
    );
}