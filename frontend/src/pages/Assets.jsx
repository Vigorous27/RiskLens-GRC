import { useEffect, useState } from "react";
import {
  Boxes,
  Globe2,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";

import api from "../services/api";


const emptyForm = {
  name: "",
  asset_type: "",
  owner: "",
  criticality: "Medium",
  internet_facing: false,
  data_sensitivity: "Internal",
  existing_controls: "",
};


function Assets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);


  useEffect(() => {
    loadAssets();
  }, []);


  async function loadAssets() {
    try {
      setError("");

      const response = await api.get("/assets");

      setAssets(response.data);

    } catch (err) {
      console.error("Unable to load assets:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load assets."
      );

    } finally {
      setLoading(false);
    }
  }


  function openCreateModal() {
    setEditingAsset(null);
    setForm(emptyForm);
    setShowModal(true);
  }


  function openEditModal(asset) {
    setEditingAsset(asset);

    setForm({
      name: asset.name,
      asset_type: asset.asset_type,
      owner: asset.owner || "",
      criticality: asset.criticality,
      internet_facing: asset.internet_facing,
      data_sensitivity: asset.data_sensitivity,
      existing_controls:
        asset.existing_controls || "",
    });

    setShowModal(true);
  }


  function closeModal() {
    setShowModal(false);
    setEditingAsset(null);
    setForm(emptyForm);
  }


  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }


  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingAsset) {
        await api.put(
          `/assets/${editingAsset.id}`,
          form
        );
      } else {
        await api.post(
          "/assets",
          form
        );
      }

      await loadAssets();

      closeModal();

    } catch (err) {
      console.error("Asset save failed:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to save asset."
      );

    } finally {
      setSaving(false);
    }
  }


  async function handleDelete(asset) {
    const confirmed = window.confirm(
      `Delete "${asset.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(
        `/assets/${asset.id}`
      );

      setAssets((current) =>
        current.filter(
          (item) => item.id !== asset.id
        )
      );

    } catch (err) {
      console.error("Delete failed:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to delete asset."
      );
    }
  }


  function getCriticalityStyle(value) {
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
      styles[value] ||
      "bg-slate-50 text-slate-700 border-slate-200"
    );
  }


  return (
    <>
      <header className="border-b border-slate-200 bg-white px-6 py-6 sm:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>

              <p className="text-sm font-medium text-indigo-600">
                Asset inventory
              </p>

              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
                Business Assets
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Track systems, applications,
                data, and infrastructure that
                support business operations.
              </p>

            </div>


            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Add Asset
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

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <Boxes className="h-5 w-5 text-slate-700" />
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Total Assets
            </p>

            <p className="mt-1 text-2xl font-semibold text-slate-950">
              {assets.length}
            </p>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <Globe2 className="h-5 w-5 text-slate-700" />
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Internet-Facing
            </p>

            <p className="mt-1 text-2xl font-semibold text-slate-950">
              {
                assets.filter(
                  (asset) =>
                    asset.internet_facing
                ).length
              }
            </p>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <ShieldCheck className="h-5 w-5 text-slate-700" />
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Critical Assets
            </p>

            <p className="mt-1 text-2xl font-semibold text-slate-950">
              {
                assets.filter(
                  (asset) =>
                    asset.criticality ===
                    "Critical"
                ).length
              }
            </p>

          </div>

        </div>


        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-5">

            <h2 className="text-lg font-semibold text-slate-950">
              Asset Inventory
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Assets registered within your
              RiskLens workspace.
            </p>

          </div>


          {loading ? (

            <div className="px-6 py-14 text-center text-sm text-slate-500">
              Loading assets...
            </div>

          ) : assets.length === 0 ? (

            <div className="px-6 py-14 text-center">

              <Boxes className="mx-auto h-9 w-9 text-slate-300" />

              <p className="mt-3 text-sm font-medium text-slate-700">
                No assets yet
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Add your first business
                asset to begin assessing risk.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1000px]">

                <thead className="bg-slate-50">

                  <tr className="text-left text-xs font-medium uppercase tracking-wider text-slate-500">

                    <th className="px-6 py-3">
                      Asset
                    </th>

                    <th className="px-6 py-3">
                      Type
                    </th>

                    <th className="px-6 py-3">
                      Owner
                    </th>

                    <th className="px-6 py-3">
                      Criticality
                    </th>

                    <th className="px-6 py-3">
                      Sensitivity
                    </th>

                    <th className="px-6 py-3">
                      Exposure
                    </th>

                    <th className="px-6 py-3">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody className="divide-y divide-slate-100">

                  {assets.map((asset) => (

                    <tr
                      key={asset.id}
                      className="transition hover:bg-slate-50"
                    >

                      <td className="px-6 py-4">

                        <p className="text-sm font-medium text-slate-900">
                          {asset.name}
                        </p>

                        <p className="mt-1 max-w-xs truncate text-xs text-slate-400">
                          {asset.existing_controls ||
                            "No existing controls recorded"}
                        </p>

                      </td>


                      <td className="px-6 py-4 text-sm text-slate-600">
                        {asset.asset_type}
                      </td>


                      <td className="px-6 py-4 text-sm text-slate-600">
                        {asset.owner || "Unassigned"}
                      </td>


                      <td className="px-6 py-4">

                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getCriticalityStyle(
                            asset.criticality
                          )}`}
                        >
                          {asset.criticality}
                        </span>

                      </td>


                      <td className="px-6 py-4">

                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {asset.data_sensitivity}
                        </span>

                      </td>


                      <td className="px-6 py-4">

                        {asset.internet_facing ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600">
                            <Globe2 className="h-4 w-4" />
                            Internet-facing
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-slate-500">
                            Internal
                          </span>
                        )}

                      </td>


                      <td className="px-6 py-4">

                        <div className="flex items-center gap-2">

                          <button
                            onClick={() =>
                              openEditModal(
                                asset
                              )
                            }
                            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                            title="Edit asset"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>


                          <button
                            onClick={() =>
                              handleDelete(
                                asset
                              )
                            }
                            className="rounded-lg border border-red-100 p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700"
                            title="Delete asset"
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

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>

                <p className="text-sm font-medium text-indigo-600">
                  {editingAsset
                    ? "Update asset"
                    : "New asset"}
                </p>

                <h2 className="mt-1 text-xl font-semibold text-slate-950">
                  {editingAsset
                    ? "Edit Business Asset"
                    : "Add Business Asset"}
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

              <div className="grid gap-5 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Asset Name
                  </label>

                  <input
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Customer Database"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />

                </div>


                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Asset Type
                  </label>

                  <input
                    name="asset_type"
                    required
                    value={form.asset_type}
                    onChange={handleChange}
                    placeholder="Database"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />

                </div>

              </div>


              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Owner
                </label>

                <input
                  name="owner"
                  value={form.owner}
                  onChange={handleChange}
                  placeholder="IT Manager"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />

              </div>


              <div className="grid gap-5 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Criticality
                  </label>

                  <select
                    name="criticality"
                    value={form.criticality}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>

                </div>


                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Data Sensitivity
                  </label>

                  <select
                    name="data_sensitivity"
                    value={
                      form.data_sensitivity
                    }
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  >
                    <option>Public</option>
                    <option>Internal</option>
                    <option>Confidential</option>
                    <option>Restricted</option>
                  </select>

                </div>

              </div>


              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Existing Controls
                </label>

                <textarea
                  name="existing_controls"
                  rows="4"
                  value={
                    form.existing_controls
                  }
                  onChange={handleChange}
                  placeholder="MFA, daily backups, endpoint protection..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />

              </div>


              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">

                <input
                  name="internet_facing"
                  type="checkbox"
                  checked={
                    form.internet_facing
                  }
                  onChange={handleChange}
                  className="h-4 w-4"
                />

                <div>

                  <p className="text-sm font-medium text-slate-700">
                    Internet-facing asset
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    This system can be reached
                    directly from the internet.
                  </p>

                </div>

              </label>


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
                    : editingAsset
                      ? "Save Changes"
                      : "Add Asset"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </>
  );
}


export default Assets;