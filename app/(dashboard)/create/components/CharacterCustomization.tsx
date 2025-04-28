import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { StepProps } from "@/types/story";

export default function CharacterCustomization({ storyData, updateStoryData }: StepProps) {
    return (
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Create the main character for your story by customizing their details.
        </p>
  
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="character-name">Character Name</Label>
            <Input
              id="character-name"
              placeholder="Enter character name"
              value={storyData.characterName}
              onChange={(e) => updateStoryData("characterName", e.target.value)}
            />
          </div>
  
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="character-age">Character Age</Label>
              <Input
                id="character-age"
                type="number"
                min={1}
                max={120}
                value={storyData.characterAge}
                onChange={(e) => updateStoryData("characterAge", parseInt(e.target.value))}
              />
            </div>
  
            <div className="space-y-2">
              <Label>Character Gender</Label>
              <RadioGroup
                value={storyData.characterGender}
                onValueChange={(value) => updateStoryData("characterGender", value)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">Female</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="neutral" id="neutral" />
                  <Label htmlFor="neutral">Neutral</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
  
          <div className="space-y-2">
            <Label htmlFor="character-personality">Character Personality</Label>
            <Textarea
              id="character-personality"
              placeholder="Describe your character's personality"
              value={storyData.characterPersonality}
              onChange={(e) => updateStoryData("characterPersonality", e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
      </div>
    );
  }