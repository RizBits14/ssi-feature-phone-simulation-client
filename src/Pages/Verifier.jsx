import React, { useEffect, useMemo, useState } from "react";
import { usePhone } from "../Phone/PhoneContext";

const API = import.meta.env.VITE_API_BASE || "http://localhost:3000";

function btn(cls = "") {
    return (
        "w-full rounded-xl border border-slate-600 bg-slate-900/70 py-2 text-[13px] active:bg-slate-800 " + cls
    );
}

export default function Verifier() {
    const { setSoftKeys } = usePhone();

    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState("");

    const [connections, setConnections] = useState([]);
    const [selectedConnId, setSelectedConnId] = useState("");

    const [proofReqs, setProofReqs] = useState([]);
    const [presentations, setPresentations] = useState([]);

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

            setConnections(c.items || []);
            setProofReqs(pr.items || []);
            setPresentations(p.items || []);

            if (!selectedConnId) {
                const connected = (c.items || []).find((x) => x.status === "connected" && x.connectionId);
                if (connected?.connectionId) setSelectedConnId(connected.connectionId);
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
                        ask: ["name", "department", "email"],
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

    const connectedOnly = useMemo(
        () => connections.filter((c) => c.status === "connected" && c.connectionId),
        [connections]
    );

    useEffect(() => {
        refreshAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="p-3 text-slate-100">
            <div className="text-[13px] font-semibold">Verifier</div>
            <div className="text-[11px] opacity-75 mt-1">
                Step: Select connection → Send Proof Request → Holder presents → you verify by checking logs here.
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
                <div className="text-[12px] font-semibold">Proof Requests</div>
                <div className="mt-1 space-y-1">
                    {proofReqs.slice(0, 5).map((r) => (
                        <div key={r._id} className="text-[11px] rounded-lg border border-slate-700 bg-slate-950/40 p-2">
                            <div className="font-semibold">status: {r.status}</div>
                            <div className="opacity-80">conn: {String(r.connectionId).slice(0, 10)}…</div>
                        </div>
                    ))}
                    {proofReqs.length === 0 ? <div className="text-[11px] opacity-70">No proof requests yet.</div> : null}
                </div>
            </div>

            <div className="mt-2 rounded-xl border border-slate-700 bg-slate-900/40 p-2">
                <div className="text-[12px] font-semibold">Presentations</div>
                <div className="mt-1 space-y-1">
                    {presentations.slice(0, 5).map((p) => (
                        <div key={p._id} className="text-[11px] rounded-lg border border-slate-700 bg-slate-950/40 p-2">
                            <div className="font-semibold">status: {p.status}</div>
                            <div className="opacity-80">proofReq: {String(p.proofRequestId).slice(0, 10)}…</div>
                        </div>
                    ))}
                    {presentations.length === 0 ? <div className="text-[11px] opacity-70">No presentations yet.</div> : null}
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
