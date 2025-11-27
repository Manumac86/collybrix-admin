"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const TAG_COLORS = [
  { name: "Red", hex: "#EF4444" },
  { name: "Orange", hex: "#F59E0B" },
  { name: "Yellow", hex: "#EAB308" },
  { name: "Green", hex: "#10B981" },
  { name: "Teal", hex: "#14B8A6" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Indigo", hex: "#6366F1" },
  { name: "Purple", hex: "#8B5CF6" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Gray", hex: "#6B7280" },
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(value || "#3B82F6");
  const [open, setOpen] = useState(false);

  const handlePresetClick = (color: string) => {
    onChange(color);
    setCustomColor(color);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    onChange(color);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start gap-2", className)}
          aria-label="Pick a color"
        >
          <div
            className="h-4 w-4 rounded border"
            style={{ backgroundColor: value || "#3B82F6" }}
          />
          <span className="flex-1 text-left">{value || "Select color"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Preset Colors
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {TAG_COLORS.map((color) => (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => handlePresetClick(color.hex)}
                  className={cn(
                    "h-10 w-10 rounded border-2 transition-all hover:scale-110",
                    value === color.hex
                      ? "border-foreground ring-2 ring-offset-2 ring-foreground"
                      : "border-border"
                  )}
                  style={{ backgroundColor: color.hex }}
                  aria-label={`Select ${color.name}`}
                  title={color.name}
                >
                  {value === color.hex && (
                    <Check className="h-4 w-4 text-white mx-auto drop-shadow" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-color" className="text-sm font-medium">
              Custom Color
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="custom-color"
                  type="text"
                  value={customColor}
                  onChange={handleCustomColorChange}
                  placeholder="#3B82F6"
                  className="pr-10"
                />
                <div
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded border"
                  style={{ backgroundColor: customColor }}
                />
              </div>
              <input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="h-10 w-10 rounded border cursor-pointer"
                aria-label="Color picker"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
