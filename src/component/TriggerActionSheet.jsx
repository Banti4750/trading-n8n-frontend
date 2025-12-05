import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Plus } from 'lucide-react';

const CRYPTO_TRIGGERS = [
    {
        id: "price_threshold",
        title: "Price Threshold",
        description: "Trigger when price crosses threshold",
    },
    {
        id: "price_change",
        title: "Price Change",
        description: "Trigger on percentage price change",
    },
    {
        id: "rsi_signal",
        title: "RSI Signal",
        description: "Trigger on RSI conditions",
    },
    {
        id: "volume_spike",
        title: "Volume Spike",
        description: "Trigger on volume activity",
    }
];

const TRADING_ACTIONS = [
    {
        id: "long_position",
        title: "Open Long",
        description: "Buy/Long position",
    },
    {
        id: "short_position",
        title: "Open Short",
        description: "Sell/Short position",
    },
    {
        id: "close_position",
        title: "Close Position",
        description: "Close existing position",
    },
    {
        id: "place_order",
        title: "Limit Order",
        description: "Place limit order",
    },
    {
        id: "stop_loss",
        title: "Stop Loss",
        description: "Set stop loss",
    },
    {
        id: "take_profit",
        title: "Take Profit",
        description: "Set take profit",
    }
];

const EXCHANGES = [
    { id: "binance", name: "Binance" },
    { id: "bybit", name: "Bybit" },
    { id: "okx", name: "OKX" },
    { id: "kucoin", name: "KuCoin" },
];

export default function TriggerActionSheet({ onAdd, type = "trigger", cryptocurrencies = [] }) {
    const [selectedItem, setSelectedItem] = useState("");
    const [formData, setFormData] = useState({});
    const [isOpen, setIsOpen] = useState(false);

    const items = type === "trigger" ? CRYPTO_TRIGGERS : TRADING_ACTIONS;
    const label = type === "trigger" ? "Trigger" : "Action";

    const handleItemChange = (itemId) => {
        setSelectedItem(itemId);
        const item = items.find(i => i.id === itemId);

        const defaults = {
            name: `${item?.title} ${Date.now().toString().slice(-4)}`,
            amount: 100,
            leverage: 10,
            position: 'long'
        };

        if (type === 'trigger') {
            defaults.crypto = cryptocurrencies[0]?.symbol || 'SOL';
            defaults.price = 100;
            defaults.condition = 'above';
        } else {
            defaults.exchange = 'binance';
            defaults.symbol = 'SOLUSDT';
        }

        setFormData(defaults);
    };

    const handleSave = () => {
        if (selectedItem) {
            const item = items.find(i => i.id === selectedItem);
            onAdd({
                id: `${selectedItem}-${Date.now()}`,
                type: selectedItem,
                title: formData.name || item.title,
                description: item.description,
                category: type,
                data: formData
            });
            setSelectedItem("");
            setFormData({});
            setIsOpen(false);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Plus size={14} />
                    Add {label}
                </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-lg font-medium">Add {label}</SheetTitle>
                    <SheetDescription className="text-sm text-gray-500">
                        Configure trading {type.toLowerCase()} parameters
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6">
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">{label} Type</Label>
                        <Select value={selectedItem} onValueChange={handleItemChange}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={`Select ${type.toLowerCase()}`} />
                            </SelectTrigger>
                            <SelectContent>
                                {items.map(({ id, title, description }) => (
                                    <SelectItem key={id} value={id}>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{title}</span>
                                            <span className="text-xs text-gray-500">{description}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedItem && (
                        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Node Name</Label>
                                <Input
                                    placeholder="Enter node name"
                                    value={formData.name || ""}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="text-sm"
                                />
                            </div>

                            {/* Trigger Specific Fields */}
                            {type === 'trigger' && (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Asset</Label>
                                            <Select
                                                value={formData.crypto}
                                                onValueChange={(value) => setFormData({ ...formData, crypto: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select asset" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {cryptocurrencies.map((crypto) => (
                                                        <SelectItem key={crypto.symbol} value={crypto.symbol}>
                                                            {crypto.symbol} - {crypto.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Condition</Label>
                                            <Select
                                                value={formData.condition}
                                                onValueChange={(value) => setFormData({ ...formData, condition: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select condition" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="above">Above</SelectItem>
                                                    <SelectItem value="below">Below</SelectItem>
                                                    <SelectItem value="crosses_above">Crosses above</SelectItem>
                                                    <SelectItem value="crosses_below">Crosses below</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <Label className="text-sm font-medium">
                                                Target Price: ${formData.price || 0}
                                            </Label>
                                            <span className="text-xs text-gray-500">
                                                Current: ~${(Math.random() * 200).toFixed(2)}
                                            </span>
                                        </div>
                                        <Slider
                                            min={1}
                                            max={500}
                                            step={1}
                                            value={[formData.price || 100]}
                                            onValueChange={(value) => setFormData({ ...formData, price: value[0] })}
                                            className="py-2"
                                        />
                                    </div>
                                </>
                            )}

                            {/* Action Specific Fields */}
                            {type === 'action' && (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Exchange</Label>
                                            <Select
                                                value={formData.exchange}
                                                onValueChange={(value) => setFormData({ ...formData, exchange: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select exchange" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {EXCHANGES.map((exchange) => (
                                                        <SelectItem key={exchange.id} value={exchange.id}>
                                                            {exchange.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Trading Pair</Label>
                                            <Input
                                                placeholder="SOLUSDT"
                                                value={formData.symbol || ""}
                                                onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                                                className="text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Position</Label>
                                            <Select
                                                value={formData.position}
                                                onValueChange={(value) => setFormData({ ...formData, position: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select position" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="long">Long</SelectItem>
                                                    <SelectItem value="short">Short</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">
                                                Leverage: {formData.leverage || 10}x
                                            </Label>
                                            <Slider
                                                min={1}
                                                max={125}
                                                step={1}
                                                value={[formData.leverage || 10]}
                                                onValueChange={(value) => setFormData({ ...formData, leverage: value[0] })}
                                                className="py-2"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Amount (USD)</Label>
                                        <Input
                                            type="number"
                                            placeholder="100"
                                            value={formData.amount || ""}
                                            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                                            className="text-sm"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-4 border-t">
                    <Button
                        onClick={handleSave}
                        disabled={!selectedItem}
                        className="w-full"
                    >
                        Add {label} to Workflow
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}