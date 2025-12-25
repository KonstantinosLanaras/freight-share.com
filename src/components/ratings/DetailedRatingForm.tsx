import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DetailedRatingFormProps {
  shipmentId: string;
  raterId: string;
  ratedId: string;
  raterRole: 'shipper' | 'carrier';
  ratedName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface RatingCategory {
  key: 'timeliness' | 'communication' | 'reliability' | 'accuracy';
  label: string;
  description: string;
}

const carrierCategories: RatingCategory[] = [
  { key: 'timeliness', label: 'Timeliness', description: 'On-time pickup & delivery' },
  { key: 'communication', label: 'Service Quality', description: 'Communication & professionalism' },
  { key: 'reliability', label: 'Condition of Delivery', description: 'Handling & care of goods' },
  { key: 'accuracy', label: 'Price Accuracy', description: 'Matched agreed terms' },
];

const shipperCategories: RatingCategory[] = [
  { key: 'timeliness', label: 'Timeliness', description: 'Readiness of goods' },
  { key: 'communication', label: 'Communication', description: 'Communication & cooperation' },
  { key: 'reliability', label: 'Shipment Accuracy', description: 'Accuracy of shipment description' },
  { key: 'accuracy', label: 'Payment Reliability', description: 'Timely & accurate payment' },
];

function StarRating({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="p-1 transition-transform hover:scale-110"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >
          <Star
            className={`h-6 w-6 transition-colors ${
              star <= (hovered || value)
                ? 'fill-warning text-warning'
                : 'text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function DetailedRatingForm({
  shipmentId,
  raterId,
  ratedId,
  raterRole,
  ratedName,
  onSuccess,
  onCancel,
}: DetailedRatingFormProps) {
  const [ratings, setRatings] = useState({
    timeliness: 0,
    communication: 0,
    reliability: 0,
    accuracy: 0,
  });
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = raterRole === 'shipper' ? carrierCategories : shipperCategories;
  const isComplete = Object.values(ratings).every((r) => r > 0);
  const overallScore = isComplete
    ? (Object.values(ratings).reduce((a, b) => a + b, 0) / 4).toFixed(1)
    : '-';

  const handleSubmit = async () => {
    if (!isComplete) {
      toast.error('Please rate all categories');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('detailed_ratings').insert({
        shipment_id: shipmentId,
        rater_id: raterId,
        rated_id: ratedId,
        rater_role: raterRole,
        timeliness_score: ratings.timeliness,
        communication_score: ratings.communication,
        reliability_score: ratings.reliability,
        accuracy_score: ratings.accuracy,
        comment: comment.trim() || null,
      });

      if (error) throw error;

      toast.success('Rating submitted successfully');
      onSuccess?.();
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      toast.error(error.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Rate {ratedName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating Categories */}
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.key} className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <Label className="font-medium">{category.label}</Label>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
              <StarRating
                value={ratings[category.key]}
                onChange={(value) => setRatings({ ...ratings, [category.key]: value })}
              />
            </div>
          ))}
        </div>

        {/* Overall Score */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <span className="font-medium">Overall Score</span>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-warning text-warning" />
            <span className="text-xl font-bold">{overallScore}</span>
            <span className="text-muted-foreground">/ 5</span>
          </div>
        </div>

        {/* Comment */}
        <div>
          <Label htmlFor="comment">Comment (optional)</Label>
          <Textarea
            id="comment"
            placeholder="Share your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mt-2"
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={submitting || !isComplete}>
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Submit Rating
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
