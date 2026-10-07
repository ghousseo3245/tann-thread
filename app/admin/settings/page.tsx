"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Info } from "lucide-react";
import { clsx } from "clsx";
import { inputClass } from "../_shared";
import {
  DEFAULT_WHATSAPP_OWNER_NUMBER,
  SETTINGS_DEFAULTS,
  loadAdminSettings,
  saveAdminSetting,
  type SettingKey,
} from "@/lib/site-settings";
import { Skeleton } from "@/components/ui/skeleton";

type FieldDef = {
  key: SettingKey;
  label: string;
  help: string;
  placeholder: string;
  multiline?: boolean;
  inputMode?: "text" | "numeric" | "email" | "tel";
};

const FIELDS: FieldDef[] = [
  {
    key: "announcement_text",
    label: "Announcement bar text",
    help: "Shown in the announcement bar at the top of every store page. Leave empty to keep the default rotating messages.",
    placeholder: "e.g. Complimentary shipping on orders over Rs 15,000",
    multiline: true,
  },
  {
    key: "whatsapp_owner_number",
    label: "WhatsApp owner number",
    help: `Order alerts are sent to this number. Digits only, country code without the plus sign (e.g. 923001234567). The default is ${DEFAULT_WHATSAPP_OWNER_NUMBER}: saving a different number overrides it. Clearing the field falls back to the WHATSAPP_OWNER_NUMBER environment variable, then the default.`,
    placeholder: "923001234567",
    inputMode: "numeric",
  },
  {
    key: "support_phone",
    label: "Support phone",
    help: "Shown in the store footer and on the contact page when set.",
    placeholder: "e.g. 0300 1234567",
    inputMode: "tel",
  },
  {
    key: "support_email",
    label: "Support email",
    help: "Shown in the store footer and on the contact page when set.",
    placeholder: "e.g. support@tannandthread.pk",
    inputMode: "email",
  },
];

function SettingField({
  field,
  stored,
  onSaved,
}: {
  field: FieldDef;
  stored: string | undefined;
  onSaved: (key: SettingKey, value: string) => void;
}) {
  // Pre-fill with the built-in default when nothing is stored yet.
  const initial = stored ?? SETTINGS_DEFAULTS[field.key] ?? "";
  const [draft, setDraft] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setDraft(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stored]);

  const dirty = draft !== initial;

  async function handleSave() {
    setError("");
    setSaved(false);
    let value = draft.trim();
    if (field.key === "whatsapp_owner_number") {
      value = value.replace(/\D/g, "");
    }
    setBusy(true);
    try {
      await saveAdminSetting(field.key, value);
      onSaved(field.key, value);
      setDraft(value);
      setSaved(true);
    } catch {
      setError("Could not save. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const inputId = `setting-${field.key}`;

  return (
    <section className="rounded-2xl border border-espresso/10 bg-white p-5">
      <label
        htmlFor={inputId}
        className="block text-sm font-semibold text-espresso"
      >
        {field.label}
      </label>
      {field.multiline ? (
        <textarea
          id={inputId}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setSaved(false);
          }}
          rows={2}
          placeholder={field.placeholder}
          className={clsx(inputClass, "mt-2")}
        />
      ) : (
        <input
          id={inputId}
          type={field.inputMode === "email" ? "email" : "text"}
          inputMode={field.inputMode === "email" ? "email" : field.inputMode}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setSaved(false);
          }}
          placeholder={field.placeholder}
          className={clsx(inputClass, "mt-2")}
        />
      )}
      <p className="mt-1.5 text-xs leading-relaxed text-espresso/55">{field.help}</p>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={busy || !dirty}
          className="inline-flex items-center justify-center rounded-full bg-espresso px-5 py-2 text-sm font-medium text-ivory transition-colors hover:bg-espresso-deep disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Saving..." : "Save"}
        </button>
        {saved ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Saved
          </span>
        ) : null}
        {error ? (
          <span className="text-sm font-medium text-[#8C2F2F]">{error}</span>
        ) : null}
      </div>
    </section>
  );
}

export default function SettingsPage() {
  const [values, setValues] = useState<Record<string, string> | null>(null);
  const [live, setLive] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAdminSettings()
      .then(({ values, live }) => {
        setValues(values);
        setLive(live);
      })
      .catch(() => {
        setError("Could not load settings. Please refresh the page.");
      });
  }, []);

  function handleSaved(key: SettingKey, value: string) {
    setValues((prev) => ({ ...(prev ?? {}), [key]: value }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-espresso">Settings</h1>
        <p className="mt-1 text-sm text-espresso/60">
          Store-wide details editable without touching code.
        </p>
      </div>

      {error ? (
        <p className="rounded-xl border border-[#8C2F2F]/20 bg-[#8C2F2F]/5 px-4 py-3 text-sm font-medium text-[#8C2F2F]">
          {error}
        </p>
      ) : null}

      {!live && values !== null ? (
        <div className="flex gap-3 rounded-2xl border border-cognac/25 bg-cognac/10 px-4 py-3 text-sm text-espresso">
          <Info className="h-5 w-5 shrink-0 text-cognac" aria-hidden="true" />
          <p>
            Demo mode: Supabase is not configured, so settings are stored in this
            browser only. They will sync to the live database once Supabase is set up.
          </p>
        </div>
      ) : null}

      {values === null && !error ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        FIELDS.map((field) => (
          <SettingField
            key={field.key}
            field={field}
            stored={values?.[field.key]}
            onSaved={handleSaved}
          />
        ))
      )}
    </div>
  );
}
