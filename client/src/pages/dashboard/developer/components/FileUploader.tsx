import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, FileIcon, ImageIcon } from "lucide-react";

interface FileUploaderProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
  previewType?: "square" | "wide" | "file";
  icon?: React.ReactNode;
}

export function FileUploader({
  file,
  onFileSelect,
  accept = "*",
  maxSize = 5 * 1024 * 1024, // Default 5MB
  previewType = "file",
  icon
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    else return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  };

  // Handle file selection
  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) return;
    
    // Check file size
    if (selectedFile.size > maxSize) {
      setError(`File size exceeds ${formatFileSize(maxSize)}`);
      return;
    }
    
    // Clear any previous errors
    setError(null);
    
    // Call the callback
    onFileSelect(selectedFile);
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Handle file input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // Handle file removal
  const handleRemove = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onFileSelect(null as any);
    setError(null);
  };

  // Determine if the file is an image
  const isImage = file && file.type.startsWith("image/");

  // Render file preview
  const renderPreview = () => {
    if (!file) return null;
    
    if (previewType === "square" && isImage) {
      return (
        <div className="relative h-32 w-32 rounded-md overflow-hidden">
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      );
    } else if (previewType === "wide" && isImage) {
      return (
        <div className="relative h-32 w-full rounded-md overflow-hidden">
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 p-2 border rounded-md">
          {isImage ? (
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
          ) : (
            <FileIcon className="h-5 w-5 text-muted-foreground" />
          )}
          <div className="flex-1 truncate">
            <p className="text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }
  };

  // Determine uploader class based on previewType
  const uploaderClass = () => {
    if (previewType === "square") {
      return "h-32 w-32";
    } else if (previewType === "wide") {
      return "h-32 w-full";
    } else {
      return "w-full";
    }
  };

  return (
    <div className="space-y-2">
      {file ? (
        renderPreview()
      ) : (
        <div
          className={`flex flex-col items-center justify-center border-2 ${
            dragActive ? "border-primary" : "border-dashed"
          } rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 ${uploaderClass()}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center p-4">
            {icon || <Upload className="h-8 w-8 mb-2 text-muted-foreground" />}
            <p className="text-sm font-medium">Click or drag to upload</p>
            <p className="text-xs text-muted-foreground mt-1">
              Maximum file size: {formatFileSize(maxSize)}
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleChange}
          />
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}