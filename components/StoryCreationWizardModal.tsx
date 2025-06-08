// components/StoryCreationWizardModal.tsx
"use client";

import * as React from "react";
import { useCallback, useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight,
  BookOpen,
  Camera,
  Compass,
  Loader2,
  Moon,
  Plus,
  Rocket,
  Search,
  Upload,
  Wand2,
  X,
  Volume2,
  Baby,
  Users,
  GraduationCap,
  Heart
} from "lucide-react";

// --- Interfaces ---

interface StoryCharacter {
  name: string;
  description: string;
}

interface StoryData {
  coverImages: File[];
  imagePreviewUrls: string[];
  theme: string;
  characters: StoryCharacter[];
  language: string;
  voice: string;
  duration: string;
  targetAge: string;
  customPrompt?: string;
}

interface StepProps {
  storyData: StoryData;
  updateStoryData: (key: keyof StoryData | string, value: any) => void;
  setStoryData: React.Dispatch<React.SetStateAction<StoryData>>;
}

interface Voice {
  value: string;
  label: string;
  description: string;
  language: string;
  gender: string;
  age: string;
  accent: string;
  preview_url: string | null;
  category: string;
  descriptive: string;
}

// Main modal props interface (FIXED TypeScript interface)
interface StoryCreationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: (storyData: StoryData) => void;
}

