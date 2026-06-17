import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CARGO_TYPES, SHIPMENT_FREQUENCIES, VEHICLE_TYPES } from "@/lib/profileCompletion";
import { SchengenCountrySelect } from "@/components/SchengenCountrySelect";
import { CalendarIcon, Upload } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  profile: any;
  mode: "shipper" | "carrier";
  onSaved: () => void;
}

export function EditProfileDialog({ open, onOpenChange, profile, mode, onSaved }: Props) {
  const [form, setForm] = useState<any>(profile || {});
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(profile || {}); }, [profile, open]);

  const update = (patch: any) => setForm((f: any) => ({ ...f, ...patch }));
  const toggleIn = (key: string, val: string) => {
    const cur: string[] = Array.isArray(form[key]) ? form[key] : [];
    update({ [key]: cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val] });
  };

  const uploadLogo = async (file: File) => {
    if (!profile?.id) return;
    const ext = file.name.split(".").pop();
    const path = `${profile.id}/logo-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("company-logos").upload(path, file, { upsert: true });
    if (upErr) { toast.error("Upload failed: " + upErr.message); return; }
    const { data } = await supabase.storage.from("company-logos").createSignedUrl(path, 60 * 60 * 24 * 365);
    if (data?.signedUrl) update({ logo_url: data.signedUrl });
  };

  const onSave = async () => {
    setSaving(true);
    const patch: any = {
      company_name: form.company_name,
      bio: form.bio?.slice(0, 200),
      country: form.country,
      contact_email: form.contact_email,
      logo_url: form.logo_url,
      preferred_cargo_types: form.preferred_cargo_types || [],
    };
    const vatChanged = (profile?.vat_number || "") !== (form.vat_number || "");
    if (vatChanged) {
      patch.vat_number = form.vat_number;
      patch.vat_status = form.vat_number ? "pending" : "unverified";
      patch.admin_verified = false;
    }
    if (mode === "shipper") {
      patch.shipment_frequency = form.shipment_frequency;
    } else {
      patch.fleet_description = form.fleet_description?.slice(0, 200);
      patch.operating_countries = form.operating_countries || [];
      patch.vehicle_types = form.vehicle_types || [];
      patch.max_pallet_capacity = form.max_pallet_capacity ? Number(form.max_pallet_capacity) : null;
      patch.operator_licence = form.operator_licence;
      patch.cmr_insurance = !!form.cmr_insurance;
      patch.cmr_expiry = form.cmr_expiry || null;
      patch.route_flexibility_default = !!form.route_flexibility_default;
    }
    const { error } = await supabase.from("profiles").update(patch).eq("id", profile.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile updated");
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Company logo</Label>
            <div className="flex items-center gap-3 mt-1">
              {form.logo_url && <img src={form.logo_url} alt="logo" className="h-12 w-12 rounded object-cover" />}
              <label className="inline-flex items-center gap-2 text-sm cursor-pointer border rounded px-3 py-2 hover:bg-accent">
                <Upload className="h-4 w-4" /> Upload
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && uploadLogo(e.target.files[0])} />
              </label>
            </div>
          </div>

          <div>
            <Label>Company name</Label>
            <Input value={form.company_name || ""} onChange={(e) => update({ company_name: e.target.value })} />
          </div>

          <div>
            <Label>Bio (max 200)</Label>
            <Textarea maxLength={200} value={form.bio || ""} onChange={(e) => update({ bio: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Primary country</Label>
              <SchengenCountrySelect value={form.country || ""} onValueChange={(v) => update({ country: v })} />
            </div>
            <div>
              <Label>Contact email</Label>
              <Input type="email" value={form.contact_email || ""} onChange={(e) => update({ contact_email: e.target.value })} />
            </div>
          </div>

          <div>
            <Label>VAT number</Label>
            <Input value={form.vat_number || ""} onChange={(e) => update({ vat_number: e.target.value })} />
            <p className="text-xs text-muted-foreground mt-1">Saving a new VAT number sets your verification to Pending until an admin approves it.</p>
          </div>

          <div>
            <Label>Preferred cargo types</Label>
            <div className="flex flex-wrap gap-3 mt-2">
              {CARGO_TYPES.map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={(form.preferred_cargo_types || []).includes(c)} onCheckedChange={() => toggleIn("preferred_cargo_types", c)} />
                  {c}
                </label>
              ))}
            </div>
          </div>

          {mode === "shipper" && (
            <div>
              <Label>Typical shipment frequency</Label>
              <Select value={form.shipment_frequency || ""} onValueChange={(v) => update({ shipment_frequency: v })}>
                <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
                <SelectContent>
                  {SHIPMENT_FREQUENCIES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {mode === "carrier" && (
            <>
              <div>
                <Label>Fleet description (max 200)</Label>
                <Textarea maxLength={200} value={form.fleet_description || ""} onChange={(e) => update({ fleet_description: e.target.value })} />
              </div>
              <div>
                <Label>Primary operating countries</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(form.operating_countries || []).map((c: string) => (
                    <span key={c} className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                      {c}
                      <button onClick={() => toggleIn("operating_countries", c)} className="ml-1">×</button>
                    </span>
                  ))}
                </div>
                <div className="mt-2">
                  <SchengenCountrySelect
                    value=""
                    onValueChange={(v) => v && !(form.operating_countries || []).includes(v) && update({ operating_countries: [...(form.operating_countries || []), v] })}
                  />
                </div>
              </div>
              <div>
                <Label>Vehicle types</Label>
                <div className="flex flex-wrap gap-3 mt-2">
                  {VEHICLE_TYPES.map((v) => (
                    <label key={v} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={(form.vehicle_types || []).includes(v)} onCheckedChange={() => toggleIn("vehicle_types", v)} />
                      {v}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Max pallet capacity</Label>
                  <Input type="number" step="1" value={form.max_pallet_capacity ?? ""} onChange={(e) => update({ max_pallet_capacity: e.target.value })} />
                </div>
                <div>
                  <Label>Operator licence #</Label>
                  <Input value={form.operator_licence || ""} onChange={(e) => update({ operator_licence: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={!!form.cmr_insurance} onCheckedChange={(v) => update({ cmr_insurance: !!v })} />
                  CMR insurance
                </label>
                {form.cmr_insurance && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className={cn(!form.cmr_expiry && "text-muted-foreground")}>
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {form.cmr_expiry ? format(new Date(form.cmr_expiry), "PPP") : "Expiry date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={form.cmr_expiry ? new Date(form.cmr_expiry) : undefined}
                        onSelect={(d) => update({ cmr_expiry: d ? format(d, "yyyy-MM-dd") : null })}
                        className={cn("p-3 pointer-events-auto")} />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={!!form.route_flexibility_default} onCheckedChange={(v) => update({ route_flexibility_default: v })} />
                <Label className="m-0">Route flexibility default</Label>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSave} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
