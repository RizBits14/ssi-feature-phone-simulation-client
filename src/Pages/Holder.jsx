import React, { useEffect, useState } from "react";
import { usePhone } from "../Phone/PhoneContext";

const API = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export default function Holder() {
    const { setHandlers, setSoftKeys } = usePhone();
    const [inv, setInv] = useState("");
    const [msg, setMsg] = useState("");
    const [busy, setBusy] = useState(false);

    async function connect() {
        setBusy(true);
        setMsg("");
        try {
            const res = await fetch(`${API}/api/holder/receive-invitation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ invitationUrl: inv.trim() }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Failed");
            setMsg(`Connected ✓\nconnectionId: ${data.connectionId}`);
        } catch (e) {
            setMsg(`Error: ${e.message}`);
        } finally {
            setBusy(false);
        }
    }

    useEffect(() => {
        setSoftKeys({ left: "Paste", center: "OK", right: "Back" });
        setHandlers({
            onOk: connect,
        });
    }, [setHandlers, setSoftKeys, inv]);

    return (
        <div className="p-3 text-slate-100">
            <div className="text-[12px] opacity-80 mb-2">Paste invitation URL (sim)</div>

            <textarea
                value={inv}
                onChange={(e) => setInv(e.target.value)}
                placeholder="Paste invitationUrl here…"
                className="w-full h-28 text-[12px] p-2 rounded-xl bg-slate-900/60 border border-slate-700 outline-none"
            />

            <button
                disabled={busy || !inv.trim()}
                onClick={connect}
                className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-900/70 py-2 text-[13px] disabled:opacity-50"
            >
                {busy ? "Working…" : "OK (Connect)"}
            </button>

            {msg ? (
                <pre className="mt-3 text-[11px] whitespace-pre-wrap rounded-xl border border-slate-700 bg-slate-900/50 p-2">
                    {msg}
                </pre>
            ) : null}
        </div>
    );
}
