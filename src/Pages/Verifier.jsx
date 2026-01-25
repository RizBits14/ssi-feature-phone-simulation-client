/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from "react";
import { usePhone } from "../Phone/PhoneContext";

const API = import.meta.env.VITE_API_BASE || "http://localhost:3000";

function btn(cls = "") {
    return (
        "w-full rounded-xl border border-slate-600 bg-slate-900/70 py-2 text-[13px] active:bg-slate-800 " +
        cls
    );
}

function safeJson(value) {
    try {
        if (value == null) return null;
        if (typeof value === "object") return value;
        return JSON.parse(String(value));
    } catch {
        return null;
    }
}

function pickFirst(...vals) {
    for (const v of vals) {
        if (v !== undefined && v !== null && String(v).trim() !== "") return v;
    }
    return "";
}

function extractNameAge(p) {
    const sources = [
        p?.revealed,
        p?.revealedAttributes,
        p?.presentation,
        p?.presentationData,
        p?.proof,
        p?.proofData,
        p?.result,
        p?.data,
        p?.payload,
        p?.attributes,
    ];

    for (const s of sources) {
        const obj = safeJson(s);
        if (!obj) continue;

        const name = pickFirst(
            obj?.name,
            obj?.attributes?.name,
            obj?.claims?.name,
            obj?.credentialSubject?.name,
            obj?.requested_proof?.revealed_attrs?.name?.raw,
            obj?.requested_proof?.revealed_attrs?.name,
            obj?.requested_proof?.revealed_attr_groups?.name?.values?.name?.raw
        );

        const age = pickFirst(
            obj?.age,
            obj?.attributes?.age,
            obj?.claims?.age,
            obj?.credentialSubject?.age,
            obj?.requested_proof?.revealed_attrs?.age?.raw,
            obj?.requested_proof?.revealed_attrs?.age,
            obj?.requested_proof?.revealed_attr_groups?.age?.values?.age?.raw
        );

        if (name || age) return { name: String(name || ""), age: String(age || "") };
    }

    return { name: "", age: "" };
}

