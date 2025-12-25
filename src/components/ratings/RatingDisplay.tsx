import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingDisplayProps {
  overallScore: number;
  ratingsCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function RatingDisplay({
  overallScore,
  ratingsCount,
  size = 'md',
  showLabel = true,
  className,
}: RatingDisplayProps) {
  const sizeClasses = {
    sm: { star: 'h-3 w-3', text: 'text-sm', gap: 'gap-0.5' },
    md: { star: 'h-4 w-4', text: 'text-base', gap: 'gap-1' },
    lg: { star: 'h-5 w-5', text: 'text-lg', gap: 'gap-1' },
  };

  const { star, text, gap } = sizeClasses[size];
  const fullStars = Math.floor(overallScore);
  const hasHalfStar = overallScore % 1 >= 0.5;

  return (
    <div className={cn('flex items-center', gap, className)}>
      <div className={cn('flex', gap)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              star,
              i <= fullStars
                ? 'fill-warning text-warning'
                : i === fullStars + 1 && hasHalfStar
                ? 'fill-warning/50 text-warning'
                : 'text-muted-foreground/30'
            )}
          />
        ))}
      </div>
      {showLabel && (
        <span className={cn('font-medium', text)}>
          {overallScore.toFixed(1)}
        </span>
      )}
      {ratingsCount !== undefined && (
        <span className="text-muted-foreground text-sm">
          ({ratingsCount})
        </span>
      )}
    </div>
  );
}

interface DetailedRatingDisplayProps {
  timeliness: number;
  communication: number;
  reliability: number;
  accuracy: number;
  raterRole: 'shipper' | 'carrier';
  comment?: string | null;
}

const carrierLabels = {
  timeliness: 'Timeliness',
  communication: 'Service Quality',
  reliability: 'Condition of Delivery',
  accuracy: 'Price Accuracy',
};

const shipperLabels = {
  timeliness: 'Timeliness',
  communication: 'Communication',
  reliability: 'Shipment Accuracy',
  accuracy: 'Payment Reliability',
};

export function DetailedRatingDisplay({
  timeliness,
  communication,
  reliability,
  accuracy,
  raterRole,
  comment,
}: DetailedRatingDisplayProps) {
  const labels = raterRole === 'carrier' ? carrierLabels : shipperLabels;
  const categories = [
    { key: 'timeliness', score: timeliness },
    { key: 'communication', score: communication },
    { key: 'reliability', score: reliability },
    { key: 'accuracy', score: accuracy },
  ];
  const overallScore = (timeliness + communication + reliability + accuracy) / 4;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <span className="font-medium">Overall</span>
        <div className="flex items-center gap-2">
          <RatingDisplay overallScore={overallScore} size="md" />
        </div>
      </div>
      {categories.map(({ key, score }) => (
        <div key={key} className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {labels[key as keyof typeof labels]}
          </span>
          <RatingDisplay overallScore={score} size="sm" showLabel={false} />
        </div>
      ))}
      {comment && (
        <div className="pt-3 border-t border-border">
          <p className="text-sm text-muted-foreground italic">"{comment}"</p>
        </div>
      )}
    </div>
  );
}