// Static data
const languages = [
  { value: "en", label: "English" },
  { value: "id", label: "Indonesian" },
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
    if (storyData.imagePreviewUrls.length > 0) {
      setPreviews(storyData.imagePreviewUrls);
    } else {
      const initialPreviews = storyData.coverImages.map(file => URL.createObjectURL(file));
      setPreviews(initialPreviews);
      setStoryData(prev => ({ ...prev, imagePreviewUrls: initialPreviews }));
      return () => {
        initialPreviews.forEach(URL.revokeObjectURL);
      };
    }
  }, []);

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

      setStoryData((prev) => ({ 
        ...prev, 
        coverImages: updatedFiles,
        imagePreviewUrls: updatedPreviews 
      }));
      setPreviews(updatedPreviews);
    }

    return () => {
      newPreviewsToAdd.forEach(URL.revokeObjectURL);
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePreviewsAndFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    const newFiles = storyData.coverImages.filter((_, i) => i !== index);

    URL.revokeObjectURL(previews[index]);

    setPreviews(newPreviews);
    setStoryData((prev) => ({ 
      ...prev, 
      coverImages: newFiles,
      imagePreviewUrls: newPreviews 
    }));
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

// Step 2: Characters, Age & Settings (Enhanced)
function Step2CharactersAge({ storyData, setStoryData }: StepProps) {
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

  const ageGroups = [
    { 
      value: "2-4", 
      label: "Toddlers (2-4 years)", 
      icon: Baby,
      description: "Simple, repetitive stories with familiar concepts",
      color: "bg-pink-50 border-pink-200 text-pink-800"
    },
    { 
      value: "3-5", 
      label: "Preschoolers (3-5 years)", 
      icon: Heart,
      description: "Interactive stories with basic learning and emotions",
      color: "bg-purple-50 border-purple-200 text-purple-800"
    },
    { 
      value: "5-7", 
      label: "Early Elementary (5-7 years)", 
      icon: BookOpen,
      description: "Adventure stories with problem-solving and friendship",
      color: "bg-blue-50 border-blue-200 text-blue-800"
    },
    { 
      value: "6-10", 
      label: "Elementary (6-10 years)", 
      icon: GraduationCap,
      description: "Complex narratives with moral lessons and character growth",
      color: "bg-green-50 border-green-200 text-green-800"
    },
    { 
      value: "mixed", 
      label: "Mixed Ages (3-10 years)", 
      icon: Users,
      description: "Multi-layered stories that engage all family members",
      color: "bg-amber-50 border-amber-200 text-amber-800"
    }
  ];

  const durationOptions = [
    { 
      value: "short", 
      label: "Short Story", 
      description: getAgeSpecificDuration("short", storyData.targetAge),
      time: getAgeSpecificTime("short", storyData.targetAge), 
      tier: "free" 
    },
    { 
      value: "medium", 
      label: "Medium Story", 
      description: getAgeSpecificDuration("medium", storyData.targetAge),
      time: getAgeSpecificTime("medium", storyData.targetAge), 
      tier: "free" 
    },
    { 
      value: "long", 
      label: "Long Story", 
      description: getAgeSpecificDuration("long", storyData.targetAge),
      time: getAgeSpecificTime("long", storyData.targetAge), 
      tier: "premium" 
    },
  ];

  return (
    <div className="space-y-8">
      {/* Age Group Selection */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Who is this story for?</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Choose the age group to customize vocabulary, themes, and complexity.
          </p>
        </div>
        
        <RadioGroup
          value={storyData.targetAge}
          onValueChange={(value) => setStoryData(prev => ({ ...prev, targetAge: value }))}
          className="grid grid-cols-2 gap-3"
        >
          {ageGroups.map((ageGroup) => (
            <Label
              key={ageGroup.value}
              htmlFor={`age-${ageGroup.value}`}
              className={cn(
                "flex cursor-pointer items-start justify-between rounded-lg border-2 p-4 hover:border-primary/50 transition-colors",
                storyData.targetAge === ageGroup.value && "border-primary bg-primary/5",
              )}
            >
              <div className="flex items-start gap-3 flex-1">
                <RadioGroupItem value={ageGroup.value} id={`age-${ageGroup.value}`} className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <ageGroup.icon className="h-4 w-4" />
                    <span className="font-medium text-sm">{ageGroup.label}</span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full", ageGroup.color)}>
                      Optimized
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{ageGroup.description}</p>
                </div>
              </div>
            </Label>
          ))}
        </RadioGroup>
      </div>

      {/* Characters Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium">Story Characters</Label>
            <p className="text-sm text-muted-foreground">
              {getCharacterGuidance(storyData.targetAge)}
            </p>
          </div>
          <Button 
            type="button" 
            size="sm" 
            variant="outline" 
            onClick={handleAddCharacter} 
            disabled={storyData.characters.length >= getMaxCharacters(storyData.targetAge)}
          >
            <Plus className="mr-1 h-3 w-3 md:mr-2 md:h-4 md:w-4" /> 
            <span className="text-xs md:text-sm">Add Character</span>
          </Button>
        </div>
        
        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
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
              <CardContent className="space-y-3 p-3">
                <div className="space-y-1">
                  <Label htmlFor={`character-name-${index}`} className="text-slate-800 text-xs">Name</Label>
                  <Input
                    id={`character-name-${index}`}
                    placeholder={getCharacterNamePlaceholder(index, storyData.targetAge)}
                    value={char.name}
                    onChange={(e) => handleCharacterChange(index, 'name', e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`character-desc-${index}`} className="text-slate-800 text-xs">Description</Label>
                  <Textarea
                    id={`character-desc-${index}`}
                    placeholder={getCharacterDescPlaceholder(storyData.targetAge)}
                    value={char.description}
                    onChange={(e) => handleCharacterChange(index, 'description', e.target.value)}
                    className="min-h-[40px] text-sm resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          {storyData.characters.length === 0 && (
            <div className="text-center py-6 border-2 border-dashed border-muted rounded-lg">
              <p className="text-sm text-muted-foreground">No characters added yet.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click "Add Character" to create {getCharacterSuggestion(storyData.targetAge)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Language & Duration Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language Selection */}
        <div className="space-y-2">
          <Label htmlFor="language-select" className="text-sm font-medium">Story Language</Label>
          <p className="text-xs text-muted-foreground">Choose the language for your story narration.</p>
          <Select
            value={storyData.language}
            onValueChange={(value) => setStoryData(prev => ({ ...prev, language: value }))}
          >
            <SelectTrigger id="language-select" className="h-9">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Duration Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Story Duration</Label>
          <p className="text-xs text-muted-foreground">Choose how long your story should be.</p>
          <RadioGroup
            value={storyData.duration}
            onValueChange={(value) => setStoryData(prev => ({ ...prev, duration: value }))}
            className="space-y-2"
          >
            {durationOptions.map((option) => (
              <Label
                key={option.value}
                htmlFor={`duration-${option.value}`}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-md border border-muted p-3 hover:border-primary/50",
                  storyData.duration === option.value && "border-primary bg-primary/5",
                  option.tier === "premium" && "opacity-75"
                )}
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem 
                    value={option.value} 
                    id={`duration-${option.value}`}
                    disabled={option.tier === "premium"}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{option.label}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {option.time}
                      </span>
                      {option.tier === "premium" && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          Premium
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </div>
      </div>

      {/* Optional Custom Elements */}
      <div className="space-y-2">
        <Label htmlFor="custom-prompt" className="text-sm font-medium">Special Requests (Optional)</Label>
        <p className="text-xs text-muted-foreground">
          Add any special elements you'd like in the story (e.g., "include a pet dog", "set in a garden", "teach about recycling").
        </p>
        <Textarea
          id="custom-prompt"
          placeholder="Any special elements or themes you'd like included..."
          value={storyData.customPrompt || ""}
          onChange={(e) => setStoryData(prev => ({ ...prev, customPrompt: e.target.value }))}
          className="min-h-[60px] text-sm resize-none"
        />
      </div>
    </div>
  );
}

// Step 3: Voice Selection
function Step3VoiceSelection({ storyData, setStoryData }: StepProps) {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<string>('free');

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/voices');
        if (!response.ok) {
          throw new Error('Failed to fetch voices');
        }
        
        const data = await response.json();
        
        let filteredVoices = data.voices.filter((voice: Voice) => 
          voice.language === storyData.language
        );

        if (userTier === 'free') {
          const defaultVoices = [
            {
              value: `default-${storyData.language}-male`,
              label: `Default Male Voice`,
              description: `A professional ${storyData.language === 'id' ? 'Indonesian' : 'English'} male voice for storytelling`,
              language: storyData.language,
              gender: 'male',
              age: 'adult',
              accent: 'standard',
              preview_url: null,
              category: 'default',
              descriptive: 'professional'
            },
            {
              value: `default-${storyData.language}-female`,
              label: `Default Female Voice`,
              description: `A professional ${storyData.language === 'id' ? 'Indonesian' : 'English'} female voice for storytelling`,
              language: storyData.language,
              gender: 'female',
              age: 'adult',
              accent: 'standard',
              preview_url: null,
              category: 'default',
              descriptive: 'professional'
            }
          ];
          filteredVoices = defaultVoices;
        }
        
        setVoices(filteredVoices);
        
        if (!storyData.voice && filteredVoices.length > 0) {
          setStoryData(prev => ({ ...prev, voice: filteredVoices[0].value }));
        }
        
      } catch (err: any) {
        console.error('Error fetching voices:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVoices();
  }, [storyData.language]);

  const handlePlayVoice = (voiceValue: string) => {
    const voice = voices.find(v => v.value === voiceValue);
    if (voice?.preview_url) {
      const audio = new Audio(voice.preview_url);
      audio.play().catch(console.error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading available voices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-sm text-red-600">Error loading voices: {error}</p>
        <p className="text-xs text-muted-foreground">Using fallback voice options.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base">Choose Your Narrator Voice</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Select a voice for your {languages.find(l => l.value === storyData.language)?.label} story.
        </p>
        {userTier === 'free' && (
          <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>Free Plan:</strong> You have access to our default professional voices. 
              Upgrade to Premium to access custom ElevenLabs voices and longer stories.
            </p>
          </div>
        )}
      </div>

      {voices.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">No voices available for {storyData.language}</p>
        </div>
      ) : (
        <RadioGroup
          value={storyData.voice}
          onValueChange={(value) => setStoryData(prev => ({ ...prev, voice: value }))}
          className="grid grid-cols-1 gap-3"
        >
          {voices.map((voice) => (
            <Label
              key={voice.value}
              htmlFor={`voice-${voice.value}`}
              className={cn(
                "flex cursor-pointer items-start justify-between rounded-lg border border-muted p-4 hover:border-primary/50 transition-colors",
                storyData.voice === voice.value && "border-primary bg-primary/5",
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <RadioGroupItem value={voice.value} id={`voice-${voice.value}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{voice.label}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {voice.gender} • {voice.age}
                      </span>
                      {voice.category === 'default' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                          Free
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {voice.description}
                    </p>
                  </div>
                </div>
              </div>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary flex-shrink-0"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePlayVoice(voice.value);
                }}
                disabled={!voice.preview_url}
              >
                <Volume2 className="h-4 w-4" />
                <span className="sr-only">Preview voice</span>
              </Button>
            </Label>
          ))}
        </RadioGroup>
      )}
    </div>
  );
}

// Step 4: Preview & Create
function Step4PreviewCreate({ storyData }: StepProps) {
  const imagePreviews = storyData.imagePreviewUrls;
  
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

          <hr className="border-gray-200" />

          {/* Other Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-8 gap-y-3 md:gap-y-4 text-xs md:text-sm">
            <div className="space-y-1">
              <p className="font-medium text-gray-600">Theme:</p>
              <p className="capitalize text-gray-800">{storyData.theme || <span className="text-muted-foreground italic">Not selected</span>}</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-gray-600">Target Age:</p>
              <p className="text-gray-800">{getAgeGroupLabel(storyData.targetAge) || <span className="text-muted-foreground italic">Not selected</span>}</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-gray-600">Language:</p>
              <p className="text-gray-800">{languages.find(l => l.value === storyData.language)?.label || <span className="text-muted-foreground italic">Not selected</span>}</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-gray-600">Duration:</p>
              <p className="text-gray-800 capitalize">{storyData.duration ? `${storyData.duration} story` : <span className="text-muted-foreground italic">Not selected</span>}</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-gray-600">Voice:</p>
              <p className="text-gray-800">{storyData.voice ? 'Selected' : <span className="text-muted-foreground italic">Not selected</span>}</p>
            </div>
          </div>

          {/* Custom Prompt */}
          {storyData.customPrompt && (
            <>
              <hr className="border-gray-200" />
              <div>
                <h4 className="text-sm md:text-base font-medium text-gray-700 mb-2">Special Requests</h4>
                <p className="text-xs md:text-sm text-gray-600 italic">"{storyData.customPrompt}"</p>
              </div>
            </>
          )}

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

// --- Helper Functions ---

function getCharacterGuidance(targetAge: string): string {
  const guidance = {
    "2-4": "Add 1-2 simple characters (like family members or friendly animals).",
    "3-5": "Create 1-2 relatable characters with clear, simple personalities.",
    "5-7": "Add 2-3 diverse characters with distinct traits and roles.",
    "6-10": "Create 2-4 well-developed characters with unique motivations.",
    "mixed": "Add 2-3 characters that appeal to different age levels."
  };
  return guidance[targetAge as keyof typeof guidance] || guidance.mixed;
}

function getMaxCharacters(targetAge: string): number {
  const maxChars = {
    "2-4": 2,
    "3-5": 2,
    "5-7": 3,
    "6-10": 4,
    "mixed": 3
  };
  return maxChars[targetAge as keyof typeof maxChars] || 3;
}

function getCharacterNamePlaceholder(index: number, targetAge: string): string {
  const suggestions = {
    "2-4": ["Teddy", "Mama", "Puppy"][index] || "Friend",
    "3-5": ["Luna", "Max", "Rosie"][index] || "Character",
    "5-7": ["Alex", "Maya", "Sam"][index] || "Character",
    "6-10": ["Elena", "Zara", "Noah"][index] || "Character",
    "mixed": ["Jamie", "River", "Sage"][index] || "Character"
  };
  return suggestions[targetAge as keyof typeof suggestions] || "Character Name";
}

function getCharacterDescPlaceholder(targetAge: string): string {
  const placeholders = {
    "2-4": "A cuddly bear who likes hugs",
    "3-5": "A kind friend who loves to share",
    "5-7": "A brave explorer who helps others",
    "6-10": "A clever inventor who solves problems",
    "mixed": "A caring friend with special talents"
  };
  return placeholders[targetAge as keyof typeof placeholders] || "Describe this character...";
}

function getCharacterSuggestion(targetAge: string): string {
  const suggestions = {
    "2-4": "1-2 simple, familiar characters.",
    "3-5": "1-2 friendly characters.",
    "5-7": "2-3 diverse characters.",
    "6-10": "2-4 interesting characters.",
    "mixed": "2-3 engaging characters."
  };
  return suggestions[targetAge as keyof typeof suggestions] || "some characters.";
}

function getAgeSpecificDuration(duration: string, targetAge: string): string {
  const descriptions = {
    "2-4": {
      "short": "Very brief story perfect for toddler attention spans",
      "medium": "Gentle story with simple repetition",
      "long": "Extended but simple story with familiar themes"
    },
    "3-5": {
      "short": "Quick story with clear beginning and end",
      "medium": "Engaging story with simple plot",
      "long": "Detailed story with character development"
    },
    "5-7": {
      "short": "Adventure-packed short story",
      "medium": "Well-developed story with problem-solving",
      "long": "Rich narrative with multiple scenes"
    },
    "6-10": {
      "short": "Sophisticated short tale",
      "medium": "Complex story with character growth",
      "long": "Epic story with detailed world-building"
    },
    "mixed": {
      "short": "Multi-layered quick story",
      "medium": "Engaging story for all ages",
      "long": "Rich, detailed family story"
    }
  };

  return descriptions[targetAge as keyof typeof descriptions]?.[duration] || 
         descriptions.mixed[duration as keyof typeof descriptions.mixed];
}

function getAgeSpecificTime(duration: string, targetAge: string): string {
  const times = {
    "2-4": { "short": "30s-1m", "medium": "1-2m", "long": "2-3m" },
    "3-5": { "short": "1-2m", "medium": "2-3m", "long": "3-4m" },
    "5-7": { "short": "1-2m", "medium": "3-4m", "long": "5-6m" },
    "6-10": { "short": "2-3m", "medium": "4-5m", "long": "6-8m" },
    "mixed": { "short": "1-2m", "medium": "3-4m", "long": "5-7m" }
  };

  return times[targetAge as keyof typeof times]?.[duration] || times.mixed[duration as keyof typeof times.mixed];
}

function getAgeGroupLabel(targetAge: string): string {
  const labels = {
    "2-4": "Toddlers (2-4 years)",
    "3-5": "Preschoolers (3-5 years)", 
    "5-7": "Early Elementary (5-7 years)",
    "6-10": "Elementary (6-10 years)",
    "mixed": "Mixed Ages (3-10 years)"
  };
  return labels[targetAge as keyof typeof labels] || "Mixed Ages";
}

// --- Main Wizard Component ---

export function StoryCreationWizardModal({ open, onOpenChange, onComplete }: StoryCreationWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [storyData, setStoryData] = useState<StoryData>({
    coverImages: [],
    imagePreviewUrls: [],
    theme: "adventure",
    characters: [],
    language: "en",
    voice: "",
    duration: "short",
    targetAge: "mixed",
    customPrompt: ""
  });

  const router = useRouter();
  const { toast } = useToast();
  const totalSteps = 4;

  const updateStoryData = useCallback((key: keyof StoryData | string, value: any) => {
    setStoryData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleContinue = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      await handleStoryComplete();
    }
  };

  const handleStoryComplete = async () => {
    setLoading(true);
    
    try {
      console.log("Creating story with data:", storyData);

      const formData = new FormData();
      
      // Add story data including new fields
      formData.append('storyData', JSON.stringify({
        theme: storyData.theme,
        characters: storyData.characters,
        language: storyData.language,
        voice: storyData.voice,
        duration: storyData.duration,
        targetAge: storyData.targetAge,
        customPrompt: storyData.customPrompt
      }));

      // Add image files
      storyData.coverImages.forEach((file, index) => {
        formData.append(`coverImage_${index}`, file);
      });

      const response = await fetch('/api/stories/create', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create story');
      }

      const { storyId } = await response.json();
      
      onOpenChange(false);
      
      toast({
        title: "Story Creation Started!",
        description: "Your story is being generated. You'll be redirected to the progress page.",
      });

      resetForm();
      router.push(`/story/creating/${storyId}`);
      onComplete?.(storyData);

    } catch (error: any) {
      console.error('Story creation error:', error);
      
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create story. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setStoryData({
      coverImages: [],
      imagePreviewUrls: [],
      theme: "adventure",
      characters: [],
      language: "en",
      voice: "",
      duration: "short",
      targetAge: "mixed",
      customPrompt: ""
    });
    setLoading(false);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  useEffect(() => {
    if (!open) {
      setStep(1);
      setLoading(false);
    }
  }, [open]);

  const stepTitles = [
    "Upload Image & Theme",
    "Characters, Age & Settings",
    "Voice Selection", 
    "Preview & Create",
  ];

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <Step1UploadTheme storyData={storyData} setStoryData={setStoryData} updateStoryData={updateStoryData} />;
      case 2:
        return <Step2CharactersAge storyData={storyData} setStoryData={setStoryData} updateStoryData={updateStoryData} />;
      case 3:
        return <Step3VoiceSelection storyData={storyData} setStoryData={setStoryData} updateStoryData={updateStoryData} />;
      case 4:
        return <Step4PreviewCreate storyData={storyData} setStoryData={setStoryData} updateStoryData={updateStoryData} />;
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
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBack} 
                  className="flex-1 sm:flex-none h-9 text-xs md:text-sm"
                  disabled={loading}
                >
                  Back
                </Button>
              )}
              <Button 
                type="button" 
                onClick={handleContinue} 
                className="group flex-1 sm:flex-none h-9 text-xs md:text-sm"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    {step === totalSteps ? "Create Story" : "Continue"}
                    {step < totalSteps && <ArrowRight className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4 opacity-60 transition-transform group-hover:translate-x-0.5" />}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}