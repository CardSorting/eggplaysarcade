import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, GripVertical } from "lucide-react";

interface FeatureListProps {
  features: string[];
  onChange: (features: string[]) => void;
}

export function FeatureList({ features, onChange }: FeatureListProps) {
  const [newFeature, setNewFeature] = useState("");
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Add a new feature
  const handleAddFeature = () => {
    if (newFeature.trim() === "") return;
    onChange([...features, newFeature.trim()]);
    setNewFeature("");
  };

  // Remove a feature
  const handleRemoveFeature = (index: number) => {
    const newFeatures = [...features];
    newFeatures.splice(index, 1);
    onChange(newFeatures);
  };

  // Handle key press (Enter to add)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddFeature();
    }
  };

  // Drag and drop functionality
  const handleDragStart = (index: number) => {
    setDraggingIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (draggingIndex !== null && dragOverIndex !== null) {
      const newFeatures = [...features];
      const [removed] = newFeatures.splice(draggingIndex, 1);
      newFeatures.splice(dragOverIndex, 0, removed);
      
      onChange(newFeatures);
      setDraggingIndex(null);
      setDragOverIndex(null);
    }
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="Add a feature..."
          value={newFeature}
          onChange={(e) => setNewFeature(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <Button type="button" onClick={handleAddFeature}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ul 
        className="space-y-2"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {features.map((feature, index) => (
          <li
            key={index}
            className={`flex items-center gap-2 p-2 rounded-md border ${
              dragOverIndex === index ? "border-primary bg-primary/5" : ""
            }`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
          >
            <div
              className="cursor-grab p-1 hover:text-primary"
              onMouseDown={(e) => e.preventDefault()}
            >
              <GripVertical className="h-4 w-4" />
            </div>
            <span className="flex-1">{feature}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleRemoveFeature(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>

      {features.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No features added yet. Add some key features of your game.
        </p>
      )}
    </div>
  );
}