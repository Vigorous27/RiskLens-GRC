import {
  Fragment,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  Boxes,
  CheckCircle2,
  Clock3,
  FileText,
  Gauge,
  Link2,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import api from "../services/api";


function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [coverage, setCoverage] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [priorityRisks, setPriorityRisks] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    async function loadDashboard() {
      try {
        setError("");

        const [
          summaryResponse,
          coverageResponse,
          heatmapResponse,
          priorityResponse,
          auditResponse,
        ] = await Promise.all([
          api.get("/dashboard/summary"),
          api.get("/dashboard/control-coverage"),
          api.get("/dashboard/heatmap"),
          api.get("/dashboard/priority-risks"),
          api.get("/audit-logs?limit=5"),
        ]);

        setSummary(summaryResponse.data);
        setCoverage(coverageResponse.data);
        setHeatmap(heatmapResponse.data);
        setPriorityRisks(priorityResponse.data);
        setAuditLogs(auditResponse.data);

      } catch (err) {
        console.error(
          "Dashboard load failed:",
          err
        );

        setError(
          err.response?.data?.detail ||
            "Unable to load dashboard data."
        );

      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);


  const severityData = useMemo(() => {
    const distribution =
      summary?.severity_distribution || {};

    return [
      {
        name: "Low",
        value: distribution.Low || 0,
      },
      {
        name: "Medium",
        value: distribution.Medium || 0,
      },
      {
        name: "High",
        value: distribution.High || 0,
      },
      {
        name: "Critical",
        value: distribution.Critical || 0,
      },
    ];
  }, [summary]);


  const severityColors = {
    Low: "#22c55e",
    Medium: "#f59e0b",
    High: "#f97316",
    Critical: "#ef4444",
  };


  const cards = [
    {
      label: "Total Assets",
      value: summary?.total_assets ?? 0,
      icon: Boxes,
      helper: "Tracked business assets",
    },
    {
      label: "Open Risks",
      value: summary?.open_risks ?? 0,
      icon: Activity,
      helper: "Risks requiring attention",
    },
    {
      label: "Critical Risks",
      value: summary?.critical_risks ?? 0,
      icon: AlertTriangle,
      helper: "Highest-priority exposure",
    },
    {
      label: "Control Coverage",
      value: `${
        coverage?.coverage_percentage ?? 0
      }%`,
      icon: Gauge,
      helper: `${
        coverage?.implemented_controls ?? 0
      } of ${
        coverage?.total_controls ?? 0
      } controls implemented`,
    },
  ];


  function getSeverityBadge(severity) {
    const styles = {
      Low:
        "bg-emerald-50 text-emerald-700 border-emerald-200",

      Medium:
        "bg-amber-50 text-amber-700 border-amber-200",

      High:
        "bg-orange-50 text-orange-700 border-orange-200",

      Critical:
        "bg-red-50 text-red-700 border-red-200",
    };

    return (
      styles[severity] ||
      "bg-slate-50 text-slate-700 border-slate-200"
    );
  }


  function getHeatColor(
    likelihood,
    impact
  ) {
    const score =
      likelihood * impact;

    if (score >= 16) {
      return "bg-red-500 text-white";
    }

    if (score >= 11) {
      return "bg-orange-400 text-slate-950";
    }

    if (score >= 6) {
      return "bg-amber-300 text-slate-950";
    }

    return "bg-emerald-300 text-slate-950";
  }


  function getHeatCount(
    likelihood,
    impact
  ) {
    const point = heatmap.find(
      (item) =>
        item.likelihood === likelihood &&
        item.impact === impact
    );

    return point?.count || 0;
  }


  function getAuditDisplay(action) {
    const displays = {
      CREATE: {
        icon: Plus,
        iconClass:
          "text-emerald-600",
        backgroundClass:
          "bg-emerald-50",
      },

      UPDATE: {
        icon: RefreshCw,
        iconClass:
          "text-indigo-600",
        backgroundClass:
          "bg-indigo-50",
      },

      DELETE: {
        icon: Trash2,
        iconClass:
          "text-red-600",
        backgroundClass:
          "bg-red-50",
      },

      MAP: {
        icon: Link2,
        iconClass:
          "text-cyan-600",
        backgroundClass:
          "bg-cyan-50",
      },

      UNMAP: {
        icon: Link2,
        iconClass:
          "text-orange-600",
        backgroundClass:
          "bg-orange-50",
      },

      GENERATE: {
        icon: Sparkles,
        iconClass:
          "text-violet-600",
        backgroundClass:
          "bg-violet-50",
      },

      EXPORT: {
        icon: FileText,
        iconClass:
          "text-slate-600",
        backgroundClass:
          "bg-slate-100",
      },
    };

    return (
      displays[action] || {
        icon: Activity,
        iconClass:
          "text-slate-600",
        backgroundClass:
          "bg-slate-100",
      }
    );
  }


  function formatActivityTime(
    createdAt
  ) {
    if (!createdAt) {
      return "";
    }

    let timestamp = createdAt;

    /*
      PostgreSQL currently stores the audit
      timestamp without a timezone.

      The backend generates it using UTC, so
      append Z before JavaScript parses it.
    */
    if (
      !timestamp.endsWith("Z") &&
      !/[+-]\d\d:\d\d$/.test(timestamp)
    ) {
      timestamp = `${timestamp}Z`;
    }

    const createdDate =
      new Date(timestamp);

    if (
      Number.isNaN(
        createdDate.getTime()
      )
    ) {
      return "";
    }

    const now = new Date();

    const differenceSeconds =
      Math.max(
        0,
        Math.floor(
          (
            now.getTime() -
            createdDate.getTime()
          ) / 1000
        )
      );

    if (differenceSeconds < 60) {
      return "Just now";
    }

    const differenceMinutes =
      Math.floor(
        differenceSeconds / 60
      );

    if (differenceMinutes < 60) {
      return `${differenceMinutes} min${
        differenceMinutes === 1
          ? ""
          : "s"
      } ago`;
    }

    const differenceHours =
      Math.floor(
        differenceMinutes / 60
      );

    if (differenceHours < 24) {
      return `${differenceHours} hour${
        differenceHours === 1
          ? ""
          : "s"
      } ago`;
    }

    const differenceDays =
      Math.floor(
        differenceHours / 24
      );

    if (differenceDays < 7) {
      return `${differenceDays} day${
        differenceDays === 1
          ? ""
          : "s"
      } ago`;
    }

    return createdDate.toLocaleDateString(
      undefined,
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  }


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading RiskLens dashboard...
          </p>

        </div>

      </div>
    );
  }


  return (
    <>
      {/* PAGE HEADER */}

      <header className="border-b border-slate-200 bg-white px-6 py-6 sm:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

            <div>

              <p className="text-sm font-medium text-indigo-600">
                Risk overview
              </p>

              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
                Cybersecurity Risk Dashboard
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Monitor assets, risk exposure,
                and security-control implementation.
              </p>

            </div>


            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-600">

              <CheckCircle2 className="h-4 w-4 text-emerald-500" />

              Authenticated workspace

            </div>

          </div>

        </div>

      </header>


      {/* DASHBOARD CONTENT */}

      <div className="mx-auto max-w-7xl space-y-8 p-6 sm:p-8">

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}


        {/* KPI CARDS */}

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >

                <div className="flex items-center justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">

                    <Icon className="h-5 w-5 text-slate-700" />

                  </div>

                </div>


                <p className="mt-5 text-sm font-medium text-slate-500">
                  {card.label}
                </p>


                <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
                  {card.value}
                </p>


                <p className="mt-2 text-xs text-slate-400">
                  {card.helper}
                </p>

              </div>
            );
          })}

        </section>


        {/* CHART + HEAT MAP */}

        <section className="grid gap-6 xl:grid-cols-2">

          {/* SEVERITY CHART */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-lg font-semibold text-slate-950">
                  Risk Severity
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Distribution of current risk levels.
                </p>

              </div>

              <BarChart3 className="h-5 w-5 text-slate-400" />

            </div>


            <div className="mt-6 h-72">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <PieChart>

                  <Pie
                    data={severityData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={4}
                  >

                    {severityData.map(
                      (entry) => (
                        <Cell
                          key={entry.name}
                          fill={
                            severityColors[
                              entry.name
                            ]
                          }
                        />
                      )
                    )}

                  </Pie>

                  <Tooltip />

                </PieChart>

              </ResponsiveContainer>

            </div>


            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

              {severityData.map(
                (item) => (
                  <div
                    key={item.name}
                    className="rounded-xl bg-slate-50 p-3"
                  >

                    <div className="flex items-center gap-2">

                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            severityColors[
                              item.name
                            ],
                        }}
                      />

                      <span className="text-xs text-slate-500">
                        {item.name}
                      </span>

                    </div>


                    <p className="mt-2 text-lg font-semibold text-slate-950">
                      {item.value}
                    </p>

                  </div>
                )
              )}

            </div>

          </div>


          {/* HEAT MAP */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div>

              <h2 className="text-lg font-semibold text-slate-950">
                Risk Heat Map
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Likelihood versus business impact.
              </p>

            </div>


            <div className="mt-6 overflow-x-auto">

              <div className="min-w-[520px]">

                <div className="grid grid-cols-6 gap-2">

                  <div />


                  {[1, 2, 3, 4, 5].map(
                    (impact) => (
                      <div
                        key={impact}
                        className="text-center text-xs font-medium text-slate-500"
                      >
                        Impact {impact}
                      </div>
                    )
                  )}


                  {[5, 4, 3, 2, 1].map(
                    (likelihood) => (
                      <Fragment
                        key={likelihood}
                      >

                        <div className="flex items-center text-xs font-medium text-slate-500">
                          Likelihood{" "}
                          {likelihood}
                        </div>


                        {[1, 2, 3, 4, 5].map(
                          (impact) => {
                            const count =
                              getHeatCount(
                                likelihood,
                                impact
                              );

                            return (
                              <div
                                key={`${likelihood}-${impact}`}
                                className={`flex h-16 items-center justify-center rounded-xl text-sm font-semibold ${getHeatColor(
                                  likelihood,
                                  impact
                                )}`}
                                title={`Likelihood ${likelihood}, Impact ${impact}`}
                              >
                                {count}
                              </div>
                            );
                          }
                        )}

                      </Fragment>
                    )
                  )}

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* PRIORITY RISKS */}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

            <div>

              <h2 className="text-lg font-semibold text-slate-950">
                Priority Risks
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Highest-scoring risks requiring attention.
              </p>

            </div>


            <AlertTriangle className="h-5 w-5 text-slate-400" />

          </div>


          {priorityRisks.length === 0 ? (

            <div className="px-6 py-12 text-center">

              <ShieldCheck className="mx-auto h-8 w-8 text-slate-300" />


              <p className="mt-3 text-sm font-medium text-slate-600">
                No risks recorded
              </p>


              <p className="mt-1 text-xs text-slate-400">
                Add risks to populate the
                priority queue.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[700px]">

                <thead className="bg-slate-50">

                  <tr className="text-left text-xs font-medium uppercase tracking-wider text-slate-500">

                    <th className="px-6 py-3">
                      Risk
                    </th>

                    <th className="px-6 py-3">
                      Severity
                    </th>

                    <th className="px-6 py-3">
                      Score
                    </th>

                    <th className="px-6 py-3">
                      Likelihood
                    </th>

                    <th className="px-6 py-3">
                      Impact
                    </th>

                    <th className="px-6 py-3">
                      Status
                    </th>

                  </tr>

                </thead>


                <tbody className="divide-y divide-slate-100">

                  {priorityRisks.map(
                    (risk) => (
                      <tr
                        key={risk.id}
                        className="transition hover:bg-slate-50"
                      >

                        <td className="px-6 py-4">

                          <p className="text-sm font-medium text-slate-900">
                            {risk.title}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Asset #
                            {risk.asset_id}
                          </p>

                        </td>


                        <td className="px-6 py-4">

                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getSeverityBadge(
                              risk.severity
                            )}`}
                          >
                            {risk.severity}
                          </span>

                        </td>


                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                          {risk.risk_score}
                        </td>


                        <td className="px-6 py-4 text-sm text-slate-600">
                          {risk.likelihood}
                          /5
                        </td>


                        <td className="px-6 py-4 text-sm text-slate-600">
                          {risk.impact}
                          /5
                        </td>


                        <td className="px-6 py-4">

                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            {risk.status}
                          </span>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>


        {/* RECENT ACTIVITY */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

            <div>

              <h2 className="text-lg font-semibold text-slate-950">
                Recent Activity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Audit trail of recent changes
                and security-management actions.
              </p>

            </div>


            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">

              <Clock3 className="h-5 w-5 text-slate-500" />

            </div>

          </div>


          {auditLogs.length === 0 ? (

            <div className="px-6 py-12 text-center">

              <Clock3 className="mx-auto h-8 w-8 text-slate-300" />

              <p className="mt-3 text-sm font-medium text-slate-600">
                No recent activity
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Changes to assets, risks,
                controls, recommendations,
                and reports will appear here.
              </p>

            </div>

          ) : (

            <div className="divide-y divide-slate-100">

              {auditLogs.map((log) => {
                const auditDisplay =
                  getAuditDisplay(
                    log.action
                  );

                const Icon =
                  auditDisplay.icon;

                return (
                  <div
                    key={log.id}
                    className="flex gap-4 px-6 py-5 transition hover:bg-slate-50"
                  >

                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${auditDisplay.backgroundClass}`}
                    >

                      <Icon
                        className={`h-4.5 w-4.5 ${auditDisplay.iconClass}`}
                      />

                    </div>


                    <div className="min-w-0 flex-1">

                      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">

                        <div>

                          <p className="text-sm font-medium leading-6 text-slate-800">
                            {log.description}
                          </p>


                          <div className="mt-1.5 flex flex-wrap items-center gap-2">

                            <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                              {log.action}
                            </span>


                            <span className="text-xs text-slate-400">
                              {log.entity_type}
                            </span>


                            {log.entity_id !==
                              null && (
                              <>
                                <span className="text-xs text-slate-300">
                                  •
                                </span>

                                <span className="text-xs text-slate-400">
                                  ID #
                                  {log.entity_id}
                                </span>
                              </>
                            )}

                          </div>

                        </div>


                        <div className="flex shrink-0 items-center gap-1.5 text-xs text-slate-400">

                          <Clock3 className="h-3.5 w-3.5" />

                          {formatActivityTime(
                            log.created_at
                          )}

                        </div>

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>

          )}

        </section>


        {/* POSTURE SUMMARY */}

        <section className="rounded-2xl bg-slate-950 p-6 text-white shadow-sm">

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

            <div>

              <p className="text-sm font-medium text-indigo-300">
                Current security posture
              </p>


              <h2 className="mt-2 text-2xl font-semibold">
                Focus mitigation on your
                highest-risk exposures.
              </h2>


              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                RiskLens prioritizes risks
                using likelihood and impact
                while tracking implementation
                progress for security controls.
              </p>

            </div>


            <div className="grid grid-cols-2 gap-3">

              <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-4">

                <p className="text-xs text-slate-400">
                  Critical
                </p>

                <p className="mt-1 text-2xl font-semibold">
                  {summary?.critical_risks ??
                    0}
                </p>

              </div>


              <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-4">

                <p className="text-xs text-slate-400">
                  Coverage
                </p>

                <p className="mt-1 text-2xl font-semibold">
                  {coverage
                    ?.coverage_percentage ??
                    0}
                  %
                </p>

              </div>

            </div>

          </div>

        </section>

      </div>
    </>
  );
}


export default Dashboard;