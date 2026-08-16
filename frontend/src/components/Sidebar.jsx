import {
    AlertTriangle,
    Boxes,
    FileText,
    LayoutDashboard,
    LogOut,
    ShieldCheck,
    SlidersHorizontal,
  } from "lucide-react";
  import { NavLink } from "react-router-dom";
  
  function Sidebar({ user, onLogout }) {
    const navigation = [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "Assets",
        path: "/assets",
        icon: Boxes,
      },
      {
        name: "Risks",
        path: "/risks",
        icon: AlertTriangle,
      },
      {
        name: "Controls",
        path: "/controls",
        icon: SlidersHorizontal,
      },
      {
        name: "Reports",
        path: "/reports",
        icon: FileText,
      },
    ];
  
    return (
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-slate-950 lg:flex">
        <div className="border-b border-white/10 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 ring-1 ring-white/10">
              <ShieldCheck className="h-6 w-6 text-indigo-300" />
            </div>
  
            <div>
              <p className="font-semibold text-white">
                RiskLens GRC
              </p>
  
              <p className="text-xs text-slate-500">
                Security Risk Workspace
              </p>
            </div>
          </div>
        </div>
  
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navigation.map((item) => {
            const Icon = item.icon;
  
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                    isActive
                      ? "bg-white/10 font-medium text-white ring-1 ring-white/10"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
  
        <div className="border-t border-white/10 p-4">
          <div className="mb-3 rounded-xl bg-white/5 p-4">
            <p className="text-sm font-medium text-white">
              {user?.name || "RiskLens User"}
            </p>
  
            <p className="mt-1 truncate text-xs text-slate-500">
              {user?.email}
            </p>
          </div>
  
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
    );
  }
  
  export default Sidebar;