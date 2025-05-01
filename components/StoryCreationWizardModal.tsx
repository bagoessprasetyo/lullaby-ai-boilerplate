"use client";

import * as React from "react";
import { useCallback, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowRight,
  BookOpen,
  Camera,
  Compass,
  Moon,
  Play,
  Plus,
  Rocket,
  Search,
  Trash2,
  Upload,
  Wand2,
  X,
} from "lucide-react";

// --- Interfaces ---

interface StoryCharacter {
  name: string;
  description: string;
}

interface StoryData {
  coverImages: File[];
  theme: string;
  characters: StoryCharacter[];
  language: string;
  voice: string;
}

interface StepProps {
  storyData: StoryData;
  updateStoryData: (key: keyof StoryData | string, value: any) => void;
  setStoryData: React.Dispatch<React.SetStateAction<StoryData>>;
}

// Define static data outside component to avoid re-creation on render
const languages = [
  { value: "en", label: "English" },
  { value: "id", label: "Indonesian" },
];

const voices = [
  { value: "gentle-male", label: "Gentle Male", description: "A soft and soothing male voice." },
  { value: "warm-female", label: "Warm Female", description: "A kind and comforting female voice." },
  { value: "playful-child", label: "Playful Child", description: "An energetic and cheerful child's voice." },
  { value: "calm-neutral", label: "Calm Neutral", description: "A steady and relaxing neutral voice." },
];

// --- Step Components ---

