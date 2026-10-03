"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  IconAlertTriangle,
  IconCopy,
  IconDotsVertical,
  IconKey,
  IconMail,
  IconRefresh,
  IconSearch,
  IconShieldLock,
  IconTrash,
  IconUserCheck,
  IconUserPause,
  IconUserCircle,
  IconUserPlus,
  IconUsers,
  IconUserX,
} from "@tabler/icons-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { RoleBadge } from "@/components/admin/role-badge";
import { StatCard } from "@/components/admin/stat-card";
import { useAdminSession } from "@/components/admin/admin-session";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { UserProfileFields } from "@/components/admin/users/user-profile-fields";
import { ScrollArea } from "@/components/ui/scroll-area";
import { roleLabels } from "@/lib/admin/permissions";
import { toneStyle, type ToneLevel } from "@/lib/admin/tone";
import { formatDate, formatRelative } from "@/lib/admin/format";
import { ApiError } from "@/lib/api/client";
import * as api from "@/lib/api/admin";
import type { AdminUser, UserRole } from "@/types/admin";

const statusStyles: Record<AdminUser["status"], { label: string; labelEn: string; level: ToneLevel }> = {
  active: { label: "एक्टिव", labelEn: "Active", level: "strong" },
  invited: { label: "इनवाइटेड", labelEn: "Invited", level: "medium" },
  suspended: { label: "सस्पेंडेड", labelEn: "Suspended", level: "soft" },
};

const allRoles: UserRole[] = ["administrator", "admin", "reporter"];

/** Everything here talks to the Go API. Only an administrator can reach this
 *  screen, and the API enforces that again on every call. */
