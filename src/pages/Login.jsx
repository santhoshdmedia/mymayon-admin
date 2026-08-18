import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Btn, Input } from "../components/ui";
import { Lock, Mail } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]   = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async e => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gold-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-navy-900 font-bold text-2xl">M</span>
          </div>
          <h1 className="text-2xl font-bold text-white">My Mayon</h1>
          <p className="text-navy-300 text-sm mt-1">Admin Panel</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-navy-800 mb-6">Sign in to continue</h2>
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Email" name="email" type="email"
              value={form.email} onChange={onChange}
              placeholder="admin@mymayon.com" required
            />
            <Input
              label="Password" name="password" type="password"
              value={form.password} onChange={onChange}
              placeholder="••••••••" required
            />
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
                {error}
              </div>
            )}
            <Btn type="submit" variant="primary" className="w-full" size="lg" loading={loading}>
              {!loading && <Lock className="w-4 h-4" />} Sign In
            </Btn>
          </form>
          <p className="text-xs text-gray-400 text-center mt-5">
            Default: admin@mymayon.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
