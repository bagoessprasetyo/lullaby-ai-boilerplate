export default function CharacterCard({ character }: { character: { name: string; description: string } }) {
    return (
      <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
        <h4 className="font-medium mb-1">{character.name}</h4>
        <p className="text-sm text-muted-foreground">{character.description}</p>
      </div>
    );
  }