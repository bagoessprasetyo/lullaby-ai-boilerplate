"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useImageUpload } from "@/hooks/useImageUpload";
import { cn } from "@/lib/utils";
import { StepProps } from "@/types/story";
import { Camera, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";

export default function CoverImageUpload({ storyData, updateStoryData }: StepProps) {
    const {
      previewUrl,
      fileName,
      fileInputRef,
      handleThumbnailClick,
      handleFileChange,
      handleRemove,
    } = useImageUpload({
      onUpload: (url) => updateStoryData("coverImage", url),
    });
  
    const [isDragging, setIsDragging] = useState(false);
  
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
    };
  
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };
  
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };
  
    const handleDrop = useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
  
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) {
          const fakeEvent = {
              target: {
                  files: [file],
              },
          } as unknown as React.ChangeEvent<HTMLInputElement>;
        //   handleFileChange(fakeEvent);
        }
      },
      [handleFileChange],
    );
  
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Upload a cover image for your story. This will be the first thing readers see.
        </p>
  
        <Input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
  
        {!previewUrl ? (
          <div
            onClick={handleThumbnailClick}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "flex h-64 cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:bg-muted",
              isDragging && "border-primary/50 bg-primary/5",
            )}
          >
            <div className="rounded-full bg-background p-3 shadow-sm">
              <Camera className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Click to select</p>
              <p className="text-xs text-muted-foreground">
                or drag and drop file here
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="group relative h-64 overflow-hidden rounded-lg border">
              <img
                src={previewUrl}
                alt="Story cover preview"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleThumbnailClick}
                  className="h-9 w-9 p-0"
                >
                  <Upload className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleRemove}
                  className="h-9 w-9 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {fileName && (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <span className="truncate">{fileName}</span>
                <button
                  onClick={handleRemove}
                  className="ml-auto rounded-full p-1 hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }