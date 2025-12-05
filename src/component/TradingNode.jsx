import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { CheckCircle, Clock, TrendingUp, TrendingDown, Circle } from 'lucide-react';

const TradingNode = ({ data }) => {
    const isTrigger = data.category === 'trigger';
    const isAction = data.category === 'action';

    const getConditionIcon = (condition) => {
        switch (condition) {
            case 'above':
            case 'crosses_above':
                return <TrendingUp className="w-3 h-3 text-green-600" />;
            case 'below':
            case 'crosses_below':
                return <TrendingDown className="w-3 h-3 text-red-600" />;
            default:
                return <Circle className="w-3 h-3 text-gray-400" />;
        }
    };

    const getStatusBadge = () => {
        if (isTrigger && data.triggered) {
            return (
                <div className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <CheckCircle size={8} />
                    Active
                </div>
            );
        }
        if (isAction && data.lastExecuted) {
            return (
                <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <Clock size={8} />
                    Executed
                </div>
            );
        }
        return null;
    };

    return (
        <div className="relative">
            {getStatusBadge()}

            {isTrigger ? (
                <Handle
                    type="source"
                    position={Position.Right}
                    className="w-3 h-3 bg-green-600 border-2 border-white"
                />
            ) : (
                <>
                    <Handle
                        type="target"
                        position={Position.Left}
                        className="w-3 h-3 bg-blue-600 border-2 border-white"
                    />
                    <Handle
                        type="source"
                        position={Position.Right}
                        className="w-3 h-3 bg-blue-600 border-2 border-white"
                    />
                </>
            )}

            <div className="p-3 border rounded-lg bg-white shadow-sm hover:shadow transition-shadow">
                <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <div className="font-medium text-sm text-gray-900 truncate">
                                {data.label}
                            </div>
                            <div className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${isTrigger
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                                }`}>
                                {isTrigger ? 'TRIGGER' : 'ACTION'}
                            </div>
                        </div>

                        <div className="text-xs text-gray-500 mb-2">
                            {data.description}
                        </div>

                        {/* Trigger Configuration */}
                        {isTrigger && data.config && (
                            <div className="mt-2 pt-2 border-t border-gray-100">
                                <div className="flex items-center gap-1.5 mb-1">
                                    {getConditionIcon(data.config.condition)}
                                    <div className="text-xs font-medium">
                                        {data.config.crypto} {data.config.condition === 'above' ? '>' : '<'} ${data.config.price}
                                    </div>
                                </div>
                                {data.lastPrice !== null && (
                                    <div className="text-xs text-gray-600">
                                        Current: ${data.lastPrice?.toFixed(2) || '--'}
                                        {data.lastPrice !== null && data.config.price && (
                                            <span className={`ml-1 ${data.lastPrice >= data.config.price ? 'text-green-600' : 'text-red-600'}`}>
                                                ({((data.lastPrice - data.config.price) / data.config.price * 100).toFixed(1)}%)
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Action Configuration */}
                        {isAction && data.config && (
                            <div className="mt-2 pt-2 border-t border-gray-100">
                                <div className="grid grid-cols-2 gap-1.5 text-xs">
                                    <div>
                                        <div className="text-gray-500">Exchange</div>
                                        <div className="font-medium">{data.config.exchange}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500">Position</div>
                                        <div className={`font-medium ${data.config.position === 'long' ? 'text-green-600' : 'text-red-600'}`}>
                                            {data.config.position?.toUpperCase()}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500">Amount</div>
                                        <div className="font-medium">${data.config.amount}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500">Leverage</div>
                                        <div className="font-medium">{data.config.leverage || 1}x</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Last execution info */}
                        {data.lastExecuted && (
                            <div className="mt-1 text-[10px] text-gray-400">
                                Last: {new Date(data.lastExecuted).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TradingNode;