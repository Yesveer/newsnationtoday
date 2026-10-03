"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import type { UserProfileInput } from "@/lib/api/admin";

/** Matches the list the API accepts. It goes on the press card beside the
 *  emergency contact, so it is a pick, never free text. */
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

/** Everything about a person beyond name, email and role.
 *
 *  Shared by the "add user" dialog, the user detail page and a person's own
 *  profile, so the same fields are collected wherever they are filled in.
 *  `mode` decides what is required and what is frozen:
 *
 *    create       — phone, Aadhaar and the emergency contact are required
 *    self         — the person's own page: ID numbers and the emergency
 *                   contact are the personnel record and are read-only
 *    admin        — an administrator editing someone else: everything open
 *
 *  The staff ID is never editable in any mode; the server issues it. */
export function UserProfileFields({
  value,
  errors = {},
  onChange,
  showIdentity = true,
  identityMasked = false,
  mode = "admin",
}: {
  value: UserProfileInput;
  errors?: Record<string, string>;
  onChange: (next: UserProfileInput) => void;
  showIdentity?: boolean;
  /** When true the ID numbers shown are masked, so typing replaces them. */
  identityMasked?: boolean;
  mode?: "create" | "self" | "admin";
}) {
  const { t } = useAdminLang();
  const creating = mode === "create";
  const frozen = mode === "self";

  const set = (partial: UserProfileInput) => onChange({ ...value, ...partial });
  const setAddress = (partial: UserProfileInput["address"]) =>
    onChange({ ...value, address: { ...value.address, ...partial } });
  const setIdentity = (partial: UserProfileInput["identity"]) =>
    onChange({ ...value, identity: { ...value.identity, ...partial } });
  const setEmergency = (partial: UserProfileInput["emergencyContact"]) =>
    onChange({ ...value, emergencyContact: { ...value.emergencyContact, ...partial } });

  const field = (
    id: string,
    label: string,
    current: string | undefined,
    onInput: (next: string) => void,
    placeholder?: string,
    errorKey?: string,
    options?: { required?: boolean; readOnly?: boolean },
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {options?.required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </Label>
      <Input
        id={id}
        value={current ?? ""}
        onChange={(event) => onInput(event.target.value)}
        placeholder={placeholder}
        readOnly={options?.readOnly}
        aria-readonly={options?.readOnly}
        className={options?.readOnly ? "cursor-not-allowed bg-surface-muted text-text-muted" : undefined}
      />
      {errors[errorKey ?? id] ? (
        <p className="text-[11.5px] text-destructive">{errors[errorKey ?? id]}</p>
      ) : null}
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <section className="space-y-3">
        <p className="text-[11px] font-semibold tracking-wide text-text-muted uppercase">
          {t("संपर्क", "Contact")}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {field("phone", t("फ़ोन", "Phone"), value.phone, (next) => set({ phone: next }), "+91 98110 00000",
            "phone", { required: true })}
          {field("altPhone", t("दूसरा फ़ोन", "Alternate phone"), value.altPhone, (next) => set({ altPhone: next }))}
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-[11px] font-semibold tracking-wide text-text-muted uppercase">
          {t("काम", "Work")}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {field("desk", t("डेस्क / बीट", "Desk / beat"), value.desk, (next) => set({ desk: next }), t("जैसे: खेल", "e.g. Sports"))}
          {field(
            "reportingArea",
            t("रिपोर्टिंग एरिया", "Reporting area"),
            value.reportingArea,
            (next) => set({ reportingArea: next }),
            t("जैसे: लखनऊ", "e.g. Lucknow"),
          )}
          <div className="space-y-1.5">
            <Label htmlFor="employeeId">{t("कर्मचारी आईडी", "Employee ID")}</Label>
            <Input
              id="employeeId"
              value={value.employeeId ?? ""}
              readOnly
              aria-readonly
              className="cursor-not-allowed bg-surface-muted font-mono text-text-muted"
              placeholder={creating ? t("सेव करते ही अपने आप बनेगी", "Issued automatically on save") : "—"}
            />
            <p className="text-[11px] text-text-muted">
              {t("यह अपने आप बनती है और बदली नहीं जा सकती।", "Issued by the system — it cannot be changed.")}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="gender">{t("लिंग", "Gender")}</Label>
            <Select value={value.gender || "unset"} onValueChange={(next) => set({ gender: next === "unset" ? "" : next })}>
              <SelectTrigger id="gender" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unset">{t("नहीं बताना", "Prefer not to say")}</SelectItem>
                <SelectItem value="female">{t("महिला", "Female")}</SelectItem>
                <SelectItem value="male">{t("पुरुष", "Male")}</SelectItem>
                <SelectItem value="other">{t("अन्य", "Other")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bloodGroup">
              {t("ब्लड ग्रुप", "Blood group")}
              {creating ? <span className="ml-0.5 text-destructive">*</span> : null}
            </Label>
            <Select
              value={value.bloodGroup || "unset"}
              onValueChange={(next) => set({ bloodGroup: next === "unset" ? "" : next })}
              disabled={frozen}
            >
              <SelectTrigger id="bloodGroup" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unset">{t("चुनें", "Select")}</SelectItem>
                {BLOOD_GROUPS.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.bloodGroup ? (
              <p className="text-[11.5px] text-destructive">{errors.bloodGroup}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dateOfBirth">{t("जन्म तिथि", "Date of birth")}</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={value.dateOfBirth ?? ""}
              onChange={(event) => set({ dateOfBirth: event.target.value })}
            />
            {errors.dateOfBirth ? <p className="text-[11.5px] text-destructive">{errors.dateOfBirth}</p> : null}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bio">{t("परिचय", "Short bio")}</Label>
          <Textarea
            id="bio"
            rows={2}
            value={value.bio ?? ""}
            onChange={(event) => set({ bio: event.target.value })}
            placeholder={t("दो लाइन में परिचय…", "A line or two about them…")}
          />
          {errors.bio ? <p className="text-[11.5px] text-destructive">{errors.bio}</p> : null}
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-[11px] font-semibold tracking-wide text-text-muted uppercase">{t("पता", "Address")}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            {field("line1", t("पता", "Address line"), value.address?.line1, (next) => setAddress({ line1: next }))}
          </div>
          {field("city", t("शहर", "City"), value.address?.city, (next) => setAddress({ city: next }))}
          {field("state", t("राज्य", "State"), value.address?.state, (next) => setAddress({ state: next }))}
          {field(
            "pincode",
            t("पिन कोड", "PIN code"),
            value.address?.pincode,
            (next) => setAddress({ pincode: next }),
            "226010",
            "address.pincode",
          )}
          {field("country", t("देश", "Country"), value.address?.country, (next) => setAddress({ country: next }), "India")}
        </div>
      </section>

      {showIdentity ? (
        <section className="space-y-3">
          <p className="text-[11px] font-semibold tracking-wide text-text-muted uppercase">
            {t("पहचान पत्र", "Identity documents")}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {field(
              "aadhaar",
              t("आधार", "Aadhaar"),
              value.identity?.aadhaar,
              (next) => setIdentity({ aadhaar: next }),
              identityMasked ? "••••••••1234" : "123412341234",
              "identity.aadhaar",
              { required: creating, readOnly: frozen },
            )}
            {field(
              "pan",
              "PAN",
              value.identity?.pan,
              (next) => setIdentity({ pan: next.toUpperCase() }),
              "ABCDE1234F",
              "identity.pan",
              { readOnly: frozen },
            )}
            {field(
              "passport",
              t("पासपोर्ट", "Passport"),
              value.identity?.passport,
              (next) => setIdentity({ passport: next.toUpperCase() }),
              "A1234567",
              "identity.passport",
              { readOnly: frozen },
            )}
          </div>
          <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-[11.5px] text-amber-700 dark:text-amber-400">
            {t(
              "ये नंबर संवेदनशील हैं — सिर्फ़ एडमिनिस्ट्रेटर और खुद वो व्यक्ति इन्हें देख सकते हैं, लिस्ट में ये छिपे रहते हैं। ज़रूरत न हो तो खाली छोड़िए।",
              "These are sensitive numbers — only an administrator and the person themselves can see them, and the list hides them. Leave blank unless you need them.",
            )}
          </p>
        </section>
      ) : null}

      <section className="space-y-3">
        <p className="text-[11px] font-semibold tracking-wide text-text-muted uppercase">
          {t("आपातकालीन संपर्क", "Emergency contact")}
          {creating ? <span className="ml-0.5 text-destructive">*</span> : null}
        </p>
        {frozen ? (
          <p className="rounded-lg border border-border bg-surface-muted/60 px-3 py-2 text-[11.5px] text-text-muted">
            {t(
              "यह रिकॉर्ड का हिस्सा है — बदलवाने के लिए एडमिनिस्ट्रेटर से कहिए।",
              "This is part of your personnel record — ask an administrator to change it.",
            )}
          </p>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-3">
          {field("ec-name", t("नाम", "Name"), value.emergencyContact?.name, (next) => setEmergency({ name: next }),
            undefined, "emergencyContact.name", { required: creating, readOnly: frozen })}
          {field("ec-relation", t("रिश्ता", "Relation"), value.emergencyContact?.relation, (next) =>
            setEmergency({ relation: next }), undefined, "emergencyContact.relation", { readOnly: frozen },
          )}
          {field(
            "ec-phone",
            t("फ़ोन", "Phone"),
            value.emergencyContact?.phone,
            (next) => setEmergency({ phone: next }),
            undefined,
            "emergencyContact.phone",
            { required: creating, readOnly: frozen },
          )}
        </div>
      </section>
    </div>
  );
}
