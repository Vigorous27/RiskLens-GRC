import { useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  Link2,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import RiskControlsModal from "../components/RiskControlsModal";
import api from "../services/api";


const emptyForm = {
  title: "",
  asset_id: "",
  threat: "",
  vulnerability: "",
  likelihood: 3,
  impact: 3,
  status: "Open",
  mitigation_plan: "",
};


function Risks() {
  const [risks, setRisks] = useState([]);
  const [assets, setAssets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingRisk, setEditingRisk] = useState(null);

  const [
    controlMappingRisk,
    setControlMappingRisk,
  ] = useState(null);

  const [
    recommendationRisk,
    setRecommendationRisk,
  ] = useState(null);

  const [
    recommendation,
    setRecommendation,
  ] = useState("");

  const [
    recommendationSource,
    setRecommendationSource,
  ] = useState("");

  const [
    generatingRecommendation,
    setGeneratingRecommendation,
  ] = useState(false);

  const [
    applyingRecommendation,
    setApplyingRecommendation,
  ] = useState(false);

  const [
    recommendationError,
    setRecommendationError,
  ] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);


  useEffect(() => {
    loadPage();
  }, []);


  async function loadPage() {
    try {
      setError("");

      const [
        risksResponse,
        assetsResponse,
      ] = await Promise.all([
        api.get("/risks"),
        api.get("/assets"),
      ]);

      setRisks(risksResponse.data);
      setAssets(assetsResponse.data);

    } catch (err) {
      console.error(
        "Unable to load risks:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load risk register."
      );

    } finally {
      setLoading(false);
    }
  }


  const assetMap = useMemo(() => {
    return Object.fromEntries(
      assets.map((asset) => [
        asset.id,
        asset.name,
      ])
    );
  }, [assets]);


  function openCreateModal() {
    setEditingRisk(null);

    setForm({
      ...emptyForm,
      asset_id:
        assets.length > 0
          ? assets[0].id
          : "",
    });

    setShowModal(true);
  }


  function openEditModal(risk) {
    setEditingRisk(risk);

    setForm({
      title: risk.title,
      asset_id: risk.asset_id,
      threat: risk.threat,
      vulnerability: risk.vulnerability,
      likelihood: risk.likelihood,
      impact: risk.impact,
      status: risk.status,
      mitigation_plan:
        risk.mitigation_plan || "",
    });

    setShowModal(true);
  }


  function closeModal() {
    setShowModal(false);
    setEditingRisk(null);
    setForm(emptyForm);
  }


  function closeRecommendationModal() {
    setRecommendationRisk(null);
    setRecommendation("");
    setRecommendationSource("");
    setRecommendationError("");
  }


  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        [
          "asset_id",
          "likelihood",
          "impact",
        ].includes(name)
          ? Number(value)
          : value,
    }));
  }


  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingRisk) {
        await api.put(
          `/risks/${editingRisk.id}`,
          form
        );
      } else {
        await api.post(
          "/risks",
          form
        );
      }

      await loadPage();
      closeModal();

    } catch (err) {
      console.error(
        "Risk save failed:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to save risk."
      );

    } finally {
      setSaving(false);
    }
  }


  async function handleDelete(risk) {
    const confirmed = window.confirm(
      `Delete "${risk.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/risks/${risk.id}`
      );

      setRisks((current) =>
        current.filter(
          (item) =>
            item.id !== risk.id
        )
      );

    } catch (err) {
      console.error(
        "Risk deletion failed:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to delete risk."
      );
    }
  }


  async function handleGenerateRecommendation(
    risk
  ) {
    try {
      setRecommendationRisk(risk);
      setRecommendation("");
      setRecommendationSource("");
      setRecommendationError("");
      setGeneratingRecommendation(true);

      const response = await api.post(
        `/risks/${risk.id}/ai-recommendation`
      );

      setRecommendation(
        response.data.recommendation
      );

      setRecommendationSource(
        response.data.source
      );

    } catch (err) {
      console.error(
        "Recommendation generation failed:",
        err
      );

      setRecommendationError(
        err.response?.data?.detail ||
          "Unable to generate recommendation."
      );

    } finally {
      setGeneratingRecommendation(false);
    }
  }


  async function handleRegenerateRecommendation() {
    if (!recommendationRisk) {
      return;
    }

    await handleGenerateRecommendation(
      recommendationRisk
    );
  }


  async function handleApplyRecommendation() {
    if (
      !recommendationRisk ||
      !recommendation
    ) {
      return;
    }

    try {
      setApplyingRecommendation(true);
      setRecommendationError("");

      const updatedRisk = {
        title: recommendationRisk.title,
        asset_id:
          recommendationRisk.asset_id,
        threat:
          recommendationRisk.threat,
        vulnerability:
          recommendationRisk.vulnerability,
        likelihood:
          recommendationRisk.likelihood,
        impact:
          recommendationRisk.impact,
        status:
          recommendationRisk.status,
        mitigation_plan:
          recommendation,
      };

      await api.put(
        `/risks/${recommendationRisk.id}`,
        updatedRisk
      );

      await loadPage();

      closeRecommendationModal();

    } catch (err) {
      console.error(
        "Unable to apply recommendation:",
        err
      );

      setRecommendationError(
        err.response?.data?.detail ||
          "Unable to apply recommendation."
      );

    } finally {
      setApplyingRecommendation(false);
    }
  }


  function getSeverityStyle(severity) {
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


  const criticalCount = risks.filter(
    (risk) =>
      risk.severity === "Critical"
  ).length;

  const openCount = risks.filter(
    (risk) =>
      risk.status === "Open"
  ).length;


  return (
    <>
      {/* HEADER */}

      <header className="border-b border-slate-200 bg-white px-6 py-6 sm:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>

              <p className="text-sm font-medium text-indigo-600">
                Risk register
              </p>

              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
                Cybersecurity Risks
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Assess threats, vulnerabilities,
                likelihood, impact, and mitigation
                plans across business assets.
              </p>

            </div>


            <button
              onClick={openCreateModal}
              disabled={
                assets.length === 0
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >

              <Plus className="h-4 w-4" />

              Add Risk

            </button>

          </div>

        </div>

      </header>


      {/* PAGE CONTENT */}

      <div className="mx-auto max-w-7xl space-y-6 p-6 sm:p-8">

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}


        {/* SUMMARY CARDS */}

        <div className="grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">

              <AlertTriangle className="h-5 w-5 text-slate-700" />

            </div>


            <p className="mt-4 text-sm text-slate-500">
              Total Risks
            </p>

            <p className="mt-1 text-2xl font-semibold text-slate-950">
              {risks.length}
            </p>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">

              <ShieldCheck className="h-5 w-5 text-slate-700" />

            </div>


            <p className="mt-4 text-sm text-slate-500">
              Open Risks
            </p>

            <p className="mt-1 text-2xl font-semibold text-slate-950">
              {openCount}
            </p>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">

              <AlertTriangle className="h-5 w-5 text-red-600" />

            </div>


            <p className="mt-4 text-sm text-slate-500">
              Critical Risks
            </p>

            <p className="mt-1 text-2xl font-semibold text-slate-950">
              {criticalCount}
            </p>

          </div>

        </div>


        {/* RISK TABLE */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-5">

            <h2 className="text-lg font-semibold text-slate-950">
              Risk Register
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Risks are automatically scored using
              likelihood × impact.
            </p>

          </div>


          {loading ? (

            <div className="px-6 py-14 text-center text-sm text-slate-500">
              Loading risks...
            </div>

          ) : risks.length === 0 ? (

            <div className="px-6 py-14 text-center">

              <ShieldCheck className="mx-auto h-9 w-9 text-slate-300" />

              <p className="mt-3 text-sm font-medium text-slate-700">
                No risks recorded
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Add a risk to begin building
                your risk register.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1200px]">

                <thead className="bg-slate-50">

                  <tr className="text-left text-xs font-medium uppercase tracking-wider text-slate-500">

                    <th className="px-6 py-3">
                      Risk
                    </th>

                    <th className="px-6 py-3">
                      Asset
                    </th>

                    <th className="px-6 py-3">
                      Threat
                    </th>

                    <th className="px-6 py-3">
                      Severity
                    </th>

                    <th className="px-6 py-3">
                      Score
                    </th>

                    <th className="px-6 py-3">
                      Status
                    </th>

                    <th className="px-6 py-3">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody className="divide-y divide-slate-100">

                  {risks.map((risk) => (

                    <tr
                      key={risk.id}
                      className="transition hover:bg-slate-50"
                    >

                      <td className="px-6 py-4">

                        <p className="max-w-xs text-sm font-medium text-slate-900">
                          {risk.title}
                        </p>

                        <p className="mt-1 max-w-xs truncate text-xs text-slate-400">
                          {risk.vulnerability}
                        </p>

                      </td>


                      <td className="px-6 py-4 text-sm text-slate-600">

                        {assetMap[
                          risk.asset_id
                        ] ||
                          `Asset #${risk.asset_id}`}

                      </td>


                      <td className="px-6 py-4 text-sm text-slate-600">
                        {risk.threat}
                      </td>


                      <td className="px-6 py-4">

                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getSeverityStyle(
                            risk.severity
                          )}`}
                        >
                          {risk.severity}
                        </span>

                      </td>


                      <td className="px-6 py-4">

                        <p className="text-sm font-semibold text-slate-900">
                          {risk.risk_score}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          L{risk.likelihood} × I
                          {risk.impact}
                        </p>

                      </td>


                      <td className="px-6 py-4">

                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {risk.status}
                        </span>

                      </td>


                      <td className="px-6 py-4">

                        <div className="flex items-center gap-2">

                          {/* Recommendation */}

                          <button
                            onClick={() =>
                              handleGenerateRecommendation(
                                risk
                              )
                            }
                            className="rounded-lg border border-violet-100 p-2 text-violet-600 transition hover:bg-violet-50 hover:text-violet-800"
                            title="Generate mitigation recommendation"
                          >

                            <Sparkles className="h-4 w-4" />

                          </button>


                          {/* Map Controls */}

                          <button
                            onClick={() =>
                              setControlMappingRisk(
                                risk
                              )
                            }
                            className="rounded-lg border border-indigo-100 p-2 text-indigo-500 transition hover:bg-indigo-50 hover:text-indigo-700"
                            title="Map security controls"
                          >

                            <Link2 className="h-4 w-4" />

                          </button>


                          {/* Edit */}

                          <button
                            onClick={() =>
                              openEditModal(
                                risk
                              )
                            }
                            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                            title="Edit risk"
                          >

                            <Pencil className="h-4 w-4" />

                          </button>


                          {/* Delete */}

                          <button
                            onClick={() =>
                              handleDelete(
                                risk
                              )
                            }
                            className="rounded-lg border border-red-100 p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700"
                            title="Delete risk"
                          >

                            <Trash2 className="h-4 w-4" />

                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </div>


      {/* ADD / EDIT RISK MODAL */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">

          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>

                <p className="text-sm font-medium text-indigo-600">

                  {editingRisk
                    ? "Update assessment"
                    : "New assessment"}

                </p>

                <h2 className="mt-1 text-xl font-semibold text-slate-950">

                  {editingRisk
                    ? "Edit Cybersecurity Risk"
                    : "Add Cybersecurity Risk"}

                </h2>

              </div>


              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >

                <X className="h-5 w-5" />

              </button>

            </div>


            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Risk Title
                </label>

                <input
                  name="title"
                  required
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Customer Database Account Compromise"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />

              </div>


              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Affected Asset
                </label>

                <select
                  name="asset_id"
                  required
                  value={form.asset_id}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                >

                  {assets.map((asset) => (

                    <option
                      key={asset.id}
                      value={asset.id}
                    >
                      {asset.name}
                    </option>

                  ))}

                </select>

              </div>


              <div className="grid gap-5 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Threat
                  </label>

                  <input
                    name="threat"
                    required
                    value={form.threat}
                    onChange={handleChange}
                    placeholder="Credential theft"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />

                </div>


                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  >

                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Mitigated</option>
                    <option>Accepted</option>

                  </select>

                </div>

              </div>


              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Vulnerability
                </label>

                <textarea
                  name="vulnerability"
                  required
                  rows="3"
                  value={form.vulnerability}
                  onChange={handleChange}
                  placeholder="Administrative account does not enforce multi-factor authentication"
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />

              </div>


              <div className="grid gap-5 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Likelihood
                  </label>

                  <select
                    name="likelihood"
                    value={form.likelihood}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  >

                    {[1, 2, 3, 4, 5].map(
                      (value) => (

                        <option
                          key={value}
                          value={value}
                        >
                          {value} / 5
                        </option>

                      )
                    )}

                  </select>

                </div>


                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Impact
                  </label>

                  <select
                    name="impact"
                    value={form.impact}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  >

                    {[1, 2, 3, 4, 5].map(
                      (value) => (

                        <option
                          key={value}
                          value={value}
                        >
                          {value} / 5
                        </option>

                      )
                    )}

                  </select>

                </div>

              </div>


              <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">

                <p className="text-sm font-medium text-indigo-900">
                  Estimated Risk Score
                </p>

                <p className="mt-1 text-2xl font-semibold text-indigo-950">
                  {form.likelihood *
                    form.impact}
                </p>

                <p className="mt-1 text-xs text-indigo-700">
                  Final score and severity are
                  calculated automatically by
                  the RiskLens backend.
                </p>

              </div>


              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Mitigation Plan
                </label>

                <textarea
                  name="mitigation_plan"
                  rows="5"
                  value={
                    form.mitigation_plan
                  }
                  onChange={handleChange}
                  placeholder="Enable MFA, restrict privileged access, review account activity..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />

              </div>


              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
                >

                  {saving
                    ? "Saving..."
                    : editingRisk
                      ? "Save Changes"
                      : "Add Risk"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* CONTROL MAPPING MODAL */}

      {controlMappingRisk && (

        <RiskControlsModal
          risk={controlMappingRisk}
          onClose={() =>
            setControlMappingRisk(null)
          }
        />

      )}


      {/* RECOMMENDATION MODAL */}

      {recommendationRisk && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">

          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">

              <div>

                <div className="flex items-center gap-2">

                  <Sparkles className="h-5 w-5 text-violet-600" />

                  <p className="text-sm font-medium text-violet-600">
                    Mitigation recommendation
                  </p>

                </div>


                <h2 className="mt-2 text-xl font-semibold text-slate-950">
                  {recommendationRisk.title}
                </h2>


                <p className="mt-2 text-sm text-slate-500">
                  Review the generated recommendation
                  before applying it to this risk.
                </p>

              </div>


              <button
                onClick={
                  closeRecommendationModal
                }
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >

                <X className="h-5 w-5" />

              </button>

            </div>


            <div className="p-6">

              {/* Source badge */}

              {recommendationSource && (

                <div className="mb-5">

                  {recommendationSource ===
                  "openai" ? (

                    <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700">

                      <Sparkles className="h-3.5 w-3.5" />

                      AI Generated

                    </span>

                  ) : (

                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">

                      <ShieldCheck className="h-3.5 w-3.5" />

                      RiskLens Recommendation Engine

                    </span>

                  )}

                </div>

              )}


              {recommendationError && (

                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {recommendationError}
                </div>

              )}


              {generatingRecommendation ? (

                <div className="py-14 text-center">

                  <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600" />

                  <p className="mt-4 text-sm font-medium text-slate-700">
                    Analyzing risk...
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    RiskLens is preparing mitigation actions.
                  </p>

                </div>

              ) : recommendation ? (

                <>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                      {recommendation}
                    </p>

                  </div>


                  <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">

                    <p className="text-xs leading-5 text-amber-800">
                      Review recommendations before applying
                      them. RiskLens recommendations support
                      risk-management decisions and do not
                      represent formal compliance certification.
                    </p>

                  </div>


                  <div className="mt-6 flex flex-col justify-end gap-3 border-t border-slate-200 pt-5 sm:flex-row">

                    <button
                      type="button"
                      onClick={
                        handleRegenerateRecommendation
                      }
                      disabled={
                        generatingRecommendation ||
                        applyingRecommendation
                      }
                      className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >

                      Regenerate

                    </button>


                    <button
                      type="button"
                      onClick={
                        handleApplyRecommendation
                      }
                      disabled={
                        applyingRecommendation
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                    >

                      {applyingRecommendation
                        ? "Applying..."
                        : "Apply to Mitigation Plan"}

                    </button>

                  </div>

                </>

              ) : (

                <div className="py-10 text-center text-sm text-slate-500">
                  No recommendation available.
                </div>

              )}

            </div>

          </div>

        </div>

      )}

    </>
  );
}


export default Risks;