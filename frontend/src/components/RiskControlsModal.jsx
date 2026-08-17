import { useEffect, useState } from "react";
import {
  Check,
  Link2,
  Loader2,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";

import api from "../services/api";


function RiskControlsModal({
  risk,
  onClose,
}) {
  const [controls, setControls] = useState([]);
  const [mappedControls, setMappedControls] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] =
    useState(null);

  const [error, setError] = useState("");


  useEffect(() => {
    loadControls();
  }, [risk.id]);


  async function loadControls() {
    try {
      setError("");

      const [
        controlsResponse,
        mappedResponse,
      ] = await Promise.all([
        api.get("/controls"),

        api.get(
          `/risks/${risk.id}/controls`
        ),
      ]);

      setControls(
        controlsResponse.data
      );

      setMappedControls(
        mappedResponse.data
      );

    } catch (err) {
      console.error(
        "Unable to load risk controls:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load control mappings."
      );

    } finally {
      setLoading(false);
    }
  }


  function isMapped(controlId) {
    return mappedControls.some(
      (control) =>
        control.id === controlId
    );
  }


  async function mapControl(
    controlId
  ) {
    try {
      setWorkingId(controlId);
      setError("");

      await api.post(
        `/risks/${risk.id}/controls`,
        {
          control_id: controlId,
        }
      );

      await loadControls();

    } catch (err) {
      console.error(
        "Control mapping failed:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to map control."
      );

    } finally {
      setWorkingId(null);
    }
  }


  async function removeControl(
    controlId
  ) {
    try {
      setWorkingId(controlId);
      setError("");

      await api.delete(
        `/risks/${risk.id}/controls/${controlId}`
      );

      await loadControls();

    } catch (err) {
      console.error(
        "Unable to remove control:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to remove control."
      );

    } finally {
      setWorkingId(null);
    }
  }


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">

      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">

          <div>

            <p className="text-sm font-medium text-indigo-600">
              Risk control mapping
            </p>

            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              {risk.title}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Map relevant security controls
              to this cybersecurity risk.
            </p>

          </div>


          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>

        </div>


        <div className="p-6">

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}


          <div className="mb-6 grid gap-4 sm:grid-cols-3">

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Severity
              </p>

              <p className="mt-2 font-semibold text-slate-900">
                {risk.severity}
              </p>

            </div>


            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Risk Score
              </p>

              <p className="mt-2 font-semibold text-slate-900">
                {risk.risk_score}
              </p>

            </div>


            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Controls Mapped
              </p>

              <p className="mt-2 font-semibold text-slate-900">
                {
                  mappedControls.length
                }
              </p>

            </div>

          </div>


          <div className="flex items-center gap-2">

            <ShieldCheck className="h-5 w-5 text-slate-600" />

            <h3 className="text-base font-semibold text-slate-950">
              Available Controls
            </h3>

          </div>


          {loading ? (

            <div className="flex items-center justify-center py-14">

              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />

            </div>

          ) : controls.length === 0 ? (

            <div className="mt-5 rounded-xl border border-dashed border-slate-300 px-6 py-10 text-center">

              <ShieldCheck className="mx-auto h-8 w-8 text-slate-300" />

              <p className="mt-3 text-sm font-medium text-slate-600">
                No controls available
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Create controls from the
                Controls page first.
              </p>

            </div>

          ) : (

            <div className="mt-5 space-y-3">

              {controls.map(
                (control) => {
                  const mapped =
                    isMapped(
                      control.id
                    );

                  return (
                    <div
                      key={control.id}
                      className={`rounded-xl border p-5 transition ${
                        mapped
                          ? "border-emerald-200 bg-emerald-50/40"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >

                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                        <div className="min-w-0">

                          <div className="flex items-center gap-2">

                            <p className="font-medium text-slate-900">
                              {
                                control.name
                              }
                            </p>

                            {mapped && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">

                                <Check className="h-3 w-3" />

                                Mapped

                              </span>
                            )}

                          </div>


                          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                            {
                              control.description
                            }
                          </p>


                          <div className="mt-3 flex flex-wrap gap-2">

                            {control.nist_csf && (
                              <span className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
                                NIST{" "}
                                {
                                  control.nist_csf
                                }
                              </span>
                            )}


                            {control.iso_27001 && (
                              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                                ISO{" "}
                                {
                                  control.iso_27001
                                }
                              </span>
                            )}


                            {control.cis_control && (
                              <span className="rounded-md bg-cyan-50 px-2 py-1 text-xs font-medium text-cyan-700">
                                CIS{" "}
                                {
                                  control.cis_control
                                }
                              </span>
                            )}

                          </div>

                        </div>


                        {mapped ? (

                          <button
                            onClick={() =>
                              removeControl(
                                control.id
                              )
                            }
                            disabled={
                              workingId ===
                              control.id
                            }
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >

                            <Trash2 className="h-4 w-4" />

                            Remove

                          </button>

                        ) : (

                          <button
                            onClick={() =>
                              mapControl(
                                control.id
                              )
                            }
                            disabled={
                              workingId ===
                              control.id
                            }
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                          >

                            <Link2 className="h-4 w-4" />

                            Map Control

                          </button>

                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}


export default RiskControlsModal;