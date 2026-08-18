import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, MapPin, Package, MessageSquare,
  LogOut, ChevronLeft, ChevronRight, Settings,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

const NAV = [
  { to: "/",           icon: LayoutDashboard, label: "Dashboard" },
  { to: "/districts",  icon: MapPin,           label: "Districts" },
  { to: "/packages",   icon: Package,          label: "Packages" },
  { to: "/enquiries",  icon: MessageSquare,    label: "Enquiries" },
  { to: "/settings",   icon: Settings,         label: "Settings" },
];

export default function Sidebar() {
  const { admin, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`flex flex-col h-screen bg-navy-800 text-white transition-all duration-300 flex-shrink-0 ${collapsed ? "w-16" : "w-56"}`}>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-navy-700 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center flex-shrink-0">
          <span className="text-navy-900 font-bold text-sm">M</span>
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-sm leading-none">My Mayon</p>
            <p className="text-navy-300 text-xs mt-0.5">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                isActive ? "bg-gold-500 text-navy-900" : "text-navy-200 hover:bg-navy-700 hover:text-white"
              } ${collapsed ? "justify-center" : ""}`
            }>
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + collapse */}
      <div className="border-t border-navy-700 p-3 space-y-2">
        {!collapsed && admin && (
          <div className="px-2 py-1.5">
            <p className="text-sm font-semibold text-white truncate">{admin.name}</p>
            <p className="text-xs text-navy-300 truncate">{admin.email}</p>
            <span className="inline-block mt-1 text-xs bg-gold-500/20 text-gold-300 px-2 py-0.5 rounded-full font-semibold capitalize">
              {admin.role?.replace("_", " ")}
            </span>
          </div>
        )}
        <button onClick={logout}
          className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-navy-300 hover:bg-red-900/40 hover:text-red-300 transition text-sm ${collapsed ? "justify-center" : ""}`}>
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Log Out</span>}
        </button>
        <button onClick={() => setCollapsed(p => !p)}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-navy-400 hover:bg-navy-700 hover:text-white transition text-sm justify-center">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
