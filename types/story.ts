export interface StoryData {
    coverImage: string | null;
    characterName: string;
    characterAge: number;
    characterGender: string;
    characterPersonality: string;
    theme: string;
    setting: string;
    tone: string;
    length: number;
    includeIllustrations: boolean;
    allowInteractivity: boolean;
}

export interface StepProps {
    storyData: StoryData;
    updateStoryData: (key: keyof StoryData, value: any) => void;
}