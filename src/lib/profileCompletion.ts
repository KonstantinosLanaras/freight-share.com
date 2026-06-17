// Profile completion utilities shared by shipper & carrier profile pages.

export type CompletionItem = {
  key: string;
  label: string;
  done: boolean;
};

type AnyProfile = Record<string, any> | null | undefined;

function arrFilled(v: any) {
  return Array.isArray(v) && v.length > 0;
}

function strFilled(v: any) {
  return typeof v === "string" && v.trim().length > 0;
}

export function shipperChecklist(p: AnyProfile): CompletionItem[] {
  return [
    { key: "company_name", label: "Add your company name", done: strFilled(p?.company_name) },
    { key: "logo_url", label: "Upload your company logo", done: strFilled(p?.logo_url) },
    { key: "bio", label: "Write a short bio", done: strFilled(p?.bio) },
    { key: "country", label: "Set your primary country", done: strFilled(p?.country) },
    { key: "contact_email", label: "Add a contact email", done: strFilled(p?.contact_email) },
    { key: "vat_number", label: "Add your VAT number", done: strFilled(p?.vat_number) },
    { key: "preferred_cargo_types", label: "Pick preferred cargo types", done: arrFilled(p?.preferred_cargo_types) },
    { key: "shipment_frequency", label: "Set a typical shipment frequency", done: strFilled(p?.shipment_frequency) },
  ];
}

export function carrierChecklist(p: AnyProfile): CompletionItem[] {
  return [
    { key: "company_name", label: "Add your company name", done: strFilled(p?.company_name) },
    { key: "logo_url", label: "Upload your company logo", done: strFilled(p?.logo_url) },
    { key: "fleet_description", label: "Describe your fleet", done: strFilled(p?.fleet_description) },
    { key: "operating_countries", label: "Add operating countries", done: arrFilled(p?.operating_countries) },
    { key: "contact_email", label: "Add a contact email", done: strFilled(p?.contact_email) },
    { key: "vat_number", label: "Add your VAT number", done: strFilled(p?.vat_number) },
    { key: "vehicle_types", label: "Pick vehicle types", done: arrFilled(p?.vehicle_types) },
    { key: "max_pallet_capacity", label: "Set max pallet capacity", done: typeof p?.max_pallet_capacity === "number" && p.max_pallet_capacity > 0 },
    { key: "operator_licence", label: "Add operator licence number", done: strFilled(p?.operator_licence) },
    { key: "insurance_doc", label: "Upload insurance document", done: ["uploaded", "pending", "verified"].includes(p?.insurance_doc_status) },
  ];
}

export function pct(items: CompletionItem[]) {
  if (!items.length) return 0;
  return Math.round((items.filter((i) => i.done).length / items.length) * 100);
}

export const CARGO_TYPES = ["Pallets", "Fragile", "Refrigerated", "Hazmat", "Oversized"] as const;
export const SHIPMENT_FREQUENCIES = ["Daily", "Weekly", "Monthly", "Ad hoc"] as const;
export const VEHICLE_TYPES = ["Curtainsider", "Box Truck", "Reefer", "Flatbed", "Tanker", "Van"] as const;
