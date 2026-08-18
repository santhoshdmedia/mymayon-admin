import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import { Card, Btn, Input, Toast, PageHeader } from "../components/ui";
import { Shield, User } from "lucide-react";

export default function Settings() {
  const { admin } = useAuth();
  const [form, setForm]   = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);
  const [toast,  setToast]  = useState(null);
  const [errors, setErrors] = useState({});

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = {};
    if (!form.currentPassword) errs.currentPassword = "Required";
    if (form.newPassword.length < 6) errs.newPassword = "At least 6 characters";
    if (form.newPassword !== form.confirmPassword) errs.confirmPassword = "Passwords don't match";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      await api.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showToast("Password changed successfully");
    } catch (err) {
      showToast(err.message || "Failed to change password", "error");
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Settings" description="Manage your admin account" />

      {/* Profile info */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-navy-800 flex items-center justify-center text-gold-400 font-bold text-xl flex-shrink-0">
            {admin?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-navy-800 text-lg">{admin?.name}</h2>
            <p className="text-gray-500 text-sm">{admin?.email}</p>
            <span className="inline-block mt-1 text-xs bg-gold-50 text-gold-700 border border-gold-200 px-2 py-0.5 rounded-full font-semibold capitalize">
              {admin?.role?.replace("_", " ")}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Account ID</p>
            <p className="font-mono text-xs text-gray-600 break-all">{admin?._id}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Last Login</p>
            <p className="text-gray-600 text-xs">{admin?.lastLogin ? new Date(admin.lastLogin).toLocaleString("en-IN") : "—"}</p>
          </div>
        </div>
      </Card>

      {/* Change password */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-5 h-5 text-navy-600" />
          <h2 className="font-bold text-navy-800">Change Password</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Current Password" name="currentPassword" type="password"
            value={form.currentPassword} onChange={onChange}
            placeholder="••••••••" error={errors.currentPassword} />
          <Input label="New Password" name="newPassword" type="password"
            value={form.newPassword} onChange={onChange}
            placeholder="Min 6 characters" error={errors.newPassword} />
          <Input label="Confirm New Password" name="confirmPassword" type="password"
            value={form.confirmPassword} onChange={onChange}
            placeholder="Repeat new password" error={errors.confirmPassword} />
          <Btn type="submit" variant="primary" loading={saving}>
            Update Password
          </Btn>
        </form>
      </Card>

      {/* API info */}
      <Card className="p-6">
        <h2 className="font-bold text-navy-800 mb-4">API Configuration</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">API Base URL</span>
            <span className="font-mono text-xs bg-gray-100 px-3 py-1 rounded-lg">{import.meta.env.VITE_API_URL}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Frontend URL</span>
            <span className="font-mono text-xs bg-gray-100 px-3 py-1 rounded-lg">http://localhost:5173</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Admin Panel URL</span>
            <span className="font-mono text-xs bg-gray-100 px-3 py-1 rounded-lg">http://localhost:5174</span>
          </div>
        </div>
      </Card>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
