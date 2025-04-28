export default function StoryContent({ text }: { text: string | null }) {
    if (!text) {
      return (
        <p className="italic text-muted-foreground text-center py-8">
          Story text not available.
        </p>
      );
    }
  
    // Split text into paragraphs
    const paragraphs = text.split(/\n\n|\r\n\r\n/).filter(p => p.trim().length > 0);
    
    return (
      <div className="space-y-4">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="leading-relaxed text-foreground/90">
            {paragraph}
          </p>
        ))}
      </div>
    );
  }