import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  FileText,
  ShieldCheck,
} from "lucide-react";

import { FileDown } from "lucide-react";
import api from "../services/api";


function Reports() {
  const [summary, setSummary] = useState(null);
  const [coverage, setCoverage] = useState(null);
  const [assets, setAssets] = useState([]);
  const [risks, setRisks] = useState([]);
  const [controls, setControls] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(""); 

  useEffect(() => {
    loadReportData();
  }, []);

  async function handleExportPDF() {
    try {
      setExporting(true);
      setExportError("");
  
      const response = await api.get(
        "/reports/risk-assessment",
        {
          responseType: "blob",
        }
      );
  
      const pdfBlob = new Blob(
        [response.data],
        {
          type: "application/pdf",
        }
      );
  
      const downloadUrl =
        window.URL.createObjectURL(pdfBlob);
  
      const link =
        document.createElement("a");
  
      link.href = downloadUrl;
      link.download =
        "risklens-cybersecurity-risk-assessment.pdf";
  
      document.body.appendChild(link);
  
      link.click();
  
      document.body.removeChild(link);
  
      window.URL.revokeObjectURL(
        downloadUrl
      );
    } catch (error) {
      console.error(
        "PDF export failed:",
        error
      );
  
      setExportError(
        "Unable to generate the PDF report."
      );
    } finally {
      setExporting(false);
    }
  }
  
  async function loadReportData() {
    try {
      setError("");

      const [
        summaryResponse,
        coverageResponse,
        assetsResponse,
        risksResponse,
        controlsResponse,
      ] = await Promise.all([
        api.get("/dashboard/summary"),
        api.get("/dashboard/control-coverage"),
        api.get("/assets"),
        api.get("/risks"),
        api.get("/controls"),
      ]);

      setSummary(summaryResponse.data);
      setCoverage(coverageResponse.data);
      setAssets(assetsResponse.data);
      setRisks(risksResponse.data);
      setControls(controlsResponse.data);

    } catch (err) {
      console.error(
        "Unable to load report data:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load report data."
      );

    } finally {
      setLoading(false);
    }
  }


  const priorityRisks = useMemo(() => {
    return [...risks]
      .sort(
        (a, b) =>
          b.risk_score - a.risk_score
      )
      .slice(0, 5);
  }, [risks]);


  const implementedControls =
    controls.filter(
      (control) =>
        control.implementation_status ===
        "Implemented"
    ).length;


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


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-500">
          Loading report data...
        </p>
      </div>
    );
  }


  return (
    <>
      <header className="border-b border-slate-200 bg-white px-6 py-6 sm:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>

              <p className="text-sm font-medium text-indigo-600">
                Reporting
              </p>

              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
                Cybersecurity Risk Report
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Review the current cybersecurity
                posture before generating a
                professional assessment report.
              </p>

            </div>


            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileDown className="h-4 w-4" />

              {exporting
                ? "Generating..."
                : "Export PDF"}
            </button>

            {exportError && (
              <p className="mt-2 text-sm text-red-600">
                {exportError}
              </p>
            )}

          </div>

        </div>

      </header>


      <div className="mx-auto max-w-7xl space-y-8 p-6 sm:p-8">

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}


        {/* REPORT SUMMARY */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="border-b border-slate-200 pb-5">

            <p className="text-sm font-medium text-indigo-600">
              RiskLens GRC
            </p>

            <h2 className="mt-1 text-2xl font-semibold text-slate-950">
              Cybersecurity Risk Assessment
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Executive overview of assets,
              identified cybersecurity risks,
              and security-control implementation.
            </p>

          </div>


          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <div className="rounded-xl bg-slate-50 p-5">

              <Boxes className="h-5 w-5 text-slate-600" />

              <p className="mt-4 text-sm text-slate-500">
                Assets Assessed
              </p>

              <p className="mt-1 text-2xl font-semibold text-slate-950">
                {summary?.total_assets ?? 0}
              </p>

            </div>


            <div className="rounded-xl bg-slate-50 p-5">

              <AlertTriangle className="h-5 w-5 text-slate-600" />

              <p className="mt-4 text-sm text-slate-500">
                Risks Identified
              </p>

              <p className="mt-1 text-2xl font-semibold text-slate-950">
                {summary?.total_risks ?? 0}
              </p>

            </div>


            <div className="rounded-xl bg-red-50 p-5">

              <AlertTriangle className="h-5 w-5 text-red-600" />

              <p className="mt-4 text-sm text-red-600">
                Critical Risks
              </p>

              <p className="mt-1 text-2xl font-semibold text-red-700">
                {summary?.critical_risks ?? 0}
              </p>

            </div>


            <div className="rounded-xl bg-indigo-50 p-5">

              <ShieldCheck className="h-5 w-5 text-indigo-600" />

              <p className="mt-4 text-sm text-indigo-600">
                Control Coverage
              </p>

              <p className="mt-1 text-2xl font-semibold text-indigo-700">
                {coverage?.coverage_percentage ?? 0}%
              </p>

            </div>

          </div>

        </section>


        {/* EXECUTIVE SUMMARY */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-semibold text-slate-950">
            Executive Summary
          </h2>

          <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600">

            The current RiskLens assessment includes{" "}
            <strong>
              {assets.length} business asset
              {assets.length === 1 ? "" : "s"}
            </strong>{" "}
            and{" "}
            <strong>
              {risks.length} identified cybersecurity risk
              {risks.length === 1 ? "" : "s"}
            </strong>
            . Of these risks,{" "}
            <strong>
              {summary?.critical_risks ?? 0}
            </strong>{" "}
            are currently rated Critical.

            Security-control implementation is currently{" "}
            <strong>
              {coverage?.coverage_percentage ?? 0}%
            </strong>
            , with{" "}
            <strong>
              {implementedControls}
            </strong>{" "}
            of{" "}
            <strong>
              {controls.length}
            </strong>{" "}
            controls marked as implemented.

          </p>

        </section>


        {/* PRIORITY RISKS */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-5">

            <h2 className="text-lg font-semibold text-slate-950">
              Top Priority Risks
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Highest-scoring risks in the
              current assessment.
            </p>

          </div>


          {priorityRisks.length === 0 ? (

            <div className="px-6 py-12 text-center text-sm text-slate-500">
              No risks available.
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead className="bg-slate-50">

                  <tr className="text-left text-xs font-medium uppercase tracking-wider text-slate-500">

                    <th className="px-6 py-3">
                      Risk
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

                  </tr>

                </thead>


                <tbody className="divide-y divide-slate-100">

                  {priorityRisks.map(
                    (risk) => (

                      <tr key={risk.id}>

                        <td className="px-6 py-4">

                          <p className="text-sm font-medium text-slate-900">
                            {risk.title}
                          </p>

                          <p className="mt-1 max-w-md text-xs text-slate-400">
                            {risk.mitigation_plan ||
                              "No mitigation plan recorded"}
                          </p>

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


                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                          {risk.risk_score}
                        </td>


                        <td className="px-6 py-4">

                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
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


        {/* CONTROL SUMMARY */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-lg font-semibold text-slate-950">
                Security Control Summary
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current implementation status
                across the control library.
              </p>

            </div>

            <ShieldCheck className="h-5 w-5 text-slate-400" />

          </div>


          <div className="mt-6 grid gap-4 sm:grid-cols-2">

            {controls.map(
              (control) => (

                <div
                  key={control.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-5"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <p className="font-medium text-slate-900">
                        {control.name}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {control.description}
                      </p>

                    </div>


                    <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                      {control.implementation_status}
                    </span>

                  </div>


                  <div className="mt-4 flex flex-wrap gap-2">

                    {control.nist_csf && (
                      <span className="rounded-md bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700">
                        NIST {control.nist_csf}
                      </span>
                    )}

                    {control.iso_27001 && (
                      <span className="rounded-md bg-slate-200 px-2 py-1 text-xs font-medium text-slate-600">
                        ISO {control.iso_27001}
                      </span>
                    )}

                    {control.cis_control && (
                      <span className="rounded-md bg-cyan-100 px-2 py-1 text-xs font-medium text-cyan-700">
                        CIS {control.cis_control}
                      </span>
                    )}

                  </div>

                </div>

              )
            )}

          </div>

        </section>


        {/* NEXT STEPS */}

        <section className="rounded-2xl bg-slate-950 p-6 text-white shadow-sm">

          <p className="text-sm font-medium text-indigo-300">
            Recommended next steps
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            Prioritize high-impact remediation.
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Review Critical and High risks first,
            implement mapped safeguards, monitor
            control coverage, and reassess risk
            scores after mitigation activities
            are completed.
          </p>

        </section>

      </div>
    </>
  );
}


export default Reports;