import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { StepProps } from "@/types/story";
import { BookOpen } from "lucide-react";

export default function ThemeSelection({ storyData, updateStoryData }: StepProps) {
    const themes = [
      { id: "adventure", name: "Adventure", icon: <BookOpen className="h-5 w-5" /> },
      { id: "mystery", name: "Mystery", icon: <BookOpen className="h-5 w-5" /> },
      { id: "fantasy", name: "Fantasy", icon: <BookOpen className="h-5 w-5" /> },
      { id: "scifi", name: "Science Fiction", icon: <BookOpen className="h-5 w-5" /> },
      { id: "historical", name: "Historical", icon: <BookOpen className="h-5 w-5" /> },
      { id: "educational", name: "Educational", icon: <BookOpen className="h-5 w-5" /> },
    ];
  
    const settings = [
      { id: "fantasy", name: "Fantasy World" },
      { id: "urban", name: "Urban City" },
      { id: "space", name: "Outer Space" },
      { id: "historical", name: "Historical Period" },
      { id: "nature", name: "Nature/Wilderness" },
      { id: "school", name: "School" },
    ];
  
    const tones = [
      { id: "cheerful", name: "Cheerful" },
      { id: "mysterious", name: "Mysterious" },
      { id: "exciting", name: "Exciting" },
      { id: "educational", name: "Educational" },
      { id: "dramatic", name: "Dramatic" },
      { id: "funny", name: "Funny" },
    ];
  
    return (
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Select a theme, setting, and tone for your story.
        </p>
  
        <Tabs defaultValue="theme" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="setting">Setting</TabsTrigger>
            <TabsTrigger value="tone">Tone</TabsTrigger>
          </TabsList>
          <TabsContent value="theme" className="pt-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {themes.map((theme) => (
                <Card
                  key={theme.id}
                  className={cn(
                    "flex cursor-pointer flex-col items-center justify-center p-4 text-center hover:bg-muted",
                    storyData.theme === theme.id && "border-primary bg-primary/5"
                  )}
                  onClick={() => updateStoryData("theme", theme.id)}
                >
                  <div className="mb-2">{theme.icon}</div>
                  <p className="text-sm font-medium">{theme.name}</p>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="setting" className="pt-4">
            <RadioGroup
              value={storyData.setting}
              onValueChange={(value) => updateStoryData("setting", value)}
              className="grid grid-cols-2 gap-3"
            >
              {settings.map((setting) => (
                <div key={setting.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={setting.id} id={`setting-${setting.id}`} />
                  <Label htmlFor={`setting-${setting.id}`}>{setting.name}</Label>
                </div>
              ))}
            </RadioGroup>
          </TabsContent>
          <TabsContent value="tone" className="pt-4">
            <RadioGroup
              value={storyData.tone}
              onValueChange={(value) => updateStoryData("tone", value)}
              className="grid grid-cols-2 gap-3"
            >
              {tones.map((tone) => (
                <div key={tone.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={tone.id} id={`tone-${tone.id}`} />
                  <Label htmlFor={`tone-${tone.id}`}>{tone.name}</Label>
                </div>
              ))}
            </RadioGroup>
          </TabsContent>
        </Tabs>
      </div>
    );
  }