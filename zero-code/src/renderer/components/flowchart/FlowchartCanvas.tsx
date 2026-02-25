import { useEffect } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    useNodesState,
    useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useTestStore } from '../../store/testStore';
import ActionNode from './nodes/ActionNode';
import AssertionNode from './nodes/AssertionNode';
import { getLayoutedElements } from '../../lib/dagre-layout';

const nodeTypes = {
    actionNode: ActionNode,
    assertionNode: AssertionNode,
};

export default function FlowchartCanvas() {
    const rawNodes = useTestStore(state => state.nodes);
    const rawEdges = useTestStore(state => state.edges);

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

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

    return (
        <div className="w-full h-full bg-[#0a0a0a]">
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
                </ReactFlow>
            )}
        </div>
    );
}