import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import Assets from "./pages/Assets";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Risks from "./pages/Risks";
import Controls from "./pages/Controls";
import Reports from "./pages/Reports";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/assets"
            element={<Assets />}
          />

          <Route
            path="/risks"
            element={<Risks />}
          />

          <Route
            path="/controls"
            element={<Controls />}
          />    

          <Route
            path="/reports"
            element={<Reports />}
          />


        </Route>

        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;