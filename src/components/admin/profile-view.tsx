"use client";

import { useState } from "react";
import { toast } from "sonner";
import { IconDeviceFloppy, IconLock } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/admin/page-header";
import { RoleBadge } from "@/components/admin/role-badge";
import { useAdminAuth, useAdminSession } from "@/components/admin/admin-session";
import { UserProfileFields } from "@/components/admin/users/user-profile-fields";
import { AvatarUpload } from "@/components/admin/users/avatar-upload";
import { DigitalIdCard } from "@/components/admin/users/digital-id-card";
import { ApiError } from "@/lib/api/client";
import * as api from "@/lib/api/admin";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { roleLabels } from "@/lib/admin/permissions";
import { rolePermissions } from "@/lib/admin/permissions";
import { formatDate } from "@/lib/admin/format";

export function ProfileView() {
  const { user, role } = useAdminSession();
  const { t, language } = useAdminLang();
  const { reload } = useAdminAuth();
  // Everything optional lives in one object, shared with the admin's own form.
  const [details, setDetails] = useState<api.UserProfileInput>({
    phone: user.phone,
    altPhone: user.altPhone,
    desk: user.desk,
    reportingArea: user.reportingArea,
    employeeId: user.employeeId,
    avatarUrl: user.avatarUrl,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    bloodGroup: user.bloodGroup,
    bio: user.bio,
    address: user.address,
    identity: user.identity,
    emergencyContact: user.emergencyContact,
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [savingPassword, setSavingPassword] = useState(false);

  const saveProfile = async () => {
    setSavingProfile(true);
    setProfileErrors({});
    try {
      // Name, email, role, the ID numbers and the emergency contact are the
      // personnel record — the API refuses them here, so they are not sent.
      await api.updateProfile(details);
      await reload();
      toast.success(t("प्रोफ़ाइल सेव हो गई", "Profile saved"));
    } catch (error) {
      if (error instanceof ApiError) {
        setProfileErrors(error.fields ?? {});
        toast.error(error.message);
      } else {
        toast.error(t("सर्वर से संपर्क नहीं हो पाया।", "Could not reach the server."));
      }
    } finally {
      setSavingProfile(false);
    }
  };

  // Changing a password ends every session, including this one, so the API
  // sends us back to the login screen afterwards.
  const submitPassword = async () => {
    setPasswordErrors({});
    if (passwords.next !== passwords.confirm) {
      setPasswordErrors({ confirm: t("दोनों पासवर्ड एक जैसे नहीं हैं", "The two passwords do not match") });
      return;
    }
    setSavingPassword(true);
    try {
      const result = await api.changePassword(passwords.current, passwords.next);
      toast.success(t("पासवर्ड बदल गया", "Password changed"), { description: result.message });
      setPasswords({ current: "", next: "", confirm: "" });
      window.location.href = "/login";
    } catch (error) {
      if (error instanceof ApiError) {
        setPasswordErrors(error.fields ?? {});
        toast.error(error.message);
      } else {
        toast.error(t("सर्वर से संपर्क नहीं हो पाया।", "Could not reach the server."));
      }
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t("मेरी प्रोफ़ाइल", "My profile")}
        description={t("आपकी जानकारी और लॉगिन सेटिंग्स।", "Your details and login settings.")}
        actions={
          <Button size="sm" disabled={savingProfile} onClick={() => void saveProfile()}>
            <IconDeviceFloppy className="size-4" />
            {savingProfile ? t("सेव हो रहा है…", "Saving…") : t("सेव करें", "Save")}
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base font-bold">{t("बुनियादी जानकारी", "Basic details")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 pt-0">
              <AvatarUpload
                name={user.name}
                url={details.avatarUrl}
                onChange={(url) => setDetails({ ...details, avatarUrl: url })}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="profile-name">{t("नाम", "Name")}</Label>
                  <Input id="profile-name" value={user.name} readOnly disabled />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="profile-email">{t("ईमेल", "Email")}</Label>
                  <Input id="profile-email" value={user.email} readOnly disabled />
                </div>
              </div>
              <p className="rounded-lg border border-border bg-surface-muted/60 px-3 py-2 text-[11.5px] text-text-muted">
                {t(
                  "नाम, ईमेल, रोल, आधार और आपातकालीन संपर्क रिकॉर्ड का हिस्सा हैं — बदलवाने के लिए एडमिनिस्ट्रेटर से कहिए। फ़ोन, फ़ोटो, पता और परिचय आप खुद बदल सकते हैं।",
                  "Name, email, role, Aadhaar and the emergency contact are part of your personnel record — ask an administrator to change them. Phone, photo, address and bio are yours to edit.",
                )}
              </p>

              <UserProfileFields
                value={details}
                errors={profileErrors}
                onChange={setDetails}
                mode="self"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
                <IconLock className="size-4" /> {t("पासवर्ड", "Password")}
              </CardTitle>
              <CardDescription>
                {t("कम से कम 8 अक्षर, एक अंक ज़रूरी।", "At least 8 characters, including a digit.")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-0">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="pass-old">{t("पुराना", "Current")}</Label>
                  <Input
                    id="pass-old"
                    type="password"
                    autoComplete="current-password"
                    value={passwords.current}
                    onChange={(event) => setPasswords({ ...passwords, current: event.target.value })}
                  />
                  {passwordErrors.currentPassword ? (
                    <p className="text-[11.5px] text-destructive">{passwordErrors.currentPassword}</p>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pass-new">{t("नया", "New")}</Label>
                  <Input
                    id="pass-new"
                    type="password"
                    autoComplete="new-password"
                    value={passwords.next}
                    onChange={(event) => setPasswords({ ...passwords, next: event.target.value })}
                  />
                  {passwordErrors.newPassword ? (
                    <p className="text-[11.5px] text-destructive">{passwordErrors.newPassword}</p>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pass-confirm">{t("दोबारा", "Confirm")}</Label>
                  <Input
                    id="pass-confirm"
                    type="password"
                    autoComplete="new-password"
                    value={passwords.confirm}
                    onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })}
                  />
                  {passwordErrors.confirm ? (
                    <p className="text-[11.5px] text-destructive">{passwordErrors.confirm}</p>
                  ) : null}
                </div>
              </div>
              <Button
                size="sm"
                className="self-start"
                disabled={savingPassword || !passwords.current || !passwords.next}
                onClick={() => void submitPassword()}
              >
                <IconLock className="size-4" />
                {savingPassword ? t("बदला जा रहा है…", "Changing…") : t("पासवर्ड बदलें", "Change password")}
              </Button>
              <p className="text-[11.5px] text-text-muted">
                {t(
                  "पासवर्ड बदलते ही सभी डिवाइस से लॉग आउट हो जाएगा — दोबारा लॉगिन करना होगा।",
                  "Changing it signs you out everywhere — you will need to sign in again.",
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base font-bold">{t("नोटिफिकेशन", "Notifications")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5 pt-0">
              {[
                [t("रिव्यू कमेंट पर ईमेल", "Email on review comments"), true],
                [t("खबर पब्लिश होने पर ईमेल", "Email when a story is published"), true],
                [t("रोज़ाना समरी", "Daily summary"), false],
              ].map(([label, defaultOn]) => (
                <div key={String(label)} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                  <p className="text-[13.5px] text-text">{label}</p>
                  <Switch defaultChecked={Boolean(defaultOn)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <DigitalIdCard user={user} />

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base font-bold">{t("आपका रोल", "Your role")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-0">
              <RoleBadge role={role} />
              <p className="text-[12.5px] leading-relaxed text-text-muted">
                {t(roleLabels[role].description, roleLabels[role].descriptionEn)}
              </p>
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold tracking-wide text-text-muted uppercase">
                  {t("अनुमतियाँ", "Permissions")}
                </p>
                <div className="flex flex-wrap gap-1">
                  {rolePermissions[role].map((permission) => (
                    <code
                      key={permission}
                      className="rounded bg-surface-muted px-1.5 py-0.5 text-[10.5px] text-text-muted"
                    >
                      {permission}
                    </code>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-2 pt-0 text-[12.5px] text-text-muted">
              <div className="flex justify-between">
                <span>{t("जॉइन किया", "Joined")}</span>
                <span className="text-text">{formatDate(user.joinedAt, language)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("कुल खबरें", "Stories")}</span>
                <span className="text-text">{user.storiesCount}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("स्थिति", "Status")}</span>
                <span className="text-emerald-600 dark:text-emerald-400">{t("एक्टिव", "Active")}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
