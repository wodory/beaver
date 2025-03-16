import { BeaverLogo } from "@/components/ui/beaver-logo";

interface MetricsHeaderProps {
  title: string;
  subtitle?: string;
}

export function MetricsHeader({ title, subtitle }: MetricsHeaderProps) {
  return (
    <div className="flex flex-col space-y-1.5 mb-6">
      <div className="flex items-center text-lg font-semibold">
        <BeaverLogo size={24} className="mr-2" />
        <span className="text-muted-foreground">Beaver</span>
        <span className="mx-2 text-muted-foreground">&gt;</span>
        <span>{title}</span>
      </div>
      {subtitle && (
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
} 