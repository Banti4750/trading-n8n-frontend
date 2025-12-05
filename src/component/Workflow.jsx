import React, { useState, useCallback, useEffect } from 'react';
import {
    ReactFlow,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    MiniMap,
    Controls,
    Background,
    BackgroundVariant,
    Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import TriggerActionSheet from './TriggerActionSheet';
import TradingNode from './TradingNode';
import { Play, Pause, Save, Upload, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';

// Define node types
const nodeTypes = {
    tradingNode: TradingNode,
};

// Available cryptocurrencies
const CRYPTOCURRENCIES = [
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'BNB', name: 'Binance Coin' },
    { symbol: 'ADA', name: 'Cardano' },
    { symbol: 'XRP', name: 'Ripple' },
    { symbol: 'DOT', name: 'Polkadot' },
    { symbol: 'DOGE', name: 'Dogecoin' },
];

export default function Workflow() {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [prices, setPrices] = useState({});

    // Mock price updates
    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(() => {
            const newPrices = {};
            CRYPTOCURRENCIES.forEach(crypto => {
                const currentPrice = prices[crypto.symbol] || Math.random() * 200;
                const change = (Math.random() - 0.5) * 10;
                newPrices[crypto.symbol] = Math.max(0, currentPrice + change);
            });
            setPrices(newPrices);
            checkTriggers(newPrices);
        }, 3000);

        return () => clearInterval(interval);
    }, [isRunning, prices]);

    const checkTriggers = (currentPrices) => {
        nodes.forEach(node => {
            if (node.data?.category === 'trigger' && node.data?.config?.condition) {
                const { crypto, condition, price } = node.data.config;
                const currentPrice = currentPrices[crypto];

                if (currentPrice !== undefined) {
                    let triggered = false;
                    switch (condition) {
                        case 'above':
                            triggered = currentPrice > price;
                            break;
                        case 'below':
                            triggered = currentPrice < price;
                            break;
                        case 'crosses_above':
                            triggered = (node.data.lastPrice || 0) <= price && currentPrice > price;
                            break;
                        case 'crosses_below':
                            triggered = (node.data.lastPrice || 0) >= price && currentPrice < price;
                            break;
                    }

                    if (triggered) {
                        setNodes(prev => prev.map(n =>
                            n.id === node.id
                                ? {
                                    ...n,
                                    data: { ...n.data, triggered: true, lastTrigger: new Date() },
                                    style: { ...n.style, borderColor: '#10b981', backgroundColor: '#f0fdf4' }
                                }
                                : n
                        ));

                        const connectedEdges = edges.filter(edge => edge.source === node.id);
                        connectedEdges.forEach(edge => {
                            const actionNode = nodes.find(n => n.id === edge.target);
                            if (actionNode) {
                                executeAction(actionNode, currentPrice);
                            }
                        });

                        toast.success(`${crypto} triggered at $${currentPrice.toFixed(2)}`);
                    }

                    setNodes(prev => prev.map(n =>
                        n.id === node.id ? { ...n, data: { ...n.data, lastPrice: currentPrice } } : n
                    ));
                }
            }
        });
    };

    const executeAction = (actionNode, triggerPrice) => {
        const config = actionNode.data?.config;
        if (!config) return;

        toast.info(`Executing: ${actionNode.data.label}`);

        setNodes(prev => prev.map(n =>
            n.id === actionNode.id
                ? {
                    ...n,
                    data: { ...n.data, lastExecuted: new Date(), triggerPrice },
                    style: { ...n.style, borderColor: '#3b82f6', backgroundColor: '#f0f9ff' }
                }
                : n
        ));

        console.log('Executing action:', {
            node: actionNode.data.label,
            config,
            triggerPrice
        });
    };

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );

    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge({
            ...params,
            animated: true,
            style: { stroke: '#3b82f6', strokeWidth: 2 }
        }, eds)),
        []
    );

    const handleAddTrigger = useCallback((trigger) => {
        const newNode = {
            id: trigger.id,
            type: 'tradingNode',
            position: {
                x: 100 + Math.random() * 50,
                y: 100 + nodes.length * 120
            },
            data: {
                label: trigger.title,
                type: 'trigger',
                description: trigger.description,
                config: trigger.data,
                category: 'trigger',
                lastPrice: null,
                triggered: false
            },
            style: {
                border: '2px solid #10b981',
                borderRadius: '8px',
                background: '#f0fdf4',
                padding: '12px',
                width: 280,
            },
            sourcePosition: 'right',
            targetPosition: 'left',
        };
        setNodes((nds) => [...nds, newNode]);
    }, [nodes.length]);

    const handleAddAction = useCallback((action) => {
        const newNode = {
            id: action.id,
            type: 'tradingNode',
            position: {
                x: 450 + Math.random() * 50,
                y: 100 + nodes.length * 120
            },
            data: {
                label: action.title,
                type: 'action',
                description: action.description,
                config: action.data,
                category: 'action',
                lastExecuted: null
            },
            style: {
                border: '2px solid #3b82f6',
                borderRadius: '8px',
                background: '#f0f9ff',
                padding: '12px',
                width: 280,
            },
            sourcePosition: 'right',
            targetPosition: 'left',
        };
        setNodes((nds) => [...nds, newNode]);
    }, [nodes.length]);

    const handleClearCanvas = () => {
        setNodes([]);
        setEdges([]);
        setIsRunning(false);
        toast.info('Canvas cleared');
    };

    const handleSaveWorkflow = () => {
        const workflow = { nodes, edges };
        const dataStr = JSON.stringify(workflow, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = 'trading-workflow.json';
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        toast.success('Workflow saved');
    };

    const handleLoadWorkflow = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const workflow = JSON.parse(e.target.result);
                setNodes(workflow.nodes || []);
                setEdges(workflow.edges || []);
                toast.success('Workflow loaded');
            } catch (error) {
                toast.error('Error loading workflow');
            }
        };
        reader.readAsText(file);
    };

    const triggerCount = nodes.filter(n => n.data?.category === 'trigger').length;
    const actionCount = nodes.filter(n => n.data?.category === 'action').length;

    return (
        <div className="w-full h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Trading Workflow</h1>
                    <p className="text-sm text-gray-500">Design automated trading strategies</p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Status Indicators */}
                    <div className="flex items-center gap-4 mr-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-600"></div>
                            <span className="text-xs font-medium text-gray-600">Triggers</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                            <span className="text-xs font-medium text-gray-600">Actions</span>
                        </div>
                    </div>

                    {/* Control Buttons */}
                    <Button
                        variant={isRunning ? "destructive" : "default"}
                        onClick={() => setIsRunning(!isRunning)}
                        size="sm"
                        className="gap-2"
                    >
                        {isRunning ? <Pause size={14} /> : <Play size={14} />}
                        {isRunning ? 'Stop' : 'Start'}
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handleSaveWorkflow}
                        size="sm"
                        className="gap-2"
                    >
                        <Save size={14} />
                        Save
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => document.getElementById('workflow-upload').click()}
                        size="sm"
                        className="gap-2"
                    >
                        <Upload size={14} />
                        Load
                    </Button>
                    <input
                        id="workflow-upload"
                        type="file"
                        accept=".json"
                        onChange={handleLoadWorkflow}
                        className="hidden"
                    />

                    <TriggerActionSheet
                        onAdd={handleAddTrigger}
                        type="trigger"
                        cryptocurrencies={CRYPTOCURRENCIES}
                    />
                    <TriggerActionSheet
                        onAdd={handleAddAction}
                        type="action"
                    />

                    <Button
                        variant="outline"
                        onClick={handleClearCanvas}
                        disabled={nodes.length === 0}
                        size="sm"
                        className="gap-2"
                    >
                        <Trash2 size={14} />
                        Clear
                    </Button>
                </div>
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                    connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 2 }}
                >
                    <Background variant={BackgroundVariant.Dots} gap={24} size={2} />
                    <Controls className="bg-white border rounded-lg shadow-sm" />
                    <MiniMap
                        nodeColor={(node) => {
                            if (node.data?.category === 'trigger') return '#10b981';
                            if (node.data?.category === 'action') return '#3b82f6';
                            return '#9ca3af';
                        }}
                        maskColor="rgba(255, 255, 255, 0.7)"
                        className="bg-white border rounded-lg shadow-sm"
                    />

                    {/* Stats Panel */}
                    <Panel position="top-right" className="bg-white border rounded-lg shadow-sm p-4">
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-gray-700">Workflow Stats</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <div className="text-2xl font-bold text-green-700">{triggerCount}</div>
                                    <div className="text-xs text-gray-500">Triggers</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-2xl font-bold text-blue-700">{actionCount}</div>
                                    <div className="text-xs text-gray-500">Actions</div>
                                </div>
                            </div>
                            <div className="pt-2 border-t">
                                <div className="text-xs font-medium text-gray-600 mb-1">Status</div>
                                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs ${isRunning
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                    {isRunning ? 'Running' : 'Stopped'}
                                </div>
                            </div>
                        </div>
                    </Panel>
                </ReactFlow>
            </div>

            {/* Footer */}
            <div className="border-t bg-white px-4 py-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
                            <span>Trigger nodes</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                            <span>Action nodes</span>
                        </div>
                    </div>
                    <div>
                        {nodes.length} nodes • {edges.length} connections
                    </div>
                </div>
            </div>
        </div>
    );
}