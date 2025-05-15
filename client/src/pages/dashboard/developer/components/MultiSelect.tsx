import { useState, useRef, useEffect } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MultiSelectProps {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  allowCustom?: boolean;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options",
  allowCustom = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on input value
  const filteredOptions = options.filter((option) => {
    const matchesSearch = option.label.toLowerCase().includes(inputValue.toLowerCase());
    const isNotSelected = !selected.includes(option.value);
    return matchesSearch && isNotSelected;
  });

  // Close the popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Add a custom option
  const handleAddCustomOption = () => {
    if (inputValue && !selected.includes(inputValue) && !options.some(option => option.value === inputValue)) {
      onChange([...selected, inputValue]);
      setInputValue("");
    }
  };

  // Handle select item
  const handleSelect = (value: string) => {
    onChange([...selected, value]);
    setInputValue("");
  };

  // Handle remove item
  const handleRemove = (value: string) => {
    onChange(selected.filter((item) => item !== value));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selected.length > 0
            ? `${selected.length} selected`
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command ref={inputRef}>
          <CommandInput
            placeholder="Search options..."
            value={inputValue}
            onValueChange={setInputValue}
          />
          {filteredOptions.length === 0 && (
            <CommandEmpty>
              {allowCustom && inputValue ? (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleAddCustomOption}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add "{inputValue}"
                </Button>
              ) : (
                "No options found."
              )}
            </CommandEmpty>
          )}
          <CommandGroup>
            {filteredOptions.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => handleSelect(option.value)}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    selected.includes(option.value) ? "opacity-100" : "opacity-0"
                  }`}
                />
                {option.label}
              </CommandItem>
            ))}
            {allowCustom && inputValue && !options.some(option => option.label.toLowerCase() === inputValue.toLowerCase()) && (
              <CommandItem
                value={inputValue}
                onSelect={handleAddCustomOption}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add "{inputValue}"
              </CommandItem>
            )}
          </CommandGroup>
        </Command>
        
        {selected.length > 0 && (
          <div className="p-2 flex flex-wrap gap-1 border-t">
            {selected.map((value) => {
              const option = options.find((option) => option.value === value);
              const label = option ? option.label : value;
              
              return (
                <Badge key={value} className="flex items-center gap-1">
                  {label}
                  <button
                    className="rounded-full outline-none focus:ring-2 focus:ring-ring"
                    onClick={() => handleRemove(value)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}