export default function Verifier() {
    const { setSoftKeys } = usePhone();

    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState("");

    const [connections, setConnections] = useState([]);
    const [selectedConnId, setSelectedConnId] = useState("");

    const [proofReqs, setProofReqs] = useState([]);
    const [presentations, setPresentations] = useState([]);

    const [selectedPresId, setSelectedPresId] = useState("");
    const [view, setView] = useState({ name: "", age: "" });

    useEffect(() => {
        setSoftKeys({ left: "Menu", center: "OK", right: "Back" });
    }, [setSoftKeys]);

    async function refreshAll() {
        setBusy(true);
        setMsg("");
        try {
            const [cRes, prRes, pRes] = await Promise.all([
                fetch(`${API}/api/connections`),
                fetch(`${API}/api/proof-requests`),
                fetch(`${API}/api/presentations`),
            ]);

            const c = await cRes.json();
            const pr = await prRes.json();
            const p = await pRes.json();

            if (!cRes.ok) throw new Error(c?.error || "Connections load failed");
            if (!prRes.ok) throw new Error(pr?.error || "Proof requests load failed");
            if (!pRes.ok) throw new Error(p?.error || "Presentations load failed");

            const connItems = c.items || [];
            const prItems = pr.items || [];
            const presItems = p.items || [];

            setConnections(connItems);
            setProofReqs(prItems);
            setPresentations(presItems);

            if (!selectedConnId) {
                const connected = connItems.find((x) => x.status === "connected" && x.connectionId);
                if (connected?.connectionId) setSelectedConnId(connected.connectionId);
            }

            const preferred =
                presItems.find((x) => x.status === "verified" || x.status === "done") || presItems[0];

            if (preferred?._id) {
                if (!selectedPresId) setSelectedPresId(preferred._id);
                setView(extractNameAge(preferred));
            } else {
                setSelectedPresId("");
                setView({ name: "", age: "" });
            }
        } catch (e) {
            setMsg(`Error: ${e.message}`);
        } finally {
            setBusy(false);
        }
    }

    async function sendProofRequest() {
        if (!selectedConnId) {
            setMsg("Select a connected connection first.");
            return;
        }

        setBusy(true);
        setMsg("");
        try {
            const res = await fetch(`${API}/api/verifier/send-proof-request`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    connectionId: selectedConnId,
                    request: {
                        ask: ["name"],
                        predicates: [{ field: "age", op: ">=", value: 20 }],
                    },
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Send proof request failed");

            setMsg(`Proof request sent ✓\nproofRequestId: ${data.proofRequestId}`);
            await refreshAll();
        } catch (e) {
            setMsg(`Error: ${e.message}`);
        } finally {
            setBusy(false);
        }
    }

    function selectPresentation(p) {
        setSelectedPresId(p._id);
        setView(extractNameAge(p));
    }

    const connectedOnly = useMemo(
        () => connections.filter((c) => c.status === "connected" && c.connectionId),
        [connections]
    );

    const latestProofReq = useMemo(() => {
        if (!proofReqs?.length) return null;
        return proofReqs[0];
    }, [proofReqs]);

    const selectedPresentation = useMemo(() => {
        if (!selectedPresId) return null;
        return presentations.find((x) => x._id === selectedPresId) || null;
    }, [presentations, selectedPresId]);

    useEffect(() => {
        refreshAll();
    }, []);

    useEffect(() => {
        if (selectedPresentation) setView(extractNameAge(selectedPresentation));
    }, [selectedPresentation]);

    return (
        <div className="p-3 text-slate-100">
            <div className="text-[13px] font-semibold">Verifier</div>
            <div className="text-[11px] opacity-75 mt-1">
                Verifier view is limited to <span className="font-semibold">Name</span> and{" "}
                <span className="font-semibold">Age</span> only.
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
                <button className={btn()} disabled={busy} onClick={refreshAll}>
                    Refresh
                </button>
                <button className={btn()} disabled={busy || !selectedConnId} onClick={sendProofRequest}>
                    Send Proof
                </button>
            </div>

            <div className="mt-2 rounded-xl border border-slate-700 bg-slate-900/40 p-2">
                <div className="text-[12px] font-semibold">Connected Connection</div>
                {connectedOnly.length === 0 ? (
                    <div className="text-[11px] opacity-70 mt-1">No connected yet.</div>
                ) : (
                    <select
                        value={selectedConnId}
                        onChange={(e) => setSelectedConnId(e.target.value)}
                        className="mt-2 w-full text-[12px] p-2 rounded-lg bg-slate-950/50 border border-slate-700"
                    >
                        {connectedOnly.map((c) => (
                            <option key={c.connectionId} value={c.connectionId}>
                                {c.connectionId.slice(0, 10)}… (connected)
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <div className="mt-2 rounded-xl border border-slate-700 bg-slate-900/40 p-2">
                <div className="text-[12px] font-semibold">Latest Proof Request</div>
                {latestProofReq ? (
                    <div className="mt-2 text-[11px] rounded-lg border border-slate-700 bg-slate-950/40 p-2">
                        <div className="font-semibold">status: {latestProofReq.status}</div>
                        <div className="opacity-80">conn: {String(latestProofReq.connectionId).slice(0, 10)}…</div>
                    </div>
                ) : (
                    <div className="text-[11px] opacity-70 mt-1">No proof requests yet.</div>
                )}
            </div>

            <div className="mt-2 rounded-xl border border-slate-700 bg-slate-900/40 p-2">
                <div className="text-[12px] font-semibold">Presentations</div>
                {presentations.length === 0 ? (
                    <div className="text-[11px] opacity-70 mt-1">No presentations yet.</div>
                ) : (
                    <div className="mt-2 space-y-1">
                        {presentations.slice(0, 6).map((p) => (
                            <button
                                key={p._id}
                                onClick={() => selectPresentation(p)}
                                className={
                                    "w-full text-left text-[11px] rounded-lg border p-2 " +
                                    (p._id === selectedPresId
                                        ? "border-slate-400 bg-slate-950/70"
                                        : "border-slate-700 bg-slate-950/40 active:bg-slate-900/50")
                                }
                            >
                                <div className="font-semibold">status: {p.status}</div>
                                <div className="opacity-80">
                                    proofReq: {String(p.proofRequestId || p.proofRequest || p._id).slice(0, 10)}…
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-2 rounded-xl border border-slate-700 bg-slate-900/40 p-2">
                <div className="text-[12px] font-semibold">Verified View (Limited)</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-slate-700 bg-slate-950/40 p-2">
                        <div className="text-[10px] opacity-70">Name</div>
                        <div className="text-[12px] font-semibold wrap-break-word">{view.name || "—"}</div>
                    </div>
                    <div className="rounded-lg border border-slate-700 bg-slate-950/40 p-2">
                        <div className="text-[10px] opacity-70">Numerics</div>
                        <div className="text-[12px] font-semibold">{view.age || "—"}</div>
                    </div>
                </div>
            </div>

            {msg ? (
                <pre className="mt-2 text-[11px] whitespace-pre-wrap rounded-xl border border-slate-700 bg-slate-900/50 p-2">
                    {msg}
                </pre>
            ) : null}
        </div>
    );
}
