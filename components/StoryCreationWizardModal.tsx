"use client";

import * as React from "react";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog, // Keep Dialog related imports
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose, // Add DialogClose if needed for explicit closing
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowRight,
  BookOpen, // Added for Educational theme
  Camera,
  Compass, // Added for Adventure theme
  Moon, // Added for Calming Bedtime theme
  Play, // <-- Add Play icon
  Plus,
  Rocket, // Added for Sci-Fi theme
  Search, // Added for Mystery theme
  Trash2,
  Upload,
  Wand2, // Added for Fantasy theme
  X,
} from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";

// --- Interfaces (Keep these with the component) ---

interface StoryCharacter {
  name: string;
  description: string;
}

interface StoryData {
  coverImages: File[]; // Changed to handle multiple files
  theme: string;
  characters: StoryCharacter[];
  language: string;
  voice: string;
  // Add other fields as needed
}

interface StepProps {
  storyData: StoryData;
  updateStoryData: (key: keyof StoryData | string, value: any) => void;
  setStoryData: React.Dispatch<React.SetStateAction<StoryData>>; // Add setStoryData for complex updates
}

// Define static data outside component to avoid re-creation on render
const languages = [
  { value: "en", label: "English" },
  { value: "id", label: "Indonesian" },
  // Add French, Japanese later if needed
];
const voices = [
  { value: "gentle-male", label: "Gentle Male", description: "A soft and soothing male voice." },
  { value: "warm-female", label: "Warm Female", description: "A kind and comforting female voice." },
  { value: "playful-child", label: "Playful Child", description: "An energetic and cheerful child's voice." },
  { value: "calm-neutral", label: "Calm Neutral", description: "A steady and relaxing neutral voice." },
];

// --- Step Components (Keep these with the main component) ---

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
    const cleanup = updatePreviewsAndFiles(e.target.files);
    // Reset file input to allow selecting the same file again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // No need to return cleanup here, it's handled in useEffect and updatePreviewsAndFiles
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
    [setStoryData, storyData.coverImages, previews], // Add dependencies
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
  })

  const themes = [
    { value: "adventure", label: "Adventure", icon: Compass },
    { value: "fantasy", label: "Fantasy", icon: Wand2 },
    { value: "calming bedtime", label: "Calming Bedtime", icon: Moon },
    { value: "educational", label: "Educational", icon: BookOpen },
    { value: "mystery", label: "Mystery", icon: Search },
    { value: "sci-fi", label: "Sci-Fi", icon: Rocket },
  ];

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
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
          multiple // Allow multiple file selection
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
              "flex h-32 cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:bg-muted",
              isDragging && "border-primary/50 bg-primary/5",
              storyData.coverImages.length >= MAX_FILES && "cursor-not-allowed opacity-50"
            )}
          >
            <div className="rounded-full bg-background p-3 shadow-sm">
              <Camera className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Click to select</p>
              <p className="text-xs text-muted-foreground">or drag and drop files here</p>
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
      <div className="space-y-4">
        <Label>Story Theme</Label>
        <p className="text-sm text-muted-foreground">Select the main theme for your story.</p>
        <RadioGroup
          value={storyData.theme}
          onValueChange={(value) => setStoryData(prev => ({ ...prev, theme: value }))} // Update using setStoryData
          className="grid grid-cols-2 gap-4"
        >
          {themes.map((theme) => (
            <Label
              key={theme.value}
              htmlFor={`theme-${theme.value}`}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground",
                storyData.theme === theme.value && "border-primary",
              )}
            >
              <RadioGroupItem value={theme.value} id={`theme-${theme.value}`} className="sr-only" />
              <theme.icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium capitalize">{theme.label}</span>
            </Label>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}

