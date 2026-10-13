import { CheckCircle, PencilSimple } from "@phosphor-icons/react";
import { useState } from "react";
import { AssumptionTag } from "../../../components/ui/AssumptionTag";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Field, inputClass } from "../../../components/ui/Field";
import { Modal } from "../../../components/ui/Modal";
import type { Profile } from "../../../data/parent";
import { validateProfile, type ProfileForm } from "./summary";

const FORM_ID = "profile-edit-form";

function EditModal({ profile, onClose, onSave }: { profile: Profile; onClose: () => void; onSave: (f: ProfileForm) => void }) {
  const [form, setForm] = useState<ProfileForm>({ address: profile.address, mailingAddress: profile.mailingAddress, contact: profile.contact });
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileForm, string>>>({});
  const set = (k: keyof ProfileForm) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateProfile(form);
    setErrors(errs);
    if (Object.keys(errs).length === 0) onSave({ address: form.address.trim(), mailingAddress: form.mailingAddress.trim(), contact: form.contact.trim() });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit contact details"
      footer={<>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" form={FORM_ID}>Save changes</Button>
      </>}
    >
      <form id={FORM_ID} onSubmit={submit} noValidate className="space-y-4">
        <p className="flex flex-wrap items-center gap-2">
          <AssumptionTag />
          <span>Only address, mailing address and contact number can be changed. Name and NRIC come from SingPass.</span>
        </p>
        <Field required label="Residential address" error={errors.address} hint="Include the 6-digit postal code.">
          <textarea rows={2} value={form.address} onChange={set("address")} className={`${inputClass} py-2`} autoComplete="street-address" />
        </Field>
        <Field required label="Mailing address" error={errors.mailingAddress}>
          <textarea rows={2} value={form.mailingAddress} onChange={set("mailingAddress")} className={`${inputClass} py-2`} />
        </Field>
        <Field required label="Contact number" error={errors.contact}>
          <input type="tel" value={form.contact} onChange={set("contact")} className={inputClass} autoComplete="tel" />
        </Field>
      </form>
    </Modal>
  );
}

export function ProfileCard({ profile, onSave }: { profile: Profile; onSave: (f: ProfileForm) => void }) {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const rows: [string, string][] = [
    ["Name", profile.name],
    ["NRIC", profile.nric],
    ["Residential address", profile.address],
    ["Mailing address", profile.mailingAddress],
    ["Contact number", profile.contact],
  ];
  return (
    <Card
      title="Your details"
      action={<Button size="sm" variant="secondary" icon={<PencilSimple size={16} aria-hidden="true" />} onClick={() => { setSaved(false); setEditing(true); }}>Edit</Button>}
    >
      {saved && (
        <p role="status" className="mb-3 flex items-center gap-2 rounded-control border border-line bg-success-container px-3 py-2 text-sm font-medium text-success">
          <CheckCircle size={18} weight="bold" aria-hidden="true" /> Details updated.
        </p>
      )}
      <dl className="space-y-3">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt className="text-[13px] text-on-surface-variant">{k}</dt>
            <dd className="text-sm font-medium">{v}</dd>
          </div>
        ))}
      </dl>
      {editing && (
        <EditModal
          profile={profile}
          onClose={() => setEditing(false)}
          onSave={(f) => { onSave(f); setEditing(false); setSaved(true); }}
        />
      )}
    </Card>
  );
}
