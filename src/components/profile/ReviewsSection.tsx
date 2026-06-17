import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export interface Review {
  id: string;
  rater_id: string;
  rater_name: string;
  rater_role?: "shipper" | "carrier";
  score: number;
  comment: string | null;
  created_at: string;
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i <= Math.round(value) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40"}`}
        />
      ))}
    </div>
  );
}

export function ReviewsSection({ reviews }: { reviews: Review[] }) {
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.score, 0) / reviews.length : 0;
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold mb-3">Reviews & Ratings</h2>
      <div className="flex items-center gap-3 mb-4">
        <div className="text-3xl font-bold">{avg.toFixed(1)}</div>
        <div>
          <Stars value={avg} />
          <div className="text-xs text-muted-foreground">{reviews.length} review{reviews.length === 1 ? "" : "s"}</div>
        </div>
      </div>
      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="flex items-center justify-between">
                <Link
                  to={`/profile/${r.rater_role === "shipper" ? "shipper" : "carrier"}/${r.rater_id}`}
                  className="font-medium hover:underline"
                >
                  {r.rater_name}
                </Link>
                <span className="text-xs text-muted-foreground">{format(new Date(r.created_at), "MMM d, yyyy")}</span>
              </div>
              <div className="mt-1"><Stars value={r.score} /></div>
              {r.comment && <p className="mt-2 text-sm text-foreground/80">{r.comment}</p>}
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
