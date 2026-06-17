import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { CompletionItem, pct } from "@/lib/profileCompletion";
import { Card } from "@/components/ui/card";

export function ProfileCompletion({ items }: { items: CompletionItem[] }) {
  const [open, setOpen] = useState(false);
  const percent = pct(items);
  const remaining = items.filter((i) => !i.done);

  return (
    <Card className="p-4 mb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Profile {percent}% complete</span>
            {percent === 100 && (
              <span className="text-xs text-primary font-medium">All set</span>
            )}
          </div>
          <Progress value={percent} className="h-2" />
        </div>
        {remaining.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setOpen((o) => !o)}>
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <span className="ml-1">{remaining.length} left</span>
          </Button>
        )}
      </div>

      {open && (
        <ul className="mt-4 space-y-2">
          {items.map((i) => (
            <li key={i.key} className="flex items-center gap-2 text-sm">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                  i.done ? "bg-primary text-primary-foreground border-primary" : "border-muted-foreground/30"
                }`}
              >
                {i.done && <Check className="h-3 w-3" />}
              </span>
              <span className={i.done ? "text-muted-foreground line-through" : ""}>{i.label}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
