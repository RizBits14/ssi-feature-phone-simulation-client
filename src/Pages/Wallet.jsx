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

    function pickClaim(claims, key) {
        if (!claims) return "";
        const v = claims[key];
        return v === undefined || v === null ? "" : String(v);
    }

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
                    rows.map((c) => {
                        const credType = (c?.claims?.department || "Credential").toString();
                        const name = pickClaim(c.claims, "name");
                        const age = pickClaim(c.claims, "age");
                        const mobile = pickClaim(c.claims, "email");

                        return (
                            <div
                                key={c._id}
                                className="px-3 py-2 text-[12px] bg-slate-900/40 border-b border-slate-800 last:border-b-0"
                            >
                                <div className="font-semibold">{credType}</div>
                                <div className="opacity-80">status: {c.status}</div>

                                <div className="mt-2 space-y-1 text-[11px]">
                                    <div className="flex justify-between">
                                        <span className="opacity-75">Name</span>
                                        <span className="font-medium">{name || "-"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="opacity-75">Numerics</span>
                                        <span className="font-medium">{age || "-"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="opacity-75">Mobile</span>
                                        <span className="font-medium">{mobile || "-"}</span>
                                    </div>
                                </div>

                                <div className="mt-2 text-[11px] opacity-60">
                                    issued: {c.createdAt ? new Date(c.createdAt).toLocaleString() : "-"}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
