import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

/** Marks a load/route whose pickup or departure window has already passed. */
export function PassedBadge() {
  return (
    <Badge variant="outline" className="text-muted-foreground border-muted-foreground/40 bg-muted">
      <Clock className="h-3 w-3 mr-1" />
      Passed
    </Badge>
  );
}
