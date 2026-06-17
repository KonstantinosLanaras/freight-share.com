import { useEffect, useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Pencil, Star, Upload } from "lucide-react";
import { format } from "date-fns";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileStats, Stat } from "@/components/profile/ProfileStats";
import { ProfileCompletion } from "@/components/profile/ProfileCompletion";
import { ReviewsSection, Review } from "@/components/profile/ReviewsSection";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { carrierChecklist, pct } from "@/lib/profileCompletion";
import { ProfileLink } from "@/components/profile/ProfileLink";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 10;

export default function CarrierProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user, role, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [activeRoutes, setActiveRoutes] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ routes: 0, completed: 0, onTime: 0, avgRating: 0, earned: 0 });
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

    const [{ count: routesCount }, { data: openRoutes }, { data: ships }, { data: revs }] = await Promise.all([
      supabase.from("routes").select("id", { count: "exact", head: true }).eq("carrier_id", userId),
      supabase.from("routes").select("*").eq("carrier_id", userId).in("status", ["planned", "active"]).order("created_at", { ascending: false }).limit(5),
      supabase.from("shipments").select("id,status,final_price,created_at,shipper_id,delivery_marked_at,load_id,loads(origin_city,destination_city,pallets,delivery_date_to)").eq("carrier_id", userId).order("created_at", { ascending: false }),
      supabase.from("ratings").select("*").eq("rated_id", userId).order("created_at", { ascending: false }),
    ]);

    const completedShips = (ships || []).filter((s: any) => ["delivered", "completed", "executed"].includes(s.status));
    const earned = completedShips.reduce((sum, s: any) => sum + (Number(s.final_price) || 0), 0);
    const onTimeEligible = completedShips.filter((s: any) => s.loads?.delivery_date_to && s.delivery_marked_at);
    const onTimeCount = onTimeEligible.filter((s: any) => new Date(s.delivery_marked_at) <= new Date(s.loads.delivery_date_to)).length;
    const onTime = onTimeEligible.length ? Math.round((onTimeCount / onTimeEligible.length) * 100) : 0;
    const avgRating = revs && revs.length ? revs.reduce((s: number, r: any) => s + r.score, 0) / revs.length : 0;

    const shipperIds = Array.from(new Set((ships || []).map((s: any) => s.shipper_id).filter(Boolean)));
    let shipperMap: Record<string, string> = {};
    if (shipperIds.length) {
      const { data: sps } = await supabase.from("profiles").select("id,company_name,full_name").in("id", shipperIds);
      shipperMap = Object.fromEntries((sps || []).map((p: any) => [p.id, p.company_name || p.full_name || "Shipper"]));
    }

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

    const shipmentIds = (ships || []).map((s: any) => s.id);
    let givenMap: Record<string, number> = {};
    if (shipmentIds.length) {
      const { data: given } = await supabase.from("ratings").select("shipment_id,score").in("shipment_id", shipmentIds).eq("rater_id", userId);
      givenMap = Object.fromEntries((given || []).map((g: any) => [g.shipment_id, g.score]));
    }

    setActiveRoutes(openRoutes || []);
    setHistory((ships || []).map((s: any) => ({
      ...s,
      shipper_name: shipperMap[s.shipper_id] || "Shipper",
      rating_given: givenMap[s.id] || null,
    })));
    setReviews((revs || []).map((r: any) => ({
      id: r.id,
      rater_id: r.rater_id,
      rater_name: raterMap[r.rater_id]?.name || "User",
      rater_role: raterMap[r.rater_id]?.role || "shipper",
      score: r.score,
      comment: r.comment,
      created_at: r.created_at,
    })));
    setStats({ routes: routesCount || 0, completed: completedShips.length, onTime, avgRating, earned });
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [userId, user?.id]);

  const uploadInsurance = async (file: File) => {
    if (!profile?.id) return;
    const ext = file.name.split(".").pop();
    const path = `${profile.id}/insurance-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("insurance-documents").upload(path, file, { upsert: true });
    if (error) { toast.error(error.message); return; }
    await supabase.from("profiles").update({ insurance_doc_status: "uploaded" }).eq("id", profile.id);
    toast.success("Insurance document uploaded — pending review");
    load();
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!user) return <Navigate to="/auth?mode=login" replace />;
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!profile) return <div className="p-8 text-center">Profile not found.</div>;
  if (profile.is_suspended && !isOwn && role !== "admin") {
    return <div className="p-8 text-center text-muted-foreground">This account has been suspended.</div>;
  }

  const checklist = carrierChecklist(profile);
  const completion = pct(checklist);

  const baseStats: Stat[] = [
    { label: "Routes posted", value: stats.routes },
    { label: "Completed shipments", value: stats.completed },
    { label: "On-time delivery", value: `${stats.onTime}%` },
    { label: "Avg rating", value: stats.avgRating ? stats.avgRating.toFixed(1) : "—" },
  ];
  if (isOwn) baseStats.push({ label: "Total earned", value: `€${stats.earned.toLocaleString()}` });

  const pageRows = history.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(history.length / PAGE_SIZE));

  const insStatus = profile.insurance_doc_status || "none";

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      {isOwn && <ProfileCompletion items={checklist} />}

      <div className="flex items-start justify-between gap-4">
        <ProfileHeader
          companyName={profile.company_name || profile.full_name || "Carrier"}
          logoUrl={profile.logo_url}
          memberSince={profile.created_at}
          countries={profile.operating_countries?.length ? profile.operating_countries : (profile.country ? [profile.country] : [])}
          bio={profile.fleet_description}
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
          <h2 className="text-xl font-semibold">Active routes</h2>
          {isOwn && <Link to="/dashboard/carrier/routes" className="text-sm text-primary hover:underline">View all</Link>}
        </div>
        {activeRoutes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active routes.</p>
        ) : (
          <div className="grid gap-2">
            {activeRoutes.map((r) => (
              <Card key={r.id} className="p-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-medium">{r.origin_city}, {r.origin_country} → {r.destination_city}, {r.destination_country}</span>
                <span className="text-muted-foreground">{r.available_pallets} pallets · {format(new Date(r.departure_date_from), "MMM d")}</span>
                <div className="flex items-center gap-2">
                  {r.open_to_extra_stops && <Badge className="bg-primary/10 text-primary border-primary/20">Flexible</Badge>}
                  <Badge variant="outline">{r.status}</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Route history</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead>Shipper</TableHead>
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
                    <ProfileLink userId={s.shipper_id} role="shipper">{s.shipper_name}</ProfileLink>
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

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Fleet & compliance</h2>
        <Card className="p-4 grid gap-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs uppercase text-muted-foreground">Vehicle types</div>
              <div className="mt-1">{profile.vehicle_types?.length ? profile.vehicle_types.join(", ") : "—"}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-muted-foreground">Max pallet capacity</div>
              <div className="mt-1">{profile.max_pallet_capacity ?? "—"}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-muted-foreground">Operator licence</div>
              <div className="mt-1">{profile.operator_licence || "—"}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-muted-foreground">CMR insurance</div>
              <div className="mt-1">
                {profile.cmr_insurance ? `Yes${profile.cmr_expiry ? ` · expires ${format(new Date(profile.cmr_expiry), "MMM yyyy")}` : ""}` : "No"}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase text-muted-foreground">Insurance document</div>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="outline" className={
                  insStatus === "verified" ? "bg-primary/10 text-primary border-primary/20" :
                  insStatus === "pending" ? "bg-yellow-500/10 text-yellow-700 border-yellow-500/30" :
                  insStatus === "uploaded" ? "bg-blue-500/10 text-blue-700 border-blue-500/30" :
                  "text-muted-foreground"
                }>
                  {insStatus === "none" ? "Not uploaded" : insStatus[0].toUpperCase() + insStatus.slice(1)}
                </Badge>
                {isOwn && (
                  <label className="inline-flex items-center gap-1 cursor-pointer text-xs border rounded px-2 py-1 hover:bg-accent">
                    <Upload className="h-3 w-3" /> Upload / Replace
                    <input type="file" className="hidden" onChange={(e) => e.target.files && uploadInsurance(e.target.files[0])} />
                  </label>
                )}
              </div>
            </div>
          </div>
        </Card>
      </section>

      <ReviewsSection reviews={reviews} />

      <EditProfileDialog open={editing} onOpenChange={setEditing} profile={profile} mode="carrier" onSaved={load} />
    </div>
  );
}
