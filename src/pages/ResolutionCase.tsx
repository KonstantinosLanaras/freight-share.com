import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft, Send, Upload, CheckCircle2, AlertTriangle, FileDown, Paperclip, ShieldAlert, Headphones } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

type Status = 'open' | 'under_review' | 'decision_pending' | 'resolved';
type SenderRole = 'shipper' | 'carrier' | 'support' | 'system';
type IssueType = 'late_delivery' | 'cargo_damage' | 'no_show' | 'payment_dispute' | 'route_deviation' | 'other';

interface CaseData {
  id: string;
  subject: string;
  description: string | null;
  issue_type: IssueType;
  status: Status;
  shipment_id: string | null;
  shipper_id: string;
  carrier_id: string;
  opened_by: string;
  opened_at: string;
  shipper_resolved: boolean;
  carrier_resolved: boolean;
}

interface Message {
  id: string;
  case_id: string;
  sender_id: string | null;
  sender_role: SenderRole;
  body: string;
  created_at: string;
  read_by: unknown;
}

interface Evidence {
  id: string;
  file_path: string;
  kind: string;
  description: string | null;
  created_at: string;
  uploader_id: string;
}

const issueLabels: Record<IssueType, string> = {
  late_delivery: 'Late delivery',
  cargo_damage: 'Cargo damage',
  no_show: 'No-show',
  payment_dispute: 'Payment dispute',
  route_deviation: 'Route deviation',
  other: 'Other',
};

const statusOrder: Status[] = ['open', 'under_review', 'decision_pending', 'resolved'];
const statusLabel: Record<Status, string> = {
  open: 'Opened',
  under_review: 'Under Review',
  decision_pending: 'Decision Pending',
  resolved: 'Resolved',
};

