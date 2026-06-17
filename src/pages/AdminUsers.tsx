import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface Row {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  country: string | null;
  admin_verified: boolean;
  vat_status: string;
  is_suspended: boolean;
  created_at: string;
  last_active_at: string | null;
  insurance_doc_status: string;
  vat_number: string | null;
  role?: string;
  completion: number;
}

export default function AdminUsers() {
  const { user, role, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    const { data: profs } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    const ids = (profs || []).map((p) => p.id);
    let roleMap = new Map<string, string>();
    if (ids.length) {
      const { data: roles } = await supabase.from("user_roles").select("user_id,role").in("user_id", ids);
      (roles || []).forEach((r: any) => roleMap.set(r.user_id, r.role));
    }
    // batch completion
    const withCompletion = await Promise.all(
      (profs || []).map(async (p: any) => {
        const { data } = await supabase.rpc("profile_completion_pct", { _user_id: p.id });
        return { ...p, completion: typeof data === "number" ? data : 0, role: roleMap.get(p.id) };
      })
    );
    setRows(withCompletion as Row[]);
    setLoading(false);
  };

  useEffect(() => { if (role === "admin") load(); }, [role]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!user) return <Navigate to="/auth?mode=login" replace />;
  if (role !== "admin") return <Navigate to="/" replace />;

  const toggleVerified = async (r: Row) => {
    const next = !r.admin_verified;
    await supabase.from("profiles").update({ admin_verified: next, vat_status: next ? "verified" : (r.vat_number ? "pending" : "unverified") }).eq("id", r.id);
    toast.success(next ? "Marked verified" : "Verification removed");
    load();
  };
  const toggleSuspended = async (r: Row) => {
    await supabase.from("profiles").update({ is_suspended: !r.is_suspended }).eq("id", r.id);
    toast.success(!r.is_suspended ? "Account suspended" : "Account re-enabled");
    load();
  };
  const verifyInsurance = async (r: Row) => {
    await supabase.from("profiles").update({ insurance_doc_status: "verified" }).eq("id", r.id);
    toast.success("Insurance verified");
    load();
  };

  const filtered = rows.filter((r) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      (r.email || "").toLowerCase().includes(s) ||
      (r.company_name || "").toLowerCase().includes(s) ||
      (r.full_name || "").toLowerCase().includes(s) ||
      (r.country || "").toLowerCase().includes(s)
    );
  });

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <Input placeholder="Search by name, email, country..." value={q} onChange={(e) => setQ(e.target.value)} className="mb-4 max-w-sm" />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Member since</TableHead>
              <TableHead>Profile</TableHead>
              <TableHead>Last active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={9} className="text-center py-6"><Loader2 className="h-4 w-4 animate-spin inline" /></TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-6">No users.</TableCell></TableRow>
            ) : filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <Link to={`/profile/${r.role === "carrier" ? "carrier" : "shipper"}/${r.id}`} className="hover:underline font-medium">
                    {r.company_name || r.full_name || "—"}
                  </Link>
                  {r.is_suspended && <Badge variant="outline" className="ml-2 bg-destructive/10 text-destructive border-destructive/30">Suspended</Badge>}
                </TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell className="capitalize">{r.role || "—"}</TableCell>
                <TableCell>{r.country || "—"}</TableCell>
                <TableCell>
                  {r.admin_verified ? <Badge className="bg-primary/10 text-primary border-primary/20">Verified</Badge> : r.vat_status === "pending" ? <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/30">Pending</Badge> : "—"}
                </TableCell>
                <TableCell>{format(new Date(r.created_at), "MMM d, yyyy")}</TableCell>
                <TableCell>{r.completion}%</TableCell>
                <TableCell>{r.last_active_at ? format(new Date(r.last_active_at), "MMM d, yyyy") : "—"}</TableCell>
                <TableCell className="text-right space-x-1 whitespace-nowrap">
                  <Button size="sm" variant="outline" onClick={() => toggleVerified(r)}>
                    {r.admin_verified ? "Unverify" : "Verify"}
                  </Button>
                  {r.insurance_doc_status === "uploaded" || r.insurance_doc_status === "pending" ? (
                    <Button size="sm" variant="outline" onClick={() => verifyInsurance(r)}>Verify ins.</Button>
                  ) : null}
                  <Button size="sm" variant={r.is_suspended ? "outline" : "destructive"} onClick={() => toggleSuspended(r)}>
                    {r.is_suspended ? <><ShieldCheck className="h-3 w-3 mr-1" /> Restore</> : <><ShieldOff className="h-3 w-3 mr-1" /> Suspend</>}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
