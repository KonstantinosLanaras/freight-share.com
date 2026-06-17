import { useEffect, useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Pencil, Star } from "lucide-react";
import { format } from "date-fns";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileStats, Stat } from "@/components/profile/ProfileStats";
import { ProfileCompletion } from "@/components/profile/ProfileCompletion";
import { ReviewsSection, Review } from "@/components/profile/ReviewsSection";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { shipperChecklist, pct } from "@/lib/profileCompletion";
import { ProfileLink } from "@/components/profile/ProfileLink";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 10;

export default function ShipperProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user, role, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [activeLoads, setActiveLoads] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<{ loads: number; completed: number; acceptance: number; spend: number }>({ loads: 0, completed: 0, acceptance: 0, spend: 0 });
  const [canSeeContact, setCanSeeContact] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [page, setPage] = useState(0);

  const isOwn = !!user && user.id === userId;

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    const { data: prof } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    setProfile(prof);
    if (prof && user && !isOwn) {
      const { data: shared } = await supabase.rpc("users_share_shipment", { _a: user.id, _b: userId });
      setCanSeeContact(!!shared);
    } else {
      setCanSeeContact(isOwn);
    }

    const [{ count: loadsCount }, { data: openLoads }, { data: ships }, { data: revs }] = await Promise.all([
      supabase.from("loads").select("id", { count: "exact", head: true }).eq("shipper_id", userId),
      supabase.from("loads").select("*").eq("shipper_id", userId).eq("status", "posted").order("created_at", { ascending: false }).limit(5),
      supabase.from("shipments").select("id,status,final_price,created_at,carrier_id,load_id,loads(origin_city,origin_country,destination_city,destination_country,pallets)").eq("shipper_id", userId).order("created_at", { ascending: false }),
      supabase.from("ratings").select("*").eq("rated_id", userId).order("created_at", { ascending: false }),
    ]);

    // Bid acceptance rate: offers tied to this shipper's loads
    const { data: shipperOffers } = await supabase
      .from("offers")
      .select("is_accepted,load_id,loads!inner(shipper_id)")
      .eq("loads.shipper_id", userId);
    const total = shipperOffers?.length || 0;
    const accepted = shipperOffers?.filter((o: any) => o.is_accepted).length || 0;
    const acceptance = total ? Math.round((accepted / total) * 100) : 0;

    const completed = (ships || []).filter((s: any) => s.status === "delivered" || s.status === "completed" || s.status === "executed").length;
    const spend = (ships || []).reduce((sum: number, s: any) => sum + (Number(s.final_price) || 0), 0);

    // Hydrate carrier names for the history table
    const carrierIds = Array.from(new Set((ships || []).map((s: any) => s.carrier_id).filter(Boolean)));
    let carrierMap: Record<string, string> = {};
    if (carrierIds.length) {
      const { data: cps } = await supabase.from("profiles").select("id,company_name,full_name").in("id", carrierIds);
      carrierMap = Object.fromEntries((cps || []).map((p: any) => [p.id, p.company_name || p.full_name || "Carrier"]));
    }

    // Rater names for reviews
    const raterIds = Array.from(new Set((revs || []).map((r: any) => r.rater_id)));
    let raterMap: Record<string, { name: string; role: "shipper" | "carrier" }> = {};
    if (raterIds.length) {
      const { data: rps } = await supabase.from("profiles").select("id,company_name,full_name").in("id", raterIds);
      const { data: rroles } = await supabase.from("user_roles").select("user_id,role").in("user_id", raterIds);
      const roleMap = new Map<string, string>();
      (rroles || []).forEach((r: any) => roleMap.set(r.user_id, r.role));
      raterMap = Object.fromEntries((rps || []).map((p: any) => [p.id, {
        name: p.company_name || p.full_name || "User",
        role: (roleMap.get(p.id) || "shipper") as "shipper" | "carrier",
      }]));
    }

    // Ratings the shipper gave (for history table)
    const shipmentIds = (ships || []).map((s: any) => s.id);
    let givenMap: Record<string, number> = {};
    if (shipmentIds.length) {
      const { data: given } = await supabase.from("ratings").select("shipment_id,score").in("shipment_id", shipmentIds).eq("rater_id", userId);
      givenMap = Object.fromEntries((given || []).map((g: any) => [g.shipment_id, g.score]));
    }

    setActiveLoads(openLoads || []);
    setHistory((ships || []).map((s: any) => ({
      ...s,
      carrier_name: carrierMap[s.carrier_id] || "Carrier",
      rating_given: givenMap[s.id] || null,
    })));
    setReviews((revs || []).map((r: any) => ({
      id: r.id,
      rater_id: r.rater_id,
      rater_name: raterMap[r.rater_id]?.name || "User",
      rater_role: raterMap[r.rater_id]?.role || "carrier",
      score: r.score,
      comment: r.comment,
      created_at: r.created_at,
    })));
    setStats({ loads: loadsCount || 0, completed, acceptance, spend });
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [userId, user?.id]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!user) return <Navigate to="/auth?mode=login" replace />;
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!profile) return <div className="p-8 text-center">Profile not found.</div>;
  if (profile.is_suspended && !isOwn && role !== "admin") {
    return <div className="p-8 text-center text-muted-foreground">This account has been suspended.</div>;
  }

  const checklist = shipperChecklist(profile);
  const completion = pct(checklist);

  const baseStats: Stat[] = [
    { label: "Loads posted", value: stats.loads },
    { label: "Completed shipments", value: stats.completed },
    { label: "Avg bid acceptance", value: `${stats.acceptance}%` },
  ];
  if (isOwn) baseStats.push({ label: "Total spend", value: `€${stats.spend.toLocaleString()}` });

  const pageRows = history.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(history.length / PAGE_SIZE));

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      {isOwn && <ProfileCompletion items={checklist} />}

      <div className="flex items-start justify-between gap-4">
        <ProfileHeader
          companyName={profile.company_name || profile.full_name || "Shipper"}
          logoUrl={profile.logo_url}
          memberSince={profile.created_at}
          countries={profile.country ? [profile.country] : []}
          bio={profile.bio}
          verified={profile.admin_verified}
          vatPending={profile.vat_status === "pending"}
          profileComplete={completion === 100}
        />
        {isOwn && (
          <Button onClick={() => setEditing(true)} variant="outline" size="sm">
            <Pencil className="h-4 w-4 mr-2" /> Edit profile
          </Button>
        )}
      </div>

      {canSeeContact && (profile.contact_email || profile.vat_number) && (
        <Card className="p-4 mt-4">
          <div className="text-xs uppercase text-muted-foreground mb-2">Contact</div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {profile.contact_email && <div><span className="text-muted-foreground">Email: </span>{profile.contact_email}</div>}
            {profile.vat_number && <div><span className="text-muted-foreground">VAT: </span>{profile.vat_number}</div>}
          </div>
        </Card>
      )}

      <ProfileStats stats={baseStats} />

      <section className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Active loads</h2>
          {isOwn && <Link to="/dashboard/shipper/loads" className="text-sm text-primary hover:underline">View all</Link>}
        </div>
        {activeLoads.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active loads.</p>
        ) : (
          <div className="grid gap-2">
            {activeLoads.map((l) => (
              <Card key={l.id} className="p-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-medium">{l.origin_city}, {l.origin_country} → {l.destination_city}, {l.destination_country}</span>
                <span className="text-muted-foreground">{l.pallets} pallets · {format(new Date(l.pickup_date_from), "MMM d")}</span>
                <Badge variant="outline">{l.status}</Badge>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Shipment history</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead>Carrier</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Pallets</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-6">No shipments yet.</TableCell></TableRow>
              ) : pageRows.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell>{s.loads ? `${s.loads.origin_city} → ${s.loads.destination_city}` : "—"}</TableCell>
                  <TableCell>
                    <ProfileLink userId={s.carrier_id} role="carrier">{s.carrier_name}</ProfileLink>
                  </TableCell>
                  <TableCell>{format(new Date(s.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell>{s.loads?.pallets ?? "—"}</TableCell>
                  <TableCell>{s.final_price ? `€${Number(s.final_price).toLocaleString()}` : "—"}</TableCell>
                  <TableCell>
                    {s.rating_given ? (
                      <span className="inline-flex items-center gap-1">{s.rating_given}<Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /></span>
                    ) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
        {history.length > PAGE_SIZE && (
          <div className="flex items-center justify-end gap-2 mt-3 text-sm">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Prev</Button>
            <span>{page + 1} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        )}
      </section>

      <ReviewsSection reviews={reviews} />

      <EditProfileDialog open={editing} onOpenChange={setEditing} profile={profile} mode="shipper" onSaved={load} />
    </div>
  );
}
