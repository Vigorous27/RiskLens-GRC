import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import api from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await api.post(
        "/auth/login",
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      localStorage.setItem(
        "access_token",
        response.data.access_token
      );
      
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 lg:grid lg:grid-cols-2">
      <section className="relative hidden overflow-hidden p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" />
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 backdrop-blur">
              <ShieldCheck className="h-6 w-6 text-indigo-300" />
            </div>

            <div>
              <h1 className="text-xl font-semibold text-white">
                RiskLens GRC
              </h1>
              <p className="text-xs text-slate-400">
                Cybersecurity Risk Management
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-4 py-2 text-sm text-indigo-200">
            <LockKeyhole className="h-4 w-4" />
            Secure by design
          </div>

          <h2 className="text-5xl font-semibold leading-tight tracking-tight text-white">
            Understand your risks.
            <span className="block text-indigo-300">
              Protect what matters.
            </span>
          </h2>

          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
            Identify assets, assess cybersecurity risks,
            map security controls, and track mitigation
            progress from one focused workspace.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-sm font-medium text-white">
                NIST CSF
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Framework mapping
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-sm font-medium text-white">
                ISO 27001
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Control alignment
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-sm font-medium text-white">
                CIS Controls
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Practical safeguards
              </p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-500">
          Built for small and medium-sized businesses.
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>

              <div>
                <h1 className="font-semibold text-slate-950">
                  RiskLens GRC
                </h1>
                <p className="text-xs text-slate-500">
                  Cybersecurity Risk Management
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-indigo-600">
              Welcome back
            </p>

            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
              Sign in to RiskLens
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Access your cybersecurity risk workspace.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@company.com"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}

              {!loading && (
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <p className="text-center text-xs leading-5 text-slate-400">
              RiskLens GRC helps organizations assess,
              prioritize, and communicate cybersecurity risk.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;