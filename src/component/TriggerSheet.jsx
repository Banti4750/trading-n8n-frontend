
import React, { useState, useCallback } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
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
import { SelectGroup, SelectLabel } from '@radix-ui/react-select';

const SUPPORTED_TRIGGERS = [
    {
        id: "timer",
        title: "Timer",
        description: "Run this trigger on every x seconds.",
        fields: [
            { name: "interval", label: "Interval (seconds)", type: "number", placeholder: "60" }
        ]
    },
    {
        id: "price-trigger",
        title: "Price Trigger",
        description: "Runs whenever the price goes above or below a certain number for an asset.",
        fields: [
            { name: "asset", label: "Asset", type: "text", placeholder: "BTC/USD" },
            { name: "condition", label: "Condition", type: "select", options: ["Above", "Below"] },
            { name: "price", label: "Price", type: "number", placeholder: "50000" }
        ]
    }
];

const TriggerSheet = ({ onAddTrigger }) => {
    const [selectedTrigger, setSelectedTrigger] = useState("");
    const [formData, setFormData] = useState({});
    const [isOpen, setIsOpen] = useState(false);

    const handleTriggerChange = (triggerId) => {
        setSelectedTrigger(triggerId);
        setFormData({});
    };

    const handleInputChange = (fieldName, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    const handleSave = () => {
        if (selectedTrigger) {
            const trigger = SUPPORTED_TRIGGERS.find(t => t.id === selectedTrigger);
            onAddTrigger({
                id: `${selectedTrigger}-${Date.now()}`,
                type: selectedTrigger,
                title: trigger.title,
                data: formData
            });
            setSelectedTrigger("");
            setFormData({});
            setIsOpen(false);
        }
    };

    const selectedTriggerData = SUPPORTED_TRIGGERS.find(t => t.id === selectedTrigger);

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline">Add Trigger</Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader className="space-y-3">
                    <SheetTitle className="text-xl font-semibold">Select Trigger</SheetTitle>
                    <SheetDescription className="text-sm text-muted-foreground">
                        Choose a trigger type and configure its settings.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col gap-6 py-6">
                    <div className="space-y-3">
                        <Label htmlFor="trigger-type" className="text-sm font-medium">Trigger Type</Label>
                        <Select value={selectedTrigger} onValueChange={handleTriggerChange}>
                            <SelectTrigger id="trigger-type" className="w-full">
                                <SelectValue placeholder="Select a trigger" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel className="px-2 py-1.5 text-xs font-semibold">Available Triggers</SelectLabel>
                                    {SUPPORTED_TRIGGERS.map(({ id, title, description }) => (
                                        <SelectItem key={id} value={id} className="cursor-pointer">
                                            <div className="py-1">
                                                <div className="font-medium text-sm">{title}</div>
                                                <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedTriggerData && (
                        <div className="space-y-4 pt-2 border-t">
                            <h4 className="text-sm font-medium text-foreground">Configuration</h4>
                            {selectedTriggerData.fields.map((field) => (
                                <div key={field.name} className="space-y-2">
                                    <Label htmlFor={field.name} className="text-sm font-medium">
                                        {field.label}
                                    </Label>
                                    {field.type === "select" ? (
                                        <Select
                                            value={formData[field.name] || ""}
                                            onValueChange={(value) => handleInputChange(field.name, value)}
                                        >
                                            <SelectTrigger id={field.name} className="w-full">
                                                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {field.options.map((option) => (
                                                    <SelectItem key={option} value={option.toLowerCase()}>
                                                        {option}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Input
                                            id={field.name}
                                            type={field.type}
                                            placeholder={field.placeholder}
                                            value={formData[field.name] || ""}
                                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                                            className="w-full"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <SheetFooter className="gap-2 sm:gap-0">
                    <SheetClose asChild>
                        <Button variant="outline" className="flex-1 sm:flex-none">Cancel</Button>
                    </SheetClose>
                    <Button onClick={handleSave} disabled={!selectedTrigger} className="flex-1 sm:flex-none">
                        Add Trigger
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default TriggerSheet;