// Step 1: Upload & Theme
function Step1UploadTheme({ storyData, setStoryData }: StepProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const MAX_FILES = 5;

  // Initialize previews from existing files on mount
  React.useEffect(() => {
    const initialPreviews = storyData.coverImages.map(file => URL.createObjectURL(file));
    setPreviews(initialPreviews);
    // Cleanup function for initial previews
    return () => {
      initialPreviews.forEach(URL.revokeObjectURL);
    };
  }, []); // Run only once on mount

  const updatePreviewsAndFiles = (files: FileList | null) => {
    if (!files) return;

    const currentFiles = storyData.coverImages;
    const newFilesToAdd: File[] = [];
    const newPreviewsToAdd: string[] = [];

    for (let i = 0; i < files.length; i++) {
      if (currentFiles.length + newFilesToAdd.length >= MAX_FILES) break;
      const file = files[i];
      if (file.type.startsWith("image/")) {
        newFilesToAdd.push(file);
        newPreviewsToAdd.push(URL.createObjectURL(file));
      }
    }

    if (newFilesToAdd.length > 0) {
      const updatedFiles = [...currentFiles, ...newFilesToAdd];
      const updatedPreviews = [...previews, ...newPreviewsToAdd];

      setStoryData((prev) => ({ ...prev, coverImages: updatedFiles }));
      setPreviews(updatedPreviews);
    }

    // Return cleanup function for the newly added previews
    return () => {
      newPreviewsToAdd.forEach(URL.revokeObjectURL);
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePreviewsAndFiles(e.target.files);
    // Reset file input to allow selecting the same file again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = (index: number) => {
    // Create new arrays by filtering
    const newPreviews = previews.filter((_, i) => i !== index);
    const newFiles = storyData.coverImages.filter((_, i) => i !== index);

    // Revoke the URL of the removed preview
    URL.revokeObjectURL(previews[index]);

    setPreviews(newPreviews);
    setStoryData((prev) => ({ ...prev, coverImages: newFiles }));
  };

  const handleThumbnailClick = () => {
    if (storyData.coverImages.length < MAX_FILES) {
      fileInputRef.current?.click();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); if (storyData.coverImages.length < MAX_FILES) setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (storyData.coverImages.length < MAX_FILES) {
        updatePreviewsAndFiles(e.dataTransfer.files);
      }
    },
    [setStoryData, storyData.coverImages, previews],
  );

  // fetch voices from API
  const fetchVoices = async () => {
    try {
      const response = await fetch("/api/voices");
      if (!response.ok) {
        throw new Error("Failed to fetch voices");
      }
      const data = await response.json();
      return data.voices;
    } catch (error) {
      console.error("Error fetching voices:", error);
      return [];
    }
  }

  // --- Render ---
  const [voicesData, setVoicesData] = useState<{ value: string; label: string; description: string }[]>([]);
  React.useEffect(() => {
    const fetchVoicesData = async () => {
      const data = await fetchVoices();
      setVoicesData(data);
    };
    fetchVoicesData();
  }, []);

  const themes = [
    { value: "adventure", label: "Adventure", icon: Compass },
    { value: "fantasy", label: "Fantasy", icon: Wand2 },
    { value: "calming bedtime", label: "Calming Bedtime", icon: Moon },
    { value: "educational", label: "Educational", icon: BookOpen },
    { value: "mystery", label: "Mystery", icon: Search },
    { value: "sci-fi", label: "Sci-Fi", icon: Rocket },
  ];

  return (
    <div className="flex flex-col gap-8 md:grid md:grid-cols-2">
      {/* Left: File Uploader */}
      <div className="space-y-4">
        <Label htmlFor="cover-image-upload">Story Images ({storyData.coverImages.length}/{MAX_FILES})</Label>
        <p className="text-sm text-muted-foreground">
          Upload up to {MAX_FILES} images for your story.
        </p>
        <Input
          id="cover-image-upload"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={storyData.coverImages.length >= MAX_FILES}
        />
        {/* Dropzone */}
        {storyData.coverImages.length < MAX_FILES && (
          <div
            onClick={handleThumbnailClick}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "flex h-24 md:h-32 cursor-pointer flex-col items-center justify-center gap-2 md:gap-4 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:bg-muted",
              isDragging && "border-primary/50 bg-primary/5",
              storyData.coverImages.length >= MAX_FILES && "cursor-not-allowed opacity-50"
            )}
          >
            <div className="rounded-full bg-background p-2 md:p-3 shadow-sm">
              <Camera className="h-4 w-4 md:h-6 md:w-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-xs md:text-sm font-medium">Click to select</p>
              <p className="text-xs text-muted-foreground hidden md:block">or drag and drop files here</p>
            </div>
          </div>
        )}
        {/* Previews */}
        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {previews.map((previewUrl, index) => (
              <div key={index} className="relative group aspect-square overflow-hidden rounded-lg border">
                <img src={previewUrl} alt={`Story preview ${index + 1}`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => handleRemove(index)}
                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove image {index + 1}</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Theme Chooser */}
      <div className="space-y-4 mt-6 md:mt-0">
        <Label>Story Theme</Label>
        <p className="text-sm text-muted-foreground">Select the main theme for your story.</p>
        <RadioGroup
          value={storyData.theme}
          onValueChange={(value) => setStoryData(prev => ({ ...prev, theme: value }))}
          className="grid grid-cols-2 gap-2 md:gap-4"
        >
          {themes.map((theme) => (
            <Label
              key={theme.value}
              htmlFor={`theme-${theme.value}`}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-1 md:gap-2 rounded-md border-2 border-muted bg-popover p-2 md:p-4 hover:bg-accent hover:text-accent-foreground",
                storyData.theme === theme.value && "border-primary",
              )}
            >
              <RadioGroupItem value={theme.value} id={`theme-${theme.value}`} className="sr-only" />
              <theme.icon className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
              <span className="text-xs md:text-sm font-medium capitalize">{theme.label}</span>
            </Label>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}

// Step 2: Characters, Language & Voice
function Step2CharactersLangVoice({ storyData, setStoryData }: StepProps) {
  const handleAddCharacter = () => {
    setStoryData(prev => ({ ...prev, characters: [...prev.characters, { name: "", description: "" }] }));
  };

  const handleCharacterChange = (index: number, field: 'name' | 'description', value: string) => {
    const updatedCharacters = [...storyData.characters];
    updatedCharacters[index] = { ...updatedCharacters[index], [field]: value };
    setStoryData(prev => ({ ...prev, characters: updatedCharacters }));
  };

  const handleRemoveCharacter = (index: number) => {
    const updatedCharacters = storyData.characters.filter((_, i) => i !== index);
    setStoryData(prev => ({ ...prev, characters: updatedCharacters }));
  };

  const handlePlayVoice = (voiceValue: string) => {
    // TODO: Implement actual voice playback logic
    console.log("Playing voice:", voiceValue);
    // Example: const audio = new Audio(`/path/to/voice/${voiceValue}.mp3`); audio.play();
  };

  return (
    <div className="flex flex-col gap-8 md:grid md:grid-cols-2">
      {/* Left: Character Form */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Characters</Label>
          <Button type="button" size="sm" variant="outline" onClick={handleAddCharacter} disabled={storyData.characters.length >= 5}>
            <Plus className="mr-1 h-3 w-3 md:mr-2 md:h-4 md:w-4" /> 
            <span className="text-xs md:text-sm">Add Character</span>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">Add up to 5 characters.</p>
        <div className="space-y-3 max-h-[300px] md:max-h-[400px] overflow-y-auto pr-1 md:pr-2">
          {storyData.characters.map((char, index) => (
            <Card key={index} className="relative pt-4 bg-white">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemoveCharacter(index)}
              >
                <X className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              <CardContent className="space-y-3 p-3 md:p-4">
                <div className="space-y-1">
                  <Label htmlFor={`character-name-${index}`} className="text-slate-800 text-xs md:text-sm">Name</Label>
                  <Input
                    id={`character-name-${index}`}
                    placeholder={`Character ${index + 1} Name`}
                    value={char.name}
                    onChange={(e) => handleCharacterChange(index, 'name', e.target.value)}
                    className="h-8 md:h-10 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`character-desc-${index}`} className="text-slate-800 text-xs md:text-sm">Description</Label>
                  <Textarea
                    id={`character-desc-${index}`}
                    placeholder="Brief description (e.g., brave knight, curious cat)"
                    value={char.description}
                    onChange={(e) => handleCharacterChange(index, 'description', e.target.value)}
                    className="min-h-[40px] md:min-h-[60px] text-sm resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          {storyData.characters.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No characters added.</p>
          )}
        </div>
      </div>

      {/* Right: Language & Voice */}
      <div className="space-y-5 mt-4 md:mt-0">
        {/* Language Selection */}
        <div className="space-y-2">
          <Label htmlFor="language-select" className="text-sm">Language</Label>
          <p className="text-xs md:text-sm text-muted-foreground">Select the story language.</p>
          <Select
            value={storyData.language}
            onValueChange={(value) => setStoryData(prev => ({ ...prev, language: value }))}
          >
            <SelectTrigger id="language-select" className="h-9 md:h-10">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Voice Selection */}
        <div className="space-y-2 max-h-[250px] md:max-h-[400px] overflow-y-auto pr-1">
          <Label className="text-sm">Voice Selection</Label>
          <p className="text-xs md:text-sm text-muted-foreground">Choose a voice.</p>
          <RadioGroup
            value={storyData.voice}
            onValueChange={(value) => setStoryData(prev => ({ ...prev, voice: value }))}
            className="grid grid-cols-1 gap-2 md:gap-3"
          >
            {voices.map((voice) => (
              <Label
                key={voice.value}
                htmlFor={`voice-${voice.value}`}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-md border border-muted p-2 md:p-3 hover:border-primary/50",
                  storyData.voice === voice.value && "border-primary bg-primary/5",
                )}
              >
                <div className="flex flex-col items-start gap-0.5 md:gap-1">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value={voice.value} id={`voice-${voice.value}`} className="sr-only" />
                    <span className="text-xs md:text-sm font-medium">{voice.label}</span>
                  </div>
                  <p className="text-[10px] md:text-xs text-muted-foreground pl-4 md:pl-6">{voice.description}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 md:h-7 md:w-7 text-muted-foreground hover:text-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handlePlayVoice(voice.value);
                  }}
                >
                  <Play className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </Label>
            ))}
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}

// Step 3: Preview & Create
function Step3PreviewCreate({ storyData }: StepProps) {
  // Generate temporary URLs for preview if they don't exist
  const imagePreviews = React.useMemo(() => {
    return storyData.coverImages.map(file => {
      if ((file as any).preview) return (file as any).preview;
      try {
        return URL.createObjectURL(file);
      } catch (error) {
        console.error("Error creating object URL for preview:", error);
        return null;
      }
    }).filter(url => url !== null) as string[];
  }, [storyData.coverImages]);

  // Cleanup object URLs on component unmount
  React.useEffect(() => {
    return () => {
      imagePreviews.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imagePreviews]);

  return (
    <div className="space-y-4 md:space-y-6">
      <h3 className="text-base md:text-lg font-semibold text-gray-800">Story Preview</h3>
      <p className="text-xs md:text-sm text-muted-foreground">Review your story details before creating.</p>

      <Card className="overflow-hidden border shadow-sm bg-secondary">
        <CardContent className="p-3 md:p-6 space-y-4 md:space-y-5">
          {/* Image Previews */}
          <div>
            <h4 className="text-sm md:text-base font-medium text-gray-700 mb-2">Images</h4>
            {imagePreviews.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 md:gap-3">
                {imagePreviews.map((url, index) => (
                  <div key={index} className="aspect-square overflow-hidden rounded-md border bg-gray-100">
                    <img src={url} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs md:text-sm text-muted-foreground italic">No images uploaded.</p>
            )}
          </div>

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* Other Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-8 gap-y-3 md:gap-y-4 text-xs md:text-sm">
            <div className="space-y-1">
              <p className="font-medium text-gray-600">Theme:</p>
              <p className="capitalize text-gray-800">{storyData.theme || <span className="text-muted-foreground italic">Not selected</span>}</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-gray-600">Language:</p>
              <p className="text-gray-800">{languages.find(l => l.value === storyData.language)?.label || <span className="text-muted-foreground italic">Not selected</span>}</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-gray-600">Voice:</p>
              <p className="text-gray-800">{voices.find(v => v.value === storyData.voice)?.label || <span className="text-muted-foreground italic">Not selected</span>}</p>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* Characters Section */}
          <div>
            <h4 className="text-sm md:text-base font-medium text-gray-700 mb-2 md:mb-3">Characters</h4>
            {storyData.characters.length > 0 ? (
              <ul className="space-y-2 md:space-y-3 max-h-[200px] md:max-h-[250px] overflow-y-auto pr-1">
                {storyData.characters.map((char, i) => (
                  <li key={i} className="p-2 md:p-3 border rounded-md bg-white">
                    <p className="font-semibold text-xs md:text-sm text-gray-800">{char.name || <span className="italic text-muted-foreground">Unnamed Character {i + 1}</span>}</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground mt-1">{char.description || <span className="italic">No description provided.</span>}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs md:text-sm text-muted-foreground italic">No characters added.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Main Wizard Component ---

interface StoryCreationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: (storyData: StoryData) => void;
}

export function StoryCreationWizardModal({ open, onOpenChange, onComplete }: StoryCreationWizardProps) {
  const [step, setStep] = useState(1);
  const [storyData, setStoryData] = useState<StoryData>({
    coverImages: [],
    theme: "adventure",
    characters: [],
    language: "en",
    voice: "gentle-male",
  });

  const totalSteps = 3;

  const updateStoryData = useCallback((key: keyof StoryData | string, value: any) => {
    setStoryData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleContinue = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      console.log("Final Story Data:", storyData);
      onComplete?.(storyData);
      onOpenChange(false);
      // Reset state for next time
      setStep(1);
      setStoryData({
        coverImages: [],
        theme: "adventure",
        characters: [],
        language: "en",
        voice: "gentle-male",
      });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Reset step when dialog is closed
  useEffect(() => {
    if (!open) {
      setStep(1);
    }
  }, [open]);

  const stepTitles = [
    "Upload Image & Theme",
    "Characters, Language & Voice",
    "Preview & Create",
  ];

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <Step1UploadTheme storyData={storyData} setStoryData={setStoryData} updateStoryData={updateStoryData} />;
      case 2:
        return <Step2CharactersLangVoice storyData={storyData} setStoryData={setStoryData} updateStoryData={updateStoryData} />;
      case 3:
        return <Step3PreviewCreate storyData={storyData} setStoryData={setStoryData} updateStoryData={updateStoryData} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-w-3xl [&>button:last-child]:top-2 [&>button:last-child]:right-2 max-h-[90vh] md:max-h-[85vh]">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b border-border px-4 py-3 md:px-6 md:py-4 text-base md:text-lg font-semibold truncate">
            <span className="hidden sm:inline">Create New Story - </span>
            <span>Step {step}: {stepTitles[step - 1]}</span>
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Follow the steps to create your personalized lullaby story.
        </DialogDescription>
        <div className="overflow-y-auto px-4 py-3 md:px-6 md:py-4 min-h-[300px] md:min-h-[400px]">
          {renderStepContent()}
        </div>
        <DialogFooter className="border-t border-border px-4 py-3 md:px-6 md:py-4">
          <div className="flex w-full flex-col sm:flex-row items-center justify-between gap-3">
            {/* Progress Indicator */}
            <div className="flex items-center space-x-2 order-2 sm:order-1">
              {[...Array(totalSteps)].map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-1.5 w-1.5 md:h-2 md:w-2 rounded-full transition-colors",
                    index + 1 === step ? "bg-primary" : "bg-muted",
                    index + 1 < step ? "bg-primary/50" : "",
                  )}
                />
              ))}
              <span className="text-xs md:text-sm text-muted-foreground">Step {step} of {totalSteps}</span>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1 sm:flex-none h-9 text-xs md:text-sm">
                  Back
                </Button>
              )}
              <Button 
                type="button" 
                onClick={handleContinue} 
                className="group flex-1 sm:flex-none h-9 text-xs md:text-sm"
              >
                {step === totalSteps ? "Create Story" : "Continue"}
                {step < totalSteps && <ArrowRight className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4 opacity-60 transition-transform group-hover:translate-x-0.5" />}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Example usage
export default function StoryCreationExample() {
  const [open, setOpen] = useState(false);
  
  const handleComplete = (data: StoryData) => {
    console.log("Story created:", data);
    // Handle the completed story data
  };
  
  return (
    <div className="p-4 flex justify-center">
      <Button onClick={() => setOpen(true)}>Create New Story</Button>
      <StoryCreationWizardModal 
        open={open} 
        onOpenChange={setOpen} 
        onComplete={handleComplete} 
      />
    </div>
  );
}