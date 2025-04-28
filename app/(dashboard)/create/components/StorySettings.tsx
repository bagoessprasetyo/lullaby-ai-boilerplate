import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { StepProps } from "@/types/story";

export default function StorySettings({ storyData, updateStoryData }: StepProps) {
    return (
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Configure additional settings for your story.
        </p>
  
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="story-length">Story Length (pages)</Label>
              <span className="text-sm text-muted-foreground">{storyData.length} pages</span>
            </div>
            <Slider
              id="story-length"
              min={1}
              max={20}
              step={1}
              value={[storyData.length]}
              onValueChange={(value) => updateStoryData("length", value[0])}
            />
            <p className="text-xs text-muted-foreground">
              Adjust the slider to set the approximate length of your story.
            </p>
          </div>
  
          <div className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="illustrations">Include Illustrations</Label>
                <p className="text-xs text-muted-foreground">
                  Add images throughout the story to enhance the narrative
                </p>
              </div>
              <Switch
                id="illustrations"
                checked={storyData.includeIllustrations}
                onCheckedChange={(checked) => updateStoryData("includeIllustrations", checked)}
              />
            </div>
  
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="interactivity">Allow Interactivity</Label>
                <p className="text-xs text-muted-foreground">
                  Enable readers to make choices that affect the story's outcome
                </p>
              </div>
              <Switch
                id="interactivity"
                checked={storyData.allowInteractivity}
                onCheckedChange={(checked) => updateStoryData("allowInteractivity", checked)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }