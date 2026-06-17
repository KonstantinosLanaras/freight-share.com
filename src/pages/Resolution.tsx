import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, Plus, ArrowLeft, AlertTriangle, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

type IssueType = 'late_delivery' | 'cargo_damage' | 'no_show' | 'payment_dispute' | 'route_deviation' | 'other';
type Status = 'open' | 'under_review' | 'decision_pending' | 'resolved';

interface CaseRow {
  id: string;
  subject: string;
  issue_type: IssueType;
  status: Status;
  shipment_id: string | null;
  shipper_id: string;
  carrier_id: string;
  opened_at: string;
  counterparty_name?: string;
  unread_count?: number;
  shipment_summary?: string;
}

const issueLabels: Record<IssueType, string> = {
  late_delivery: 'Late delivery',
  cargo_damage: 'Cargo damage',
  no_show: 'No-show',
  payment_dispute: 'Payment dispute',
  route_deviation: 'Route deviation',
  other: 'Other',
};

const statusStyle: Record<Status, string> = {
  open: 'bg-amber-100 text-amber-800',
  under_review: 'bg-blue-100 text-blue-800',
  decision_pending: 'bg-purple-100 text-purple-800',
  resolved: 'bg-success/10 text-success',
};

const statusLabel: Record<Status, string> = {
  open: 'Open',
  under_review: 'Under Review',
  decision_pending: 'Decision Pending',
  resolved: 'Resolved',
};

