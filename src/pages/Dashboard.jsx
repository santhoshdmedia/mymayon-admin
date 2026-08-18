import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, MapPin, Package, TrendingUp, ArrowRight, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { api } from "../api";
import { StatCard, Card, Spinner, Badge } from "../components/ui";
import { useAuth } from "../context/AuthContext";

function getWeeklyChart(recentEnquiries = []) {
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const counts = Array(7).fill(0);
  recentEnquiries.forEach(e => {
    const d = new Date(e.createdAt).getDay();
    counts[d]++;
  });
  return days.map((name, i) => ({ name, Enquiries: counts[i] }));
}

export default function Dashboard() {
  const { admin } = useAuth();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [enquiries, setEnquiries] = useState([]);

  useEffect(() => {
    Promise.all([api.stats(), api.enquiries("limit=5")])
      .then(([s, e]) => { setStats(s); setEnquiries(e.data || []); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const chartData = getWeeklyChart(stats?.recentEnquiries || []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-800">
          Welcome back, {admin?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here's what's happening with My Mayon today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Enquiries" value={stats?.total}        icon={MessageSquare} color="navy"  delta={stats?.recentEnquiries?.length} />
        <StatCard label="New Enquiries"   value={stats?.newCount}     icon={TrendingUp}    color="blue" />
        <StatCard label="Districts"       value={stats?.districts}    icon={MapPin}        color="gold" />
        <StatCard label="Packages"        value={stats?.packages}     icon={Package}       color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2 p-5">
          <h2 className="font-bold text-navy-800 mb-4">Enquiries This Week</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                cursor={{ fill: "#f9fafb" }}
              />
              <Bar dataKey="Enquiries" fill="#12294F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Pipeline summary */}
        <Card className="p-5">
          <h2 className="font-bold text-navy-800 mb-4">Enquiry Pipeline</h2>
          <div className="space-y-3">
            {[
              { label: "New",       value: stats?.newCount,   color: "bg-blue-500" },
              { label: "Contacted", value: stats?.contacted,  color: "bg-yellow-400" },
              { label: "Converted", value: stats?.converted,  color: "bg-green-500" },
            ].map(({ label, value, color }) => {
              const pct = stats?.total ? Math.round((value / stats.total) * 100) : 0;
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 font-medium">{label}</span>
                    <span className="font-bold text-navy-800">{value} <span className="text-gray-400 font-normal text-xs">({pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <Link to="/enquiries" className="flex items-center gap-1 text-gold-600 text-sm font-semibold mt-5 hover:gap-2 transition-all">
            View all enquiries <ArrowRight className="w-4 h-4" />
          </Link>
        </Card>
      </div>

      {/* Recent enquiries table */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-navy-800">Recent Enquiries</h2>
          <Link to="/enquiries" className="text-sm text-gold-600 font-semibold hover:text-gold-500 flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {enquiries.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">No enquiries yet</div>
          ) : (
            enquiries.map(e => (
              <div key={e._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition">
                <div className="w-9 h-9 rounded-full bg-navy-50 border border-navy-100 flex items-center justify-center flex-shrink-0 font-bold text-navy-700 text-sm">
                  {e.fullName?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy-800 text-sm truncate">{e.fullName}</p>
                  <p className="text-xs text-gray-500 truncate">{e.phone} · {e.destination || "No destination"}</p>
                </div>
                <Badge label={e.status} />
                <div className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap">
                  <Clock className="w-3 h-3" />
                  {new Date(e.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
