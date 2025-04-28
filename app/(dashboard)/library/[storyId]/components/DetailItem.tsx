export default function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    );
  }