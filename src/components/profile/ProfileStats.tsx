import { Card } from "@/components/ui/card";

export interface Stat {
  label: string;
  value: string | number;
  hint?: string;
}

export function ProfileStats({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
      {stats.map((s) => (
        <Card key={s.label} className="p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
          <div className="mt-1 text-2xl font-semibold">{s.value}</div>
          {s.hint && <div className="text-xs text-muted-foreground mt-1">{s.hint}</div>}
        </Card>
      ))}
    </div>
  );
}