// Step 2: Characters, Language & Voice
function Step2CharactersLangVoice({ storyData, setStoryData }: StepProps) { // Add setStoryData, remove updateStoryData if unused
  const handleAddCharacter = () => {
    setStoryData(prev => ({ ...prev, characters: [...prev.characters, { name: "", description: "" }] })); // Use setStoryData
  };

  const handleCharacterChange = (index: number, field: 'name' | 'description', value: string) => {
    const updatedCharacters = [...storyData.characters];
    updatedCharacters[index] = { ...updatedCharacters[index], [field]: value };
    setStoryData(prev => ({ ...prev, characters: updatedCharacters })); // Use setStoryData
  };

  const handleRemoveCharacter = (index: number) => {
    const updatedCharacters = storyData.characters.filter((_, i) => i !== index);
    setStoryData(prev => ({ ...prev, characters: updatedCharacters })); // Use setStoryData
  };

  const handlePlayVoice = (voiceValue: string) => {
    // TODO: Implement actual voice playback logic
    console.log("Playing voice:", voiceValue);
    // Example: const audio = new Audio(`/path/to/voice/${voiceValue}.mp3`); audio.play();
  };

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {/* Left: Character Form */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Characters</Label>
          <Button type="button" size="sm" variant="outline" onClick={handleAddCharacter} disabled={storyData.characters.length >= 5}>
            <Plus className="mr-2 h-4 w-4" /> Add Character
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">Add up to 5 characters.</p>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2"> {/* Added scroll */}
          {storyData.characters.map((char, index) => (
            <Card key={index} className="relative pt-4 bg-white"> {/* Wrap in Card */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemoveCharacter(index)}
              >
                <X className="h-4 w-4" />
              </Button>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor={`character-name-${index}`} className="text-slate-800">Name</Label>
                  <Input
                    id={`character-name-${index}`}
                    placeholder={`Character ${index + 1} Name`}
                    value={char.name}
                    onChange={(e) => handleCharacterChange(index, 'name', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`character-desc-${index}`} className="text-slate-800">Description</Label>
                  <Textarea
                    id={`character-desc-${index}`}
                    placeholder="Brief description (e.g., brave knight, curious cat)"
                    value={char.description}
                    onChange={(e) => handleCharacterChange(index, 'description', e.target.value)}
                    className="min-h-[60px]"
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
      <div className="space-y-6">
        {/* Language Selection */}
        <div className="space-y-2">
          <Label htmlFor="language-select">Language</Label>
          <p className="text-sm text-muted-foreground">Select the story language.</p>
          <Select
            value={storyData.language}
            onValueChange={(value) => setStoryData(prev => ({ ...prev, language: value }))} // Use setStoryData
          >
            <SelectTrigger id="language-select">
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
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          <Label>Voice Selection</Label>
          <p className="text-sm text-muted-foreground">Choose a voice.</p>
          <RadioGroup
            value={storyData.voice}
            onValueChange={(value) => setStoryData(prev => ({ ...prev, voice: value }))} // Use setStoryData
            className="grid grid-cols-1 gap-3"
          >
            {voices.map((voice) => (
              <Label
                key={voice.value}
                htmlFor={`voice-${voice.value}`}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-md border border-muted p-3 hover:border-primary/50",
                  storyData.voice === voice.value && "border-primary bg-primary/5",
                )}
              >
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value={voice.value} id={`voice-${voice.value}`} className="sr-only" />
                    <span className="text-sm font-medium">{voice.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-6">{voice.description}</p> {/* Added description */}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-primary"
                  onClick={(e) => {
                    e.preventDefault(); // Prevent label click from selecting radio
                    e.stopPropagation();
                    handlePlayVoice(voice.value);
                  }}
                >
                  <Play className="h-4 w-4" />
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
      // Check if the file object already has a preview URL (e.g., from upload hook)
      // If not, create one. This assumes the File object might be persisted differently.
      // A more robust solution might involve storing URLs alongside files in storyData.
      if ((file as any).preview) return (file as any).preview;
      try {
        return URL.createObjectURL(file);
      } catch (error) {
        console.error("Error creating object URL for preview:", error);
        return null; // Handle cases where URL creation fails
      }
    }).filter(url => url !== null) as string[];
  }, [storyData.coverImages]);

  // Cleanup object URLs on component unmount
  React.useEffect(() => {
    return () => {
      imagePreviews.forEach(url => {
        // Only revoke if it looks like an object URL
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imagePreviews]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">Story Preview</h3>
      <p className="text-sm text-muted-foreground">Review your story details before creating.</p>

      <Card className="overflow-hidden border shadow-sm bg-secondary">
        <CardContent className="p-6 space-y-5">
          {/* Image Previews */}
          <div>
            <h4 className="text-base font-medium text-gray-700 mb-2">Images</h4>
            {imagePreviews.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {imagePreviews.map((url, index) => (
                  <div key={index} className="aspect-square overflow-hidden rounded-md border bg-gray-100">
                    <img src={url} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No images uploaded.</p>
            )}
          </div>

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* Other Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
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
            <h4 className="text-base font-medium text-gray-700 mb-3">Characters</h4>
            {storyData.characters.length > 0 ? (
              <ul className="space-y-3">
                {storyData.characters.map((char, i) => (
                  <li key={i} className="p-3 border rounded-md bg-white">
                    <p className="font-semibold text-sm text-gray-800">{char.name || <span className="italic text-muted-foreground">Unnamed Character {i + 1}</span>}</p>
                    <p className="text-xs text-muted-foreground mt-1">{char.description || <span className="italic">No description provided.</span>}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">No characters added.</p>
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
    coverImages: [], // Initialize as empty array
    theme: "adventure",
    characters: [],
    language: "en",
    voice: "gentle-male",
  });

  const totalSteps = 3;

  // updateStoryData can be kept for simple updates if preferred, but setStoryData is used for complex ones
  const updateStoryData = useCallback((key: keyof StoryData | string, value: any) => {
    setStoryData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleContinue = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      console.log("Final Story Data:", storyData);
      onComplete?.(storyData);
      onOpenChange(false); // Close dialog on completion
      // Reset state for next time
      setStep(1);
      setStoryData({
        coverImages: [], // Reset coverImages
        theme: "adventure",
        characters: [],
        language: "en",
        voice: "gentle-male",
      });
      // Also clear previews when resetting
      // This requires access to setPreviews, might need lifting state or passing setter down
      // For now, let's assume previews clear on next open due to useEffect in Step1
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Reset step when dialog is closed
  React.useEffect(() => {
    if (!open) {
      setStep(1);
      // Optionally reset storyData here too if needed
    }
  }, [open]);

  const stepTitles = [
    "Upload Image & Select Theme",
    "Add Characters, Language & Voice",
    "Preview & Create",
  ];

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <Step1UploadTheme storyData={storyData} setStoryData={setStoryData} updateStoryData={updateStoryData} />; // Pass setStoryData
      case 2:
        return <Step2CharactersLangVoice storyData={storyData} setStoryData={setStoryData} updateStoryData={updateStoryData} />; // Pass setStoryData
      case 3:
        return <Step3PreviewCreate storyData={storyData} setStoryData={setStoryData} updateStoryData={updateStoryData} />; // Pass setStoryData
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-w-3xl [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b border-border px-6 py-4 text-lg font-semibold">
            Create New Story - Step {step}: {stepTitles[step - 1]}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Follow the steps to create your personalized lullaby story.
        </DialogDescription>
        <div className="overflow-y-auto px-6 py-4 min-h-[400px]">
          {renderStepContent()}
        </div>
        <DialogFooter className="border-t border-border px-6 py-4">
          <div className="flex w-full items-center justify-between">
            {/* Progress Indicator */}
            <div className="flex items-center space-x-2">
              {[...Array(totalSteps)].map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-2 w-2 rounded-full transition-colors",
                    index + 1 === step ? "bg-primary" : "bg-muted",
                    index + 1 < step ? "bg-primary/50" : "",
                  )}
                />
              ))}
              <span className="text-sm text-muted-foreground">Step {step} of {totalSteps}</span>
            </div>
            {/* Action Buttons */}
            <div className="flex gap-2">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
              <Button type="button" onClick={handleContinue} className="group">
                {step === totalSteps ? "Create Story" : "Continue"}
                {step < totalSteps && <ArrowRight className="ml-2 h-4 w-4 opacity-60 transition-transform group-hover:translate-x-0.5" />}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}