"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useStore, type NewPropertyInput } from "@/lib/store/store";
import type { PropertyStatus } from "@/lib/types";

const STATUSES: PropertyStatus[] = ["Available", "Reserved", "Under Contract", "Sold"];

interface FormState extends Omit<NewPropertyInput, "features"> {
  features: string;
}

const EMPTY: FormState = {
  name: "",
  address: "",
  price: 650000,
  bedrooms: 3,
  bathrooms: 2,
  sqft: 1800,
  status: "Available",
  features: "Garage, Renovated Kitchen, Hardwood Floors",
};

export function AddPropertyDialog() {
  const addProperty = useStore((s) => s.addProperty);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const valid = form.name.trim() && form.address.trim() && form.price > 0;

  const submit = () => {
    if (!valid) return;
    addProperty({
      ...form,
      features: form.features.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setForm(EMPTY);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus /> Add Property</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Property</DialogTitle>
          <DialogDescription>List a property to your active inventory.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Property Name *" className="col-span-2">
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Maple Residence" />
          </Field>
          <Field label="Address *" className="col-span-2">
            <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="123 Maple St, Austin, TX" />
          </Field>
          <Field label="Price (USD) *">
            <Input type="number" value={form.price} onChange={(e) => set("price", Number(e.target.value))} />
          </Field>
          <Field label="Status">
            <Select
              value={form.status}
              onChange={(e) => set("status", e.target.value as PropertyStatus)}
              options={STATUSES.map((s) => ({ label: s, value: s }))}
            />
          </Field>
          <Field label="Bedrooms">
            <Input type="number" value={form.bedrooms} onChange={(e) => set("bedrooms", Number(e.target.value))} />
          </Field>
          <Field label="Bathrooms">
            <Input type="number" value={form.bathrooms} onChange={(e) => set("bathrooms", Number(e.target.value))} />
          </Field>
          <Field label="Square Feet" className="col-span-2">
            <Input type="number" value={form.sqft} onChange={(e) => set("sqft", Number(e.target.value))} />
          </Field>
          <Field label="Features (comma-separated)" className="col-span-2">
            <Input value={form.features} onChange={(e) => set("features", e.target.value)} placeholder="Pool, Garage, City View" />
          </Field>
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button onClick={submit} disabled={!valid}>Add Property</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
