import React, { useEffect, useMemo, useState } from "react";
import { usePhone } from "../Phone/PhoneContext";

const API = import.meta.env.VITE_API_BASE || "http://localhost:3000";

function btn(cls = "") {
    return (
        "w-full rounded-xl border border-slate-600 bg-slate-900/70 py-2 text-[13px] active:bg-slate-800 disabled:opacity-50 " +
        cls
    );
}

export default function Holder() {
    const { setSoftKeys } = usePhone();

    const [inv, setInv] = useState("");
    const [msg, setMsg] = useState("");
    const [busy, setBusy] = useState(false);

    const [connectionId, setConnectionId] = useState("");

    const [creds, setCreds] = useState([]);
    const [proofReqs, setProofReqs] = useState([]);
    const [selectedCredId, setSelectedCredId] = useState("");

    useEffect(() => {
        setSoftKeys({ left: "Menu", center: "OK", right: "Back" });
    }, [setSoftKeys]);

    async function refreshInbox() {
        setBusy(true);
        setMsg("");
        try {
            const [cRes, prRes] = await Promise.all([fetch(`${API}/api/credentials`), fetch(`${API}/api/proof-requests`)]);
            const c = await cRes.json();
            const pr = await prRes.json();

            if (!cRes.ok) throw new Error(c?.error || "Credentials load failed");
            if (!prRes.ok) throw new Error(pr?.error || "Proof requests load failed");

            const items = c.items || [];
            setCreds(items);
            setProofReqs(pr.items || []);

            if (!selectedCredId) {
                const accepted = items.find((x) => x.status === "accepted");
                if (accepted?._id) setSelectedCredId(accepted._id);
            }
        } catch (e) {
            setMsg(`Error: ${e.message}`);
        } finally {
            setBusy(false);
        }
    }

    async function connect() {
        setBusy(true);
        setMsg("");
        try {
            const res = await fetch(`${API}/api/holder/receive-invitation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ inviteCode: inv.trim() }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Failed");
            setConnectionId(data.connectionId);
            setMsg(`Connected ✓\nconnectionId: ${data.connectionId}`);
            await refreshInbox();
        } catch (e) {
            setMsg(`Error: ${e.message}`);
        } finally {
            setBusy(false);
        }
    }


    async function acceptCredential(credentialId) {
        setBusy(true);
        setMsg("");
        try {
            const res = await fetch(`${API}/api/holder/accept-credential`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credentialId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Accept failed");
            setMsg("Credential accepted ✓");
            await refreshInbox();
        } catch (e) {
            setMsg(`Error: ${e.message}`);
        } finally {
            setBusy(false);
        }
    }

    async function presentProof(proofRequestId) {
        if (!selectedCredId) {
            setMsg("No accepted credential selected.");
            return;
        }

        setBusy(true);
        setMsg("");
        try {
            const res = await fetch(`${API}/api/holder/present-proof`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ proofRequestId, credentialId: selectedCredId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Present proof failed");
            setMsg(`Presented ✓\nverified: ${data.verified}`);
            await refreshInbox();
        } catch (e) {
            setMsg(`Error: ${e.message}`);
        } finally {
            setBusy(false);
        }
    }

    const offered = useMemo(() => creds.filter((c) => c.status === "offered"), [creds]);
    const accepted = useMemo(() => creds.filter((c) => c.status === "accepted"), [creds]);
    const requestedProofs = useMemo(() => proofReqs.filter((p) => p.status === "requested"), [proofReqs]);

    useEffect(() => {
        refreshInbox();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="p-3 text-slate-100">
            <div className="text-[13px] font-semibold">Holder</div>
            <div className="text-[11px] opacity-75 mt-1">Enter code from Issuer → Connect → Accept credential → Present proof.</div>

            <textarea
                value={inv}
                onChange={(e) => setInv(e.target.value)}
                placeholder="Enter invitation code (e.g. 48392)"
                className="mt-2 w-full h-24 text-[12px] p-2 rounded-xl bg-slate-900/60 border border-slate-700 outline-none"
            />

            <div className="mt-2 grid grid-cols-2 gap-2">
                <button disabled={busy || !inv.trim()} onClick={connect} className={btn()}>
                    {busy ? "Working…" : "OK (Connect)"}
                </button>
                <button disabled={busy} onClick={refreshInbox} className={btn()}>
                    Refresh
                </button>
            </div>

            {connectionId ? (
                <div className="mt-2 text-[11px] opacity-85">
                    connectionId: <span className="font-semibold">{connectionId.slice(0, 14)}…</span>
                </div>
            ) : null}

            <div className="mt-2 rounded-xl border border-slate-700 bg-slate-900/40 p-2">
                <div className="text-[12px] font-semibold">Offered Credentials</div>
                {offered.length === 0 ? (
                    <div className="text-[11px] opacity-70 mt-1">No offers yet.</div>
                ) : (
                    <div className="mt-2 space-y-2">
                        {offered.map((c) => (
                            <div key={c._id} className="rounded-lg border border-slate-700 bg-slate-950/40 p-2">
                                <div className="text-[12px] font-semibold">{c.type}</div>
                                <div className="text-[11px] opacity-80">status: {c.status}</div>
                                <button className={btn("mt-2")} disabled={busy} onClick={() => acceptCredential(c._id)}>
                                    Accept
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-2 rounded-xl border border-slate-700 bg-slate-900/40 p-2">
                <div className="text-[12px] font-semibold">Accepted Credential (for Proof)</div>
                {accepted.length === 0 ? (
                    <div className="text-[11px] opacity-70 mt-1">None accepted yet.</div>
                ) : (
                    <select
                        value={selectedCredId}
                        onChange={(e) => setSelectedCredId(e.target.value)}
                        className="mt-2 w-full text-[12px] p-2 rounded-lg bg-slate-950/50 border border-slate-700"
                    >
                        {accepted.map((c) => (
                            <option key={c._id} value={c._id}>
                                {c.type} ({String(c._id).slice(0, 6)}…)
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <div className="mt-2 rounded-xl border border-slate-700 bg-slate-900/40 p-2">
                <div className="text-[12px] font-semibold">Proof Requests</div>
                {requestedProofs.length === 0 ? (
                    <div className="text-[11px] opacity-70 mt-1">No proof requests yet.</div>
                ) : (
                    <div className="mt-2 space-y-2">
                        {requestedProofs.map((p) => (
                            <div key={p._id} className="rounded-lg border border-slate-700 bg-slate-950/40 p-2">
                                <div className="text-[11px] opacity-80">status: {p.status}</div>
                                <div className="text-[11px] opacity-70">id: {String(p._id).slice(0, 10)}…</div>
                                <button className={btn("mt-2")} disabled={busy || !selectedCredId} onClick={() => presentProof(p._id)}>
                                    Present Proof
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {msg ? (
                <pre className="mt-2 text-[11px] whitespace-pre-wrap rounded-xl border border-slate-700 bg-slate-900/50 p-2">
                    {msg}
                </pre>
            ) : null}
        </div>
    );
}
