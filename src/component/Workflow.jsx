import { useState, useCallback } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import TriggerSheet from './TriggerSheet';

// const initialNodes = [
//     { id: 'n1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
//     { id: 'n2', position: { x: 0, y: 100 }, data: { label: 'Node 2' } },

// ];
// const initialEdges = [
//     { id: 'n1-n2', source: 'n1', target: 'n2' },
// ];

export default function Workflow() {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);

    const onNodesChange = useCallback(
        (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
        [],
    );

    const onEdgesChange = useCallback(
        (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
        [],
    );

    const onConnect = useCallback(
        (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
        [],
    );

    const handleAddTrigger = useCallback((trigger) => {
        const newNode = {
            id: trigger.id,
            type: 'default',
            position: {
                x: Math.random() * 300,
                y: nodes.length * 100
            },
            data: {
                label: (
                    <div className="p-2">
                        <div className="font-semibold">{trigger.title}</div>
                        <div className="text-xs text-gray-600 mt-1">
                            {Object.entries(trigger.data).map(([key, value]) => (
                                <div key={key}>{key}: {value}</div>
                            ))}
                        </div>
                    </div>
                )
            },
        };
        setNodes((nds) => [...nds, newNode]);
    }, [nodes.length]);

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <div className="absolute top-4 left-4 z-10 space-x-2">
                <TriggerSheet onAddTrigger={handleAddTrigger} />
                <Button
                    variant="secondary"
                    onClick={() => {
                        setNodes([]);
                        setEdges([]);
                    }}
                >
                    Clear Canvas
                </Button>
            </div>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
            />
        </div>
    );
}