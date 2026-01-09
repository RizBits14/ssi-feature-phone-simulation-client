import React, { useEffect, useState } from "react";
import { usePhone } from "../Phone/PhoneContext";

const API = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export default function Wallet() {
    const { setSoftKeys } = usePhone();
    const [rows, setRows] = useState([]);
    const [err, setErr] = useState("");

    useEffect(() => setSoftKeys({ left: "Refresh", center: "OK", right: "Back" }), [setSoftKeys]);

    async function load() {
        setErr("");
        try {
            const res = await fetch(`${API}/api/credentials`);
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Failed");
            setRows(data.items || []);
        } catch (e) {
            setErr(e.message);
        }
    }

    useEffect(() => {
        load();
    }, []);

    return (
        <div className="p-3 text-slate-100">
            <div className="flex items-center justify-between">
                <div className="text-[13px] font-semibold">Wallet</div>
                <button onClick={load} className="text-[11px] underline opacity-80">
                    Refresh
                </button>
            </div>

            {err ? <div className="mt-2 text-[12px] text-red-300">Error: {err}</div> : null}

            <div className="mt-2 rounded-xl border border-slate-700 overflow-hidden">
                {rows.length === 0 ? (
                    <div className="px-3 py-3 text-[12px] opacity-70">No credentials yet.</div>
                ) : (
                    rows.map((c) => (
                        <div key={c._id} className="px-3 py-2 text-[12px] bg-slate-900/40 border-b border-slate-800 last:border-b-0">
                            <div className="font-semibold">{c.type}</div>
                            <div className="opacity-80">status: {c.status}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
