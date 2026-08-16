import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import api from "../services/api";

function AppLayout() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await api.get("/auth/me");
        setUser(response.data);
      } catch (error) {
        console.error("Unable to load user:", error);
      }
    }

    loadUser();
  }, []);

  function handleLogout() {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar
        user={user}
        onLogout={handleLogout}
      />

      <main className="lg:ml-64">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;