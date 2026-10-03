"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconDeviceFloppy,
  IconKey,
  IconMail,
  IconUserX,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/admin/page-header";
import { RoleBadge } from "@/components/admin/role-badge";
import { UserProfileFields } from "@/components/admin/users/user-profile-fields";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { useAdminSession } from "@/components/admin/admin-session";
import { roleLabels } from "@/lib/admin/permissions";
import { formatDate, formatRelative } from "@/lib/admin/format";
import { ApiError } from "@/lib/api/client";
import * as api from "@/lib/api/admin";
import type { AdminUser, UserRole } from "@/types/admin";

/** One person's full record. Administrator-only, and the only screen that
 *  shows the real ID numbers. */
export function UserDetailView({ id }: { id: string }) {
  const { t, language } = useAdminLang();
  const { user: currentUser } = useAdminSession();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [basics, setBasics] = useState({ name: "", email: "", role: "reporter" as UserRole });
  const [profile, setProfile] = useState<api.UserProfileInput>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Their desk record, counted from the stories themselves.
  const [activity, setActivity] = useState<api.ReviewActivity | null>(null);

  const hydrate = useCallback((next: AdminUser) => {
    setUser(next);
    setBasics({ name: next.name, email: next.email, role: next.role });
    setProfile({
      phone: next.phone,
      altPhone: next.altPhone,
      desk: next.desk,
      reportingArea: next.reportingArea,
      employeeId: next.employeeId,
      dateOfBirth: next.dateOfBirth,
      gender: next.gender,
      bio: next.bio,
      address: next.address,
      identity: next.identity,
      emergencyContact: next.emergencyContact,
    });
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      return { user: await api.getUser(id), error: null as string | null };
    } catch (error) {
      return {
        user: null,
        error:
          error instanceof ApiError
            ? error.message
            : t("सर्वर से संपर्क नहीं हो पाया।", "Could not reach the server."),
      };
    }
  }, [id, t]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const [result, rows] = await Promise.all([
        fetchUser(),
        api.listReviewActivity().catch(() => [] as api.ReviewActivity[]),
      ]);
      if (!active) return;
      if (result.user) hydrate(result.user);
      setActivity(rows.find((row) => row.userId === id) ?? null);
      setLoadError(result.error);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [fetchUser, hydrate, id]);

  const save = async () => {
    setSaving(true);
    setErrors({});
    try {
      const updated = await api.updateUser(id, { ...profile, name: basics.name, email: basics.email });
      hydrate(updated);
      toast.success(t("जानकारी सेव हो गई", "Details saved"));
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.fields ?? {});
        toast.error(error.message);
      } else {
        toast.error(t("सर्वर से संपर्क नहीं हो पाया।", "Could not reach the server."));
      }
    } finally {
      setSaving(false);
    }
  };

  const changeRole = async (role: UserRole) => {
    try {
      hydrate(await api.updateUserRole(id, role));
      toast.success(t(`रोल ${roleLabels[role].name} किया गया`, `Role changed to ${roleLabels[role].nameEn}`));
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t("रोल नहीं बदला", "Could not change the role"));
    }
  };

  const toggleStatus = async () => {
    if (!user) return;
    const next = user.status === "suspended" ? "active" : "suspended";
    try {
      hydrate(await api.updateUserStatus(id, next));
      toast.success(
        next === "active" ? t("अकाउंट बहाल", "Account restored") : t("अकाउंट सस्पेंड", "Account suspended"),
      );
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t("स्थिति नहीं बदली", "Could not change the status"));
    }
  };

  const resetPassword = async () => {
    try {
      const result = await api.resetUserPassword(id);
      toast.success(t("नया पासवर्ड बन गया", "New password created"), {
        description: result.emailSent
          ? t("यूज़र को ईमेल कर दिया गया।", "It was emailed to the user.")
          : `${t("पासवर्ड", "Password")}: ${result.temporaryPassword}`,
        duration: result.emailSent ? 5000 : 20000,
      });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t("रीसेट नहीं हुआ", "Could not reset"));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-[420px] w-full" />
      </div>
    );
  }

  if (loadError || !user) {
    return (
      <p className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
        <IconAlertTriangle className="size-4 shrink-0" />
        {loadError ?? t("यह यूज़र नहीं मिला।", "This user could not be found.")}
      </p>
    );
  }

  const isSelf = user.id === currentUser.id;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={user.name}
        description={user.email}
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/users">
                <IconArrowLeft className="size-4" /> {t("सभी यूज़र", "All users")}
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => void resetPassword()}>
              <IconKey className="size-4" /> {t("पासवर्ड रीसेट", "Reset password")}
            </Button>
            <Button variant="outline" size="sm" disabled={isSelf} onClick={() => void toggleStatus()}>
              <IconUserX className="size-4" />
              {user.status === "suspended" ? t("बहाल करें", "Restore") : t("सस्पेंड करें", "Suspend")}
            </Button>
            <Button size="sm" disabled={saving} onClick={() => void save()}>
              <IconDeviceFloppy className="size-4" />
              {saving ? t("सेव हो रहा है…", "Saving…") : t("सेव करें", "Save")}
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base font-bold">{t("पूरी जानकारी", "Full details")}</CardTitle>
            <CardDescription>
              {t(
                "सिर्फ़ नाम, ईमेल और रोल ज़रूरी हैं — बाकी सब कभी भी भरा जा सकता है।",
                "Only name, email and role are required — everything else can be filled in any time.",
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 pt-0">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="detail-name">{t("पूरा नाम", "Full name")}</Label>
                <Input
                  id="detail-name"
                  value={basics.name}
                  onChange={(event) => setBasics({ ...basics, name: event.target.value })}
                />
                {errors.name ? <p className="text-[11.5px] text-destructive">{errors.name}</p> : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="detail-email">{t("ईमेल", "Email")}</Label>
                <Input
                  id="detail-email"
                  type="email"
                  value={basics.email}
                  onChange={(event) => setBasics({ ...basics, email: event.target.value })}
                />
                {errors.email ? <p className="text-[11.5px] text-destructive">{errors.email}</p> : null}
              </div>
            </div>

            <UserProfileFields
              value={profile}
              errors={errors}
              onChange={setProfile}
              identityMasked={user.identityMasked}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col items-center gap-2 pt-0 text-center">
              <Avatar className="size-16">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback className="text-lg">{user.name.slice(0, 1)}</AvatarFallback>
              </Avatar>
              <p className="font-display text-base font-bold">{user.name}</p>
              <RoleBadge role={user.role} />
              <p className="text-[12px] text-text-muted">{user.email}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base font-bold">{t("रोल", "Role")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 pt-0">
              <Select value={user.role} disabled={isSelf} onValueChange={(value) => void changeRole(value as UserRole)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["administrator", "admin", "reporter"] as UserRole[]).map((role) => (
                    <SelectItem key={role} value={role}>
                      {t(roleLabels[role].name, roleLabels[role].nameEn)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isSelf ? (
                <p className="text-[11.5px] text-text-muted">
                  {t("आप अपना रोल नहीं बदल सकते।", "You cannot change your own role.")}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-2 pt-0 text-[12.5px] text-text-muted">
              <div className="flex justify-between">
                <span>{t("स्थिति", "Status")}</span>
                <span className="text-text">{user.status}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("जॉइन किया", "Joined")}</span>
                <span className="text-text">{formatDate(user.joinedAt, language)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("आख़िरी बार सक्रिय", "Last active")}</span>
                <span className="text-text">
                  {user.lastActiveAt
                    ? formatRelative(user.lastActiveAt, language)
                    : t("कभी लॉगिन नहीं किया", "Never signed in")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t("कुल खबरें", "Stories")}</span>
                <span className="text-text">{user.storiesCount}</span>
              </div>

              {activity ? (
                <div className="mt-2 flex flex-col gap-1.5 rounded-lg bg-surface-muted/60 p-3">
                  <p className="text-[11px] font-semibold tracking-wide text-text-muted uppercase">
                    {t("रिव्यू का हिसाब", "Review record")}
                  </p>
                  {(
                    [
                      ["अप्रूव की", "Approved", activity.approved],
                      ["बदलाव मांगे", "Changes requested", activity.changesRequested],
                      ["रिजेक्ट कीं", "Rejected", activity.rejected],
                      ["शेड्यूल कीं", "Scheduled", activity.scheduled],
                      ["कमेंट किए", "Comments", activity.comments],
                      ["अभी बाकी", "Waiting on them", activity.pending],
                    ] as const
                  ).map(([hi, en, value]) => (
                    <div key={en} className="flex justify-between">
                      <span>{t(hi, en)}</span>
                      <span
                        className={
                          value > 0 ? "font-semibold text-text tabular-nums" : "tabular-nums"
                        }
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}

              <Button asChild variant="outline" size="sm" className="mt-1">
                <a href={`mailto:${user.email}`}>
                  <IconMail className="size-4" /> {t("ईमेल भेजें", "Send an email")}
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
