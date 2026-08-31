"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Search, XCircle } from "lucide-react";
import { api, ApiError, type UserDTO } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SelectNative } from "@/components/ui/select-native";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/cn";

const roleTone: Record<UserDTO["role"], BadgeProps["tone"]> = {
  admin: "danger",
  user: "info",
};

export function UsersTab({ onError, onSuccess }: { onError: (message: string) => void; onSuccess: (message: string) => void }) {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserDTO["role"]>("all");
  const [updating, setUpdating] = useState<string | null>(null);

  function load() {
    setLoading(true);
    api.adminListUsers().then(setUsers).catch((err) => onError(err instanceof ApiError ? err.message : "Couldn't load users.")).finally(() => setLoading(false));
  }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function toggleDisabled(u: UserDTO) {
    setUpdating(u.id);
    try {
      await api.adminSetUserDisabled(u.id, !u.disabled);
      setUsers((items) => items.map((item) => (item.id === u.id ? { ...item, disabled: !u.disabled } : item)));
      onSuccess(u.disabled ? "User re-enabled." : "User disabled.");
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Couldn't update that user.");
    } finally {
      setUpdating(null);
    }
  }

  const filtered = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    const q = search.trim().toLowerCase();
    if (q && !u.fullName.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading users...
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All users</CardTitle>
        <CardDescription>{filtered.length} of {users.length} users</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search name or email" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
          </div>
          <SelectNative value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)} className="sm:w-40">
            <option value="all">All roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </SelectNative>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/70 dark:border-slate-800">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs text-muted-foreground dark:bg-slate-800/50">
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Role</th>
                <th className="px-4 py-2 font-medium">KYC</th>
                <th className="px-4 py-2 font-medium">Joined</th>
                <th className="px-4 py-2 text-right font-medium">Active</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                    {users.length === 0 ? "No users yet." : "No users match these filters."}
                  </td>
                </tr>
              )}
              {filtered.map((u) => (
                <tr key={u.id} className="border-t border-slate-200/70 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-maroon-700 text-[11px] font-bold text-white">
                        {u.fullName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{u.fullName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-2.5"><Badge tone={roleTone[u.role]} className="capitalize">{u.role}</Badge></td>
                  <td className="px-4 py-2.5">
                    {u.kycStatus === "verified" ? (
                      <CheckCircle2 className="h-4 w-4 text-gold-700 dark:text-gold-300" />
                    ) : (
                      <span title={u.kycStatus.replace(/_/g, " ")}>
                        <XCircle className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2.5 text-right">
                    <Switch
                      checked={!u.disabled}
                      disabled={updating === u.id}
                      onCheckedChange={() => toggleDisabled(u)}
                      className={cn(updating === u.id && "opacity-50")}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
