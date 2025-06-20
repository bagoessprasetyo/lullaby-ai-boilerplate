'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, Sparkles, Volume2, Image, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GenerationStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  progress?: number;
}

interface StoryStatus {
  id: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  currentStep: string;
  progress: number;
  error?: string;
  estimatedTimeRemaining?: number;
}

export default function StoryCreatingPage({ params }: { params: { id: string } }) {
  const [storyStatus, setStoryStatus] = useState<StoryStatus | null>(null);
  const [steps, setSteps] = useState<GenerationStep[]>([
    {
      id: 'story-generation',
      title: 'Writing Your Story',
      description: 'AI is crafting a personalized story based on your preferences',
      icon: <Sparkles className="w-5 h-5" />,
      status: 'pending'
    },
    {
      id: 'audio-generation', 
      title: 'Creating Narration',
      description: 'Converting your story into beautiful narrated audio',
      icon: <Volume2 className="w-5 h-5" />,
      status: 'pending'
    },
    {
      id: 'image-generation',
      title: 'Generating Illustrations', 
      description: 'Creating magical illustrations to bring your story to life',
      icon: <Image className="w-5 h-5" />,
      status: 'pending'
    }
  ]);

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    const pollStoryStatus = async () => {
      try {
        const response = await fetch(`/api/stories/${params.id}/status`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch story status');
        }

        const status: StoryStatus = await response.json();
        setStoryStatus(status);

        // Update steps based on current status
        setSteps(prevSteps => prevSteps.map(step => {
          if (status.currentStep === step.id) {
            return { ...step, status: 'in-progress', progress: status.progress };
          } else if (isStepCompleted(step.id, status.currentStep)) {
            return { ...step, status: 'completed', progress: 100 };
          } else {
            return { ...step, status: 'pending' };
          }
        }));

        // Handle completion
        if (status.status === 'completed') {
          clearInterval(pollInterval);
          toast({
            title: "Success",
            description: "Your story is ready!"
          });
          
          // Small delay to show completion state
          setTimeout(() => {
            router.push(`/story/${params.id}`);
          }, 1500);
        }

        // Handle errors
        if (status.status === 'error') {
          clearInterval(pollInterval);
          setSteps(prevSteps => prevSteps.map(step => 
            step.id === status.currentStep 
              ? { ...step, status: 'error' } 
              : step
          ));
        }

      } catch (error) {
        console.error('Error polling story status:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to check story status"
        });
      }
    };

    // Start polling immediately
    pollStoryStatus();
    
    // Set up interval polling
    pollInterval = setInterval(pollStoryStatus, 3000);

    // Cleanup
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [params.id, router, toast]);

  const isStepCompleted = (stepId: string, currentStep: string): boolean => {
    const stepOrder = ['story-generation', 'audio-generation', 'image-generation'];
    const stepIndex = stepOrder.indexOf(stepId);
    const currentIndex = stepOrder.indexOf(currentStep);
    return stepIndex < currentIndex;
  };

  const handleRetry = async () => {
    try {
      const response = await fetch(`/api/stories/${params.id}/retry`, {
        method: 'POST'
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Retrying story generation..."
        });
        // Reset all steps to pending
        setSteps(steps => steps.map(step => ({ ...step, status: 'pending' })));
      } else {
        throw new Error('Failed to retry');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to retry story generation"
      });
    }
  };

  const getStepIcon = (step: GenerationStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'in-progress':
        return <Loader2 className="w-5 h-5 animate-spin text-primary" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/20" />;
    }
  };

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s remaining`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s remaining`;
  };

  if (!storyStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p>Initializing story creation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Creating Your Magical Story</h1>
          <p className="text-muted-foreground">
            Our AI is working hard to bring your story to life
          </p>
        </div>

        {/* Overall Progress */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Progress
            </CardTitle>
            <CardDescription>
              {storyStatus.estimatedTimeRemaining && 
                formatTimeRemaining(storyStatus.estimatedTimeRemaining)
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={storyStatus.progress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              {storyStatus.progress}% complete
            </p>
          </CardContent>
        </Card>

        {/* Generation Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <Card key={step.id} className={`transition-all duration-300 ${
              step.status === 'in-progress' ? 'border-primary shadow-lg' : ''
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getStepIcon(step)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {step.description}
                    </p>
                    
                    {step.status === 'in-progress' && step.progress !== undefined && (
                      <Progress value={step.progress} className="w-full h-2" />
                    )}
                    
                    {step.status === 'error' && (
                      <div className="mt-2">
                        <p className="text-sm text-red-600 dark:text-red-400">
                          Something went wrong with this step
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      step.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                      step.status === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                      step.status === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                      'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {step.status === 'completed' ? 'Done' :
                       step.status === 'in-progress' ? 'Working...' :
                       step.status === 'error' ? 'Error' :
                       'Waiting'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Error State */}
        {storyStatus.status === 'error' && (
          <Card className="mt-6 border-red-200 dark:border-red-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <XCircle className="w-5 h-5 text-red-500" />
                <h3 className="font-medium text-red-700 dark:text-red-400">
                  Story Generation Failed
                </h3>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                {storyStatus.error || 'An unexpected error occurred during story generation.'}
              </p>
              <div className="flex gap-2">
                <Button onClick={handleRetry} variant="outline" size="sm">
                  Try Again
                </Button>
                <Button 
                  onClick={() => router.push('/dashboard')} 
                  variant="ghost" 
                  size="sm"
                >
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success State */}
        {storyStatus.status === 'completed' && (
          <Card className="mt-6 border-green-200 dark:border-green-900">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-medium text-green-700 dark:text-green-400 mb-2">
                Your Story is Ready!
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400">
                Redirecting to your new story...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/dashboard')}
            className="text-muted-foreground"
          >
            ← Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}