import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";

import api from "../services/api";

const emptyForm = {
  name: "",
  description: "",
  control_type: "Preventive",
  implementation_status: "Not Implemented",
  nist_csf: "",
  iso_27001: "",
  cis_control: "",
};

function Controls() {
  const [controls, setControls] = useState([]);
  const [coverage, setCoverage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingControl, setEditingControl] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    try {
      setError("");

      const [controlsResponse, coverageResponse] =
        await Promise.all([
          api.get("/controls"),
          api.get("/dashboard/control-coverage"),
        ]);

      setControls(controlsResponse.data);
      setCoverage(coverageResponse.data);
    } catch (err) {
      console.error("Unable to load controls:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load security controls."
      );
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingControl(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEditModal(control) {
    setEditingControl(control);

    setForm({
      name: control.name,
      description: control.description,
      control_type: control.control_type,
      implementation_status:
        control.implementation_status,
      nist_csf: control.nist_csf || "",
      iso_27001: control.iso_27001 || "",
      cis_control: control.cis_control || "",
    });

    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingControl(null);
    setForm(emptyForm);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingControl) {
        await api.put(
          `/controls/${editingControl.id}`,
          form
        );
      } else {
        await api.post("/controls", form);
      }

      await loadPage();
      closeModal();
    } catch (err) {
      console.error("Control save failed:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to save control."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(control) {
    const confirmed = window.confirm(
      `Delete "${control.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/controls/${control.id}`
      );

      await loadPage();
    } catch (err) {
      console.error("Control deletion failed:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to delete control."
      );
    }
  }

  function getStatusStyle(status) {
    const styles = {
      Implemented:
        "bg-emerald-50 text-emerald-700 border-emerald-200",

      Planned:
        "bg-indigo-50 text-indigo-700 border-indigo-200",

      "In Progress":
        "bg-amber-50 text-amber-700 border-amber-200",

      "Not Implemented":
        "bg-red-50 text-red-700 border-red-200",
    };

    return (
      styles[status] ||
      "bg-slate-50 text-slate-700 border-slate-200"
    );
  }

  const implementedCount = controls.filter(
    (control) =>
      control.implementation_status ===
      "Implemented"
  ).length;

  return (
    <>
      <header className="border-b border-slate-200 bg-white px-6 py-6 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-medium text-indigo-600">
                Security controls
              </p>

              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
                Controls & Framework Mapping
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Track security safeguards and map them
                to NIST CSF, ISO 27001, and CIS Controls.
              </p>
            </div>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Add Control
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 p-6 sm:p-8">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <ShieldCheck className="h-5 w-5 text-slate-700" />

            <p className="mt-4 text-sm text-slate-500">
              Total Controls
            </p>

            <p className="mt-1 text-2xl font-semibold text-slate-950">
              {controls.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />

            <p className="mt-4 text-sm text-slate-500">
              Implemented
            </p>

            <p className="mt-1 text-2xl font-semibold text-slate-950">
              {implementedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />

            <p className="mt-4 text-sm text-slate-500">
              Control Coverage
            </p>

            <p className="mt-1 text-2xl font-semibold text-slate-950">
              {coverage?.coverage_percentage ?? 0}%
            </p>
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-950">
              Security Control Library
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage safeguards and track implementation
              progress across frameworks.
            </p>
          </div>

          {loading ? (
            <div className="px-6 py-14 text-center text-sm text-slate-500">
              Loading controls...
            </div>
          ) : controls.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <ShieldCheck className="mx-auto h-9 w-9 text-slate-300" />

              <p className="mt-3 text-sm font-medium text-slate-700">
                No controls recorded
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Add your first security control.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-3">
                      Control
                    </th>

                    <th className="px-6 py-3">
                      Type
                    </th>

                    <th className="px-6 py-3">
                      Status
                    </th>

                    <th className="px-6 py-3">
                      NIST
                    </th>

                    <th className="px-6 py-3">
                      ISO 27001
                    </th>

                    <th className="px-6 py-3">
                      CIS
                    </th>

                    <th className="px-6 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {controls.map((control) => (
                    <tr
                      key={control.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-900">
                          {control.name}
                        </p>

                        <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                          {control.description}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {control.control_type}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                            control.implementation_status
                          )}`}
                        >
                          {control.implementation_status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
                          {control.nist_csf || "—"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {control.iso_27001 || "—"}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {control.cis_control || "—"}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              openEditModal(control)
                            }
                            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(control)
                            }
                            className="rounded-lg border border-red-100 p-2 text-red-500 transition hover:bg-red-50"
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-sm font-medium text-indigo-600">
                  {editingControl
                    ? "Update control"
                    : "New control"}
                </p>

                <h2 className="mt-1 text-xl font-semibold text-slate-950">
                  {editingControl
                    ? "Edit Security Control"
                    : "Add Security Control"}
                </h2>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
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
                  Control Name
                </label>

                <input
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Multi-Factor Authentication"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  name="description"
                  required
                  rows="3"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Control Type
                  </label>

                  <select
                    name="control_type"
                    value={form.control_type}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                  >
                    <option>Preventive</option>
                    <option>Detective</option>
                    <option>Corrective</option>
                    <option>Administrative</option>
                    <option>Technical</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Implementation Status
                  </label>

                  <select
                    name="implementation_status"
                    value={form.implementation_status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                  >
                    <option>Not Implemented</option>
                    <option>Planned</option>
                    <option>In Progress</option>
                    <option>Implemented</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    NIST CSF
                  </label>

                  <input
                    name="nist_csf"
                    value={form.nist_csf}
                    onChange={handleChange}
                    placeholder="PR.AA"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    ISO 27001
                  </label>

                  <input
                    name="iso_27001"
                    value={form.iso_27001}
                    onChange={handleChange}
                    placeholder="Access Control"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    CIS Control
                  </label>

                  <input
                    name="cis_control"
                    value={form.cis_control}
                    onChange={handleChange}
                    placeholder="Control 6"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingControl
                      ? "Save Changes"
                      : "Add Control"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Controls;