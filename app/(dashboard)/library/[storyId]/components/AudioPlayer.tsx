"use client";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider"; // Import Slider
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useRef, useState, useEffect } from "react";

export default function AudioPlayer({ src, title }: { src: string; title: string }) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const setAudioData = () => {
            setDuration(audio.duration);
            setCurrentTime(audio.currentTime);
        };

        const setAudioTime = () => setCurrentTime(audio.currentTime);

        audio.addEventListener("loadedmetadata", setAudioData);
        audio.addEventListener("timeupdate", setAudioTime);
        audio.addEventListener("ended", () => setIsPlaying(false)); // Reset play state on end

        // Set initial volume
        audio.volume = volume;

        return () => {
            audio.removeEventListener("loadedmetadata", setAudioData);
            audio.removeEventListener("timeupdate", setAudioTime);
            audio.removeEventListener("ended", () => setIsPlaying(false));
        };
    }, []);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeSliderChange = (value: number[]) => {
        if (audioRef.current) {
            const newTime = value[0];
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const handleVolumeChange = (value: number[]) => {
        const newVolume = value[0];
        setVolume(newVolume);
        setIsMuted(newVolume === 0); // Mute if volume is 0
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    const formatTime = (seconds: number = 0) => {
        if (isNaN(seconds) || !isFinite(seconds)) {
            return "0:00";
        }
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    return (
        <div className="bg-[#faf7f5]/60 backdrop-blur-lg rounded-xl p-4 shadow-lg border border-border/30 w-full">
            <audio
                ref={audioRef}
                src={src}
                className="hidden"
                preload="metadata" // Preload metadata for duration
            />

            <div className="flex items-center gap-4 mb-3">
                <Button
                    onClick={togglePlay}
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0"
                >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                </Button>

                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium truncate text-slate-700" title={title}>{title}</h3>
                    <p className="text-xs text-muted-foreground">Bedtime Story</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        onClick={toggleMute}
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground h-8 w-8"
                    >
                        {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <Slider
                        defaultValue={[1]}
                        value={[isMuted ? 0 : volume]}
                        max={1}
                        step={0.05}
                        className="w-20 h-2 [&>span:first-child]:h-2 [&>span:first-child>span]:h-2 [&>span:first-child>span]:w-2 [&>span:first-child>span]:border-2"
                        onValueChange={handleVolumeChange}
                        aria-label="Volume"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <Slider
                    defaultValue={[0]}
                    value={[currentTime]}
                    max={duration || 0}
                    step={1}
                    className="w-full h-2 [&>span:first-child]:h-2 [&>span:first-child>span]:h-2 [&>span:first-child>span]:w-2 [&>span:first-child>span]:border-2"
                    onValueChange={handleTimeSliderChange}
                    disabled={!duration} // Disable slider if duration is not loaded
                    aria-label="Playback progress"
                />

                <div className="flex justify-between text-xs text-muted-foreground px-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>
        </div>
    );
}