export default function ResolutionCase() {
  const { caseId } = useParams<{ caseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [shipmentSummary, setShipmentSummary] = useState<string>('');
  const [timeline, setTimeline] = useState<{ label: string; at: string }[]>([]);
  const [shipperName, setShipperName] = useState('');
  const [carrierName, setCarrierName] = useState('');
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const role: 'shipper' | 'carrier' | 'support' =
    caseData && user
      ? user.id === caseData.shipper_id
        ? 'shipper'
        : user.id === caseData.carrier_id
          ? 'carrier'
          : 'support'
      : 'support';

  const load = async () => {
    if (!caseId) return;
    setLoading(true);
    const { data: c, error } = await supabase
      .from('resolution_cases')
      .select('*')
      .eq('id', caseId)
      .maybeSingle();
    if (error || !c) {
      toast.error('Case not found');
      navigate('/resolution');
      return;
    }
    setCaseData(c as CaseData);
    const [{ data: msgs }, { data: ev }, { data: shipper }, { data: carrier }] = await Promise.all([
      supabase.from('resolution_messages').select('*').eq('case_id', caseId).order('created_at', { ascending: true }),
      supabase.from('resolution_evidence').select('*').eq('case_id', caseId).order('created_at', { ascending: false }),
      supabase.from('profiles').select('full_name, company_name').eq('id', c.shipper_id).maybeSingle(),
      supabase.from('profiles').select('full_name, company_name').eq('id', c.carrier_id).maybeSingle(),
    ]);
    setMessages((msgs || []) as Message[]);
    setEvidence((ev || []) as Evidence[]);
    setShipperName(shipper?.company_name || shipper?.full_name || 'Shipper');
    setCarrierName(carrier?.company_name || carrier?.full_name || 'Carrier');
    if (c.shipment_id) {
      const { data: ship } = await supabase.from('shipments').select('*').eq('id', c.shipment_id).maybeSingle();
      if (ship) {
        const { data: l } = await supabase
          .from('loads')
          .select('origin_city, destination_city, pickup_date_from')
          .eq('id', ship.load_id)
          .maybeSingle();
        if (l) setShipmentSummary(`${l.origin_city} → ${l.destination_city}`);
        const events: { label: string; at: string }[] = [];
        if (ship.created_at) events.push({ label: 'Shipment created', at: ship.created_at });
        if (ship.delivery_marked_at) events.push({ label: 'Delivery marked', at: ship.delivery_marked_at });
        const { data: ts } = await supabase.from('shipment_timestamps').select('*').eq('shipment_id', ship.id);
        (ts || []).forEach((t) => events.push({ label: t.event_type, at: t.recorded_at || t.created_at }));
        events.push({ label: 'Case opened', at: c.opened_at });
        events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
        setTimeline(events);
      }
    } else {
      setTimeline([{ label: 'Case opened', at: c.opened_at }]);
    }
    setLoading(false);
    // mark messages as read
    if (user && msgs && msgs.length) {
      const unread = msgs.filter((m) => {
        const arr = Array.isArray(m.read_by) ? (m.read_by as unknown[]) : [];
        return !arr.includes(user.id);
      });
      for (const m of unread) {
        const arr = Array.isArray(m.read_by) ? (m.read_by as unknown[]) : [];
        await supabase.from('resolution_messages').update({ read_by: [...arr, user.id] as never }).eq('id', m.id);
      }
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  // Realtime
  useEffect(() => {
    if (!caseId) return;
    const channel = supabase
      .channel(`resolution_${caseId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'resolution_messages', filter: `case_id=eq.${caseId}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'resolution_cases', filter: `id=eq.${caseId}` }, (payload) => {
        setCaseData(payload.new as CaseData);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [caseId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  const send = async () => {
    if (!draft.trim() || !caseData || !user) return;
    setSending(true);
    const role: SenderRole = user.id === caseData.shipper_id ? 'shipper' : user.id === caseData.carrier_id ? 'carrier' : 'support';
    const { error } = await supabase.from('resolution_messages').insert({
      case_id: caseData.id,
      sender_id: user.id,
      sender_role: role,
      body: draft.trim(),
      read_by: [user.id] as never,
    });
    setSending(false);
    if (error) { toast.error(error.message); return; }
    setDraft('');
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !caseData || !user) return;
    setUploading(true);
    const path = `${caseData.id}/${Date.now()}_${file.name}`;
    const { error: upErr } = await supabase.storage.from('resolution-evidence').upload(path, file);
    if (upErr) { toast.error(upErr.message); setUploading(false); return; }
    const kind = file.type.startsWith('image/') ? 'photo' : file.name.toLowerCase().includes('cmr') ? 'cmr' : file.name.toLowerCase().includes('invoice') ? 'invoice' : 'other';
    const { data: ev, error: insErr } = await supabase.from('resolution_evidence').insert({
      case_id: caseData.id, uploader_id: user.id, file_path: path, kind, description: file.name,
    }).select().single();
    setUploading(false);
    if (insErr || !ev) { toast.error(insErr?.message || 'Upload failed'); return; }
    setEvidence((prev) => [ev as Evidence, ...prev]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.success('Evidence uploaded');
  };

  const downloadEvidence = async (path: string) => {
    const { data, error } = await supabase.storage.from('resolution-evidence').createSignedUrl(path, 60);
    if (error || !data) { toast.error('Could not load file'); return; }
    window.open(data.signedUrl, '_blank');
  };

  const markResolved = async () => {
    if (!caseData || !user) return;
    const field = role === 'shipper' ? 'shipper_resolved' : 'carrier_resolved';
    const updates: Record<string, unknown> = { [field]: true };
    const otherResolved = role === 'shipper' ? caseData.carrier_resolved : caseData.shipper_resolved;
    if (otherResolved) {
      updates.status = 'resolved';
      updates.resolved_at = new Date().toISOString();
    }
    const { error } = await supabase.from('resolution_cases').update(updates).eq('id', caseData.id);
    if (error) { toast.error(error.message); return; }
    await supabase.from('resolution_messages').insert({
      case_id: caseData.id, sender_id: user.id, sender_role: 'system',
      body: otherResolved ? 'Both parties marked the case as resolved. Case closed.' : `${role === 'shipper' ? 'Shipper' : 'Carrier'} marked the case as resolved. Waiting for the other party to confirm.`,
    });
    toast.success(otherResolved ? 'Case closed' : 'Marked as resolved on your side');
    load();
  };

  const escalate = async () => {
    if (!caseData || !user) return;
    const { error } = await supabase.from('resolution_cases').update({ status: 'under_review' }).eq('id', caseData.id);
    if (error) { toast.error(error.message); return; }
    await supabase.from('resolution_messages').insert({
      case_id: caseData.id, sender_id: user.id, sender_role: 'system',
      body: 'Case escalated to ReRoute Support for review.',
    });
    toast.success('Escalated to support');
  };

  const downloadSummary = () => {
    if (!caseData) return;
    const lines: string[] = [];
    lines.push(`ReRoute Resolution Case Summary`);
    lines.push(`Case ID: ${caseData.id}`);
    lines.push(`Subject: ${caseData.subject}`);
    lines.push(`Issue: ${issueLabels[caseData.issue_type]}`);
    lines.push(`Status: ${statusLabel[caseData.status]}`);
    lines.push(`Opened: ${format(new Date(caseData.opened_at), 'PPpp')}`);
    lines.push(`Shipper: ${shipperName}`);
    lines.push(`Carrier: ${carrierName}`);
    if (shipmentSummary) lines.push(`Shipment: ${shipmentSummary}`);
    if (caseData.description) lines.push(`\nDescription:\n${caseData.description}`);
    lines.push(`\n--- Timeline ---`);
    timeline.forEach((t) => lines.push(`${format(new Date(t.at), 'PPpp')} — ${t.label}`));
    lines.push(`\n--- Messages ---`);
    messages.forEach((m) => {
      const who = m.sender_role === 'shipper' ? shipperName : m.sender_role === 'carrier' ? carrierName : m.sender_role === 'support' ? 'ReRoute Support' : 'System';
      lines.push(`[${format(new Date(m.created_at), 'PPpp')}] ${who}: ${m.body}`);
    });
    lines.push(`\n--- Evidence ---`);
    evidence.forEach((e) => lines.push(`${format(new Date(e.created_at), 'PPpp')} — ${e.kind}: ${e.description || e.file_path}`));
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `case-${caseData.id.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !caseData) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const senderName = (m: Message) =>
    m.sender_role === 'shipper' ? shipperName :
    m.sender_role === 'carrier' ? carrierName :
    m.sender_role === 'support' ? 'ReRoute Support' : 'System';

  const senderBadge = (r: SenderRole) =>
    r === 'support' ? <Badge className="bg-primary text-primary-foreground gap-1"><Headphones className="h-3 w-3" />Support</Badge>
    : r === 'system' ? <Badge variant="secondary">System</Badge>
    : r === 'shipper' ? <Badge variant="outline">Shipper</Badge>
    : <Badge variant="outline">Carrier</Badge>;

  const stepIndex = statusOrder.indexOf(caseData.status);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/resolution')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> All cases
        </Button>

        {/* Header */}
        <Card className="mb-4">
          <CardContent className="p-5">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge variant="secondary">{issueLabels[caseData.issue_type]}</Badge>
                  <span className="text-xs text-muted-foreground">Case #{caseData.id.slice(0, 8)}</span>
                </div>
                <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-primary" /> {caseData.subject}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {shipperName} ↔ {carrierName}{shipmentSummary ? ` · ${shipmentSummary}` : ''}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {caseData.status !== 'resolved' && (
                  <>
                    <Button variant="outline" size="sm" onClick={markResolved}>
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Mark as resolved
                    </Button>
                    {caseData.status === 'open' && (
                      <Button variant="outline" size="sm" onClick={escalate}>
                        <AlertTriangle className="h-4 w-4 mr-1" /> Escalate
                      </Button>
                    )}
                  </>
                )}
                <Button variant="outline" size="sm" onClick={downloadSummary}>
                  <FileDown className="h-4 w-4 mr-1" /> Download summary
                </Button>
              </div>
            </div>

            {/* Status tracker */}
            <div className="mt-5 flex items-center gap-2">
              {statusOrder.map((s, i) => (
                <div key={s} className="flex items-center flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${i <= stepIndex ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{i + 1}</div>
                  <div className={`ml-2 text-xs ${i <= stepIndex ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{statusLabel[s]}</div>
                  {i < statusOrder.length - 1 && <div className={`flex-1 h-px mx-2 ${i < stepIndex ? 'bg-primary' : 'bg-border'}`} />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Left: timeline + evidence */}
          <div className="space-y-4">
            {caseData.description && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Description</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap">{caseData.description}</CardContent>
              </Card>
            )}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Timeline</CardTitle></CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {timeline.map((t, i) => (
                    <li key={i} className="text-sm">
                      <div className="font-medium text-foreground">{t.label}</div>
                      <div className="text-xs text-muted-foreground">{format(new Date(t.at), 'PPp')}</div>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base">Evidence</CardTitle>
                <div>
                  <Input ref={fileInputRef} type="file" className="hidden" onChange={handleFile} />
                  <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    {uploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Upload className="h-4 w-4 mr-1" />} Upload
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {evidence.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No files uploaded yet. Add photos, CMR, or invoices.</p>
                ) : (
                  <ul className="space-y-2">
                    {evidence.map((e) => (
                      <li key={e.id}>
                        <button onClick={() => downloadEvidence(e.file_path)} className="text-sm text-primary hover:underline flex items-center gap-2">
                          <Paperclip className="h-3.5 w-3.5" /> {e.description || e.file_path.split('/').pop()}
                          <Badge variant="secondary" className="ml-1">{e.kind}</Badge>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: chat */}
          <Card className="lg:col-span-2 flex flex-col h-[70vh]">
            <CardHeader className="pb-2 border-b"><CardTitle className="text-base">Conversation</CardTitle></CardHeader>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <p className="text-sm text-muted-foreground text-center">No messages yet.</p>
              )}
              {messages.map((m) => {
                const mine = m.sender_id === user?.id;
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg p-3 ${m.sender_role === 'system' ? 'bg-muted/60 text-muted-foreground text-sm w-full text-center' : mine ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      {m.sender_role !== 'system' && (
                        <div className="flex items-center gap-2 mb-1 text-xs opacity-90">
                          {senderBadge(m.sender_role)}
                          <span className={mine ? 'text-primary-foreground/80' : 'text-muted-foreground'}>{senderName(m)}</span>
                        </div>
                      )}
                      <div className="text-sm whitespace-pre-wrap">{m.body}</div>
                      <div className={`text-[10px] mt-1 ${mine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{format(new Date(m.created_at), 'PPp')}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t p-3 flex gap-2 items-end">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder={caseData.status === 'resolved' ? 'Case is resolved — chat is read-only' : 'Type a message and press Enter'}
                rows={2}
                disabled={caseData.status === 'resolved'}
                className="resize-none"
              />
              <Button onClick={send} disabled={sending || !draft.trim() || caseData.status === 'resolved'}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