export function UsersView() {
  const { t } = useAdminLang();
  const { user: currentUser } = useAdminSession();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");

  const [inviteOpen, setInviteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "reporter" as UserRole, password: "" });
  // The optional half of the profile, kept separate so the required fields
  // stay obvious.
  const [profile, setProfile] = useState<api.UserProfileInput>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [secret, setSecret] = useState<{ title: string; hint: string; value: string } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null);

  const load = useCallback(
    async (search: string, role: UserRole | "all") => {
      setLoading(true);
      try {
        const page = await api.listUsers({ search, role: role === "all" ? "" : role, limit: 100 });
        setUsers(page.items);
        setLoadError(null);
      } catch (error) {
        setLoadError(
          error instanceof ApiError
            ? error.message
            : t("सर्वर से संपर्क नहीं हो पाया।", "Could not reach the server."),
        );
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  // Debounced so typing in the search box doesn't hammer the API.
  useEffect(() => {
    const timer = setTimeout(() => void load(query, roleFilter), query ? 300 : 0);
    return () => clearTimeout(timer);
  }, [query, roleFilter, load]);

  const refresh = () => void load(query, roleFilter);

  const reportError = (error: unknown, fallback: string) => {
    if (error instanceof ApiError) {
      toast.error(error.message);
      return error.fields ?? {};
    }
    toast.error(fallback);
    return {};
  };

  const submitInvite = async () => {
    setSaving(true);
    setFormErrors({});
    try {
      const result = await api.createUser({
        ...profile,
        name: form.name,
        email: form.email,
        role: form.role,
        password: form.password || undefined,
      });
      setInviteOpen(false);
      setForm({ name: "", email: "", role: "reporter", password: "" });
      setProfile({});
      refresh();

      if (result.emailSent) {
        toast.success(t("यूज़र बन गया", "User created"), {
          description: t("लॉगिन की जानकारी ईमेल कर दी गई है।", "Their sign-in details were emailed to them."),
        });
      }
      if (result.inviteToken) {
        setSecret({
          title: t("इनवाइट लिंक तैयार है", "Invite link ready"),
          hint: t(
            `${result.user.name} को यह लिंक भेजिए — इसी से वे अपना पासवर्ड सेट करेंगे। यह एक बार ही दिखेगा।`,
            `Send this link to ${result.user.name} — it is how they set their password. It is shown only once.`,
          ),
          value: `${window.location.origin}/invite?token=${result.inviteToken}`,
        });
      } else {
        toast.success(t("यूज़र बन गया", "User created"));
      }
    } catch (error) {
      setFormErrors(reportError(error, t("यूज़र नहीं बना", "Could not create the user")));
    } finally {
      setSaving(false);
    }
  };

  const changeRole = async (user: AdminUser, role: UserRole) => {
    try {
      await api.updateUserRole(user.id, role);
      toast.success(
        t(`${user.name} का रोल ${roleLabels[role].name} किया गया`, `${user.name} is now ${roleLabels[role].nameEn}`),
        { description: t("यह ऑडिट लॉग में दर्ज है।", "Recorded in the audit log.") },
      );
      refresh();
    } catch (error) {
      reportError(error, t("रोल नहीं बदला", "Could not change the role"));
    }
  };

  const changeStatus = async (user: AdminUser) => {
    const next = user.status === "suspended" ? "active" : "suspended";
    try {
      await api.updateUserStatus(user.id, next);
      toast.success(
        next === "active"
          ? t("अकाउंट बहाल किया गया", "Account restored")
          : t("अकाउंट सस्पेंड किया गया", "Account suspended"),
      );
      refresh();
    } catch (error) {
      reportError(error, t("स्थिति नहीं बदली", "Could not change the status"));
    }
  };

  const resetPassword = async (user: AdminUser) => {
    try {
      const result = await api.resetUserPassword(user.id);
      setSecret({
        title: t("नया पासवर्ड", "New password"),
        hint: t(
          `${user.name} को यह पासवर्ड दीजिए। लॉगिन के बाद वे इसे बदल लें। यह एक बार ही दिखेगा।`,
          `Give this to ${user.name}. They should change it after signing in. It is shown only once.`,
        ),
        value: result.temporaryPassword,
      });
      refresh();
    } catch (error) {
      reportError(error, t("पासवर्ड रीसेट नहीं हुआ", "Could not reset the password"));
    }
  };

  const remove = async (user: AdminUser) => {
    try {
      await api.deleteUser(user.id);
      toast.success(t("यूज़र हटा दिया गया", "User deleted"));
      setPendingDelete(null);
      refresh();
    } catch (error) {
      reportError(error, t("यूज़र नहीं हटा", "Could not delete the user"));
      setPendingDelete(null);
    }
  };

  const counts = {
    total: users.length,
    active: users.filter((user) => user.status === "active").length,
    other: users.filter((user) => user.status !== "active").length,
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t("यूज़र मैनेजमेंट", "User management")}
        description={t(
          "न्यूज़रूम की टीम, उनके रोल और एक्सेस — सिर्फ़ एडमिनिस्ट्रेटर के लिए।",
          "The newsroom team, their roles and access — administrators only.",
        )}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
              <IconRefresh className="size-4" /> {t("रिफ्रेश", "Refresh")}
            </Button>
            <Button size="sm" onClick={() => setInviteOpen(true)}>
              <IconUserPlus className="size-4" /> {t("नया यूज़र जोड़ें", "Add user")}
            </Button>
          </>
        }
      />

      {loadError ? (
        <p className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
          <IconAlertTriangle className="size-4 shrink-0" /> {loadError}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label={t("कुल यूज़र", "Total users")} value={counts.total} icon={<IconUsers className="size-5" stroke={1.7} />} />
        <StatCard label={t("एक्टिव", "Active")} value={counts.active} icon={<IconUserCheck className="size-5" stroke={1.7} />} />
        <StatCard
          label={t("सस्पेंडेड / इनवाइटेड", "Suspended / invited")}
          value={counts.other}
          icon={<IconUserPause className="size-5" stroke={1.7} />}
        />
      </div>

      <Card className="gap-0 py-0">
        <div className="flex flex-col gap-2 border-b p-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <IconSearch className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-text-muted" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("नाम, ईमेल या डेस्क खोजें…", "Search name, email or desk…")}
              className="h-9 pl-8"
            />
          </div>
          <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as UserRole | "all")}>
            <SelectTrigger className="h-9 w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("सभी रोल", "All roles")}</SelectItem>
              {allRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {t(roleLabels[role].name, roleLabels[role].nameEn)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-[220px]">{t("यूज़र", "User")}</TableHead>
                <TableHead>{t("रोल", "Role")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("डेस्क", "Desk")}</TableHead>
                <TableHead className="hidden lg:table-cell">{t("स्थिति", "Status")}</TableHead>
                <TableHead className="hidden xl:table-cell">{t("जॉइन", "Joined")}</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <TableRow key={index} className="hover:bg-transparent">
                      <TableCell colSpan={6}>
                        <Skeleton className="h-9 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : users.map((user) => {
                    const status = statusStyles[user.status];
                    const isSelf = user.id === currentUser.id;
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="size-9">
                              <AvatarImage src={user.avatarUrl} alt={user.name} />
                              <AvatarFallback className="text-xs">{user.name.slice(0, 1)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate text-[13.5px] font-medium text-text">
                                <Link href={`/admin/users/${user.id}`} className="hover:text-accent">
                                  {user.name}
                                </Link>
                                {isSelf ? (
                                  <span className="ml-1.5 text-[11px] text-text-muted">({t("आप", "you")})</span>
                                ) : null}
                              </p>
                              <p className="truncate text-[11.5px] text-text-muted">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <RoleBadge role={user.role} />
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-[12.5px] text-text-muted">
                          {user.desk ?? "—"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span
                            className="rounded-full border px-2 py-0.5 text-[11px] font-semibold"
                            style={toneStyle(status.level)}
                          >
                            {t(status.label, status.labelEn)}
                          </span>
                          <p className="mt-0.5 text-[11px] text-text-muted">{formatRelative(user.lastActiveAt)}</p>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-[12px] whitespace-nowrap text-text-muted">
                          {formatDate(user.joinedAt)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm" aria-label={t("विकल्प", "Options")}>
                                <IconDotsVertical className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/users/${user.id}`}>
                                  <IconUserCircle className="size-4" /> {t("पूरी जानकारी", "Full details")}
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel className="flex items-center gap-1.5 text-[11px] text-text-muted">
                                <IconShieldLock className="size-3.5" /> {t("रोल बदलें", "Change role")}
                              </DropdownMenuLabel>
                              <DropdownMenuRadioGroup
                                value={user.role}
                                onValueChange={(value) => void changeRole(user, value as UserRole)}
                              >
                                {allRoles.map((role) => (
                                  <DropdownMenuRadioItem
                                    key={role}
                                    value={role}
                                    className="text-[13px]"
                                    disabled={isSelf}
                                  >
                                    {t(roleLabels[role].name, roleLabels[role].nameEn)}
                                  </DropdownMenuRadioItem>
                                ))}
                              </DropdownMenuRadioGroup>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => void resetPassword(user)}>
                                <IconKey className="size-4" /> {t("पासवर्ड रीसेट", "Reset password")}
                              </DropdownMenuItem>
                              <DropdownMenuItem disabled={isSelf} onClick={() => void changeStatus(user)}>
                                <IconUserX className="size-4" />
                                {user.status === "suspended" ? t("बहाल करें", "Restore") : t("सस्पेंड करें", "Suspend")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                disabled={isSelf}
                                onClick={() => setPendingDelete(user)}
                              >
                                <IconTrash className="size-4" /> {t("डिलीट करें", "Delete")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              {!loading && users.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="py-12 text-center text-sm text-text-muted">
                    {t("कोई यूज़र नहीं मिला।", "No users found.")}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className="p-4">
        <p className="mb-3 text-[12px] font-semibold tracking-wide text-text-muted uppercase">
          {t("रोल की अनुमतियाँ", "Role permissions")}
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {allRoles.map((role) => (
            <div key={role} className="rounded-lg border border-border p-3">
              <RoleBadge role={role} />
              <p className="mt-2 text-[12.5px] leading-relaxed text-text-muted">
                {t(roleLabels[role].description, roleLabels[role].descriptionEn)}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* --- create user --- */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-h-[90vh] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("नया यूज़र जोड़ें", "Add a user")}</DialogTitle>
            <DialogDescription>
              {t(
                "पासवर्ड खाली छोड़ेंगे तो इनवाइट लिंक मिलेगा, जिससे यूज़र खुद पासवर्ड सेट करेगा।",
                "Leave the password empty to get an invite link the user sets their own password with.",
              )}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[62vh] pr-3">
            <div className="flex flex-col gap-5 pb-1">
              <section className="space-y-3">
                <p className="text-[11px] font-semibold tracking-wide text-text-muted uppercase">
                  {t("ज़रूरी जानकारी", "Required")}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="invite-name">{t("पूरा नाम", "Full name")}</Label>
                    <Input
                      id="invite-name"
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      placeholder={t("जैसे: सुनीता राव", "e.g. Sunita Rao")}
                    />
                    {formErrors.name ? <p className="text-[11.5px] text-destructive">{formErrors.name}</p> : null}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="invite-email">{t("ईमेल", "Email")}</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm({ ...form, email: event.target.value })}
                      placeholder="name@newsnationtoday.in"
                    />
                    {formErrors.email ? <p className="text-[11.5px] text-destructive">{formErrors.email}</p> : null}
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("रोल", "Role")}</Label>
                    <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value as UserRole })}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {allRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {t(roleLabels[role].name, roleLabels[role].nameEn)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.role ? <p className="text-[11.5px] text-destructive">{formErrors.role}</p> : null}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="invite-password">{t("पासवर्ड (वैकल्पिक)", "Password (optional)")}</Label>
                    <Input
                      id="invite-password"
                      value={form.password}
                      onChange={(event) => setForm({ ...form, password: event.target.value })}
                      placeholder={t("खाली = इनवाइट लिंक", "Empty = invite link")}
                    />
                    {formErrors.password ? (
                      <p className="text-[11.5px] text-destructive">{formErrors.password}</p>
                    ) : null}
                  </div>
                </div>
              </section>

              {/* Everything below is optional — it can be filled in later, by
                  an administrator or by the person themselves. */}
              <UserProfileFields value={profile} errors={formErrors} onChange={setProfile} />
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              {t("रद्द करें", "Cancel")}
            </Button>
            <Button onClick={() => void submitInvite()} disabled={saving}>
              <IconMail className="size-4" /> {saving ? t("बन रहा है…", "Creating…") : t("बनाएं", "Create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- one-time secret (invite link or temporary password) --- */}
      <Dialog open={secret !== null} onOpenChange={(open) => !open && setSecret(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{secret?.title}</DialogTitle>
            <DialogDescription>{secret?.hint}</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-muted p-2.5">
            <code className="min-w-0 flex-1 break-all text-[12px]">{secret?.value}</code>
            <Button
              size="icon-sm"
              variant="outline"
              aria-label={t("कॉपी करें", "Copy")}
              onClick={() => {
                if (secret) navigator.clipboard?.writeText(secret.value);
                toast.success(t("कॉपी हो गया", "Copied"));
              }}
            >
              <IconCopy className="size-4" />
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setSecret(null)}>{t("ठीक है", "Done")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- delete --- */}
      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("यूज़र डिलीट करें?", "Delete this user?")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "यह अकाउंट हमेशा के लिए हट जाएगा और उनके सारे सेशन बंद हो जाएंगे। यह ऑडिट लॉग में दर्ज होगा।",
                "The account is removed for good and every session of theirs ends. It is recorded in the audit log.",
              )}
              <span className="mt-2 block font-medium text-text">{pendingDelete?.email}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("रहने दें", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => pendingDelete && void remove(pendingDelete)}>
              {t("हाँ, डिलीट करें", "Yes, delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