export default function Resolution() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newCase, setNewCase] = useState({
    shipment_id: '',
    issue_type: 'other' as IssueType,
    subject: '',
    description: '',
  });
  const [shipments, setShipments] = useState<{ id: string; label: string; shipper_id: string; carrier_id: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const loadCases = async () => {
    if (!user) return;
    setLoading(true);
    const { data: rows, error } = await supabase
      .from('resolution_cases')
      .select('*')
      .or(`shipper_id.eq.${user.id},carrier_id.eq.${user.id}`)
      .order('opened_at', { ascending: false });
    if (error) {
      toast.error('Failed to load cases');
      setLoading(false);
      return;
    }
    // Enrich with counterparty name + unread count
    const enriched: CaseRow[] = await Promise.all(
      (rows || []).map(async (c) => {
        const counterpartyId = c.shipper_id === user.id ? c.carrier_id : c.shipper_id;
        const { data: prof } = await supabase
          .from('profiles')
          .select('full_name, company_name')
          .eq('id', counterpartyId)
          .maybeSingle();
        let shipment_summary = '';
        if (c.shipment_id) {
          const { data: ship } = await supabase
            .from('shipments')
            .select('load_id')
            .eq('id', c.shipment_id)
            .maybeSingle();
          if (ship?.load_id) {
            const { data: load } = await supabase
              .from('loads')
              .select('origin_city, destination_city')
              .eq('id', ship.load_id)
              .maybeSingle();
            if (load) shipment_summary = `${load.origin_city} → ${load.destination_city}`;
          }
        }
        const { data: msgs } = await supabase
          .from('resolution_messages')
          .select('id, read_by')
          .eq('case_id', c.id);
        const unread_count = (msgs || []).filter((m) => {
          const arr = Array.isArray(m.read_by) ? (m.read_by as unknown[]) : [];
          return !arr.includes(user.id);
        }).length;
        return {
          ...c,
          counterparty_name: prof?.company_name || prof?.full_name || 'Counterparty',
          unread_count,
          shipment_summary,
        } as CaseRow;
      }),
    );
    setCases(enriched);
    setLoading(false);
  };

  const loadShipments = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('shipments')
      .select('id, shipper_id, carrier_id, load_id')
      .or(`shipper_id.eq.${user.id},carrier_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(50);
    if (!data) return;
    const enriched = await Promise.all(
      data.map(async (s) => {
        const { data: load } = await supabase
          .from('loads')
          .select('origin_city, destination_city')
          .eq('id', s.load_id)
          .maybeSingle();
        return {
          id: s.id,
          shipper_id: s.shipper_id,
          carrier_id: s.carrier_id,
          label: load ? `${load.origin_city} → ${load.destination_city}` : s.id.slice(0, 8),
        };
      }),
    );
    setShipments(enriched);
  };

  useEffect(() => {
    loadCases();
    loadShipments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const submitNew = async () => {
    if (!user) return;
    if (!newCase.subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }
    if (!newCase.shipment_id) {
      toast.error('Please select a shipment');
      return;
    }
    const ship = shipments.find((s) => s.id === newCase.shipment_id);
    if (!ship) return;
    setSubmitting(true);
    const { data, error } = await supabase
      .from('resolution_cases')
      .insert({
        shipment_id: ship.id,
        shipper_id: ship.shipper_id,
        carrier_id: ship.carrier_id,
        opened_by: user.id,
        issue_type: newCase.issue_type,
        subject: newCase.subject.trim(),
        description: newCase.description.trim() || null,
      })
      .select()
      .single();
    if (error || !data) {
      toast.error(error?.message || 'Failed to open case');
      setSubmitting(false);
      return;
    }
    // System welcome message
    await supabase.from('resolution_messages').insert({
      case_id: data.id,
      sender_role: 'system',
      body: 'Your case has been received. A team member will review within 24 hours.',
    });
    setSubmitting(false);
    setOpenDialog(false);
    toast.success('Case opened');
    navigate(`/resolution/${data.id}`);
  };

  const open = cases.filter((c) => c.status !== 'resolved');
  const closed = cases.filter((c) => c.status === 'resolved');

  const renderList = (rows: CaseRow[]) => {
    if (rows.length === 0) {
      return (
        <Card><CardContent className="py-10 text-center text-muted-foreground">No cases here.</CardContent></Card>
      );
    }
    return (
      <div className="space-y-3">
        {rows.map((c) => (
          <Link key={c.id} to={`/resolution/${c.id}`}>
            <Card className="hover:border-primary transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant="secondary">{issueLabels[c.issue_type]}</Badge>
                      <Badge className={statusStyle[c.status]}>{statusLabel[c.status]}</Badge>
                      {c.unread_count ? (
                        <Badge className="bg-destructive text-destructive-foreground">{c.unread_count} new</Badge>
                      ) : null}
                    </div>
                    <h3 className="font-semibold text-foreground truncate">{c.subject}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      With{' '}
                      <Link
                        to={`/profile/${role === 'shipper' ? 'carrier' : 'shipper'}/${role === 'shipper' ? c.carrier_id : c.shipper_id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:underline"
                      >
                        {c.counterparty_name}
                      </Link>
                      {c.shipment_summary ? ` · ${c.shipment_summary}` : ''}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(c.opened_at), 'PP')}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2">Case #{c.id.slice(0, 8)}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </div>

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-heading font-bold flex items-center gap-2">
              <ShieldAlert className="h-7 w-7 text-primary" /> Resolution Center
            </h1>
            <p className="text-muted-foreground mt-1">
              Open and manage disputes or issues for your shipments. Our support team can join any case if needed.
            </p>
          </div>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" /> New case</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Open a new case</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Shipment</Label>
                  <Select value={newCase.shipment_id} onValueChange={(v) => setNewCase({ ...newCase, shipment_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select a shipment" /></SelectTrigger>
                    <SelectContent>
                      {shipments.length === 0 && <div className="px-3 py-2 text-sm text-muted-foreground">No shipments found</div>}
                      {shipments.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.label} · #{s.id.slice(0, 6)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Issue type</Label>
                  <Select value={newCase.issue_type} onValueChange={(v) => setNewCase({ ...newCase, issue_type: v as IssueType })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(issueLabels) as IssueType[]).map((k) => (
                        <SelectItem key={k} value={k}>{issueLabels[k]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Subject</Label>
                  <Input value={newCase.subject} onChange={(e) => setNewCase({ ...newCase, subject: e.target.value })} placeholder="Short summary of the issue" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea rows={4} value={newCase.description} onChange={(e) => setNewCase({ ...newCase, description: e.target.value })} placeholder="Describe what happened" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
                <Button onClick={submitNew} disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Open case
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin inline" /></div>
        ) : (
          <Tabs defaultValue="open">
            <TabsList>
              <TabsTrigger value="open">Open ({open.length})</TabsTrigger>
              <TabsTrigger value="closed">Resolved ({closed.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="open" className="mt-4">{renderList(open)}</TabsContent>
            <TabsContent value="closed" className="mt-4">{renderList(closed)}</TabsContent>
          </Tabs>
        )}

        {open.length === 0 && !loading && (
          <div className="mt-6 p-4 rounded-md border border-border bg-muted/30 text-sm text-muted-foreground flex gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>ReRoute is a technical facilitator. Cases are reviewed by our team within 24 hours and resolved according to platform terms.</span>
          </div>
        )}
      </div>
    </div>
  );
}
