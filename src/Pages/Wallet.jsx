import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePhone } from "../Phone/PhoneContext";

const API = import.meta.env.VITE_API_BASE || "http://localhost:3000";

function CardRow({ active, title, subtitle, lines = [], innerRef }) {
    return (
        <div
            ref={innerRef}
            className="px-3 py-2 border-b last:border-b-0"
            style={{
                borderColor: "var(--line)",
                background: active
                    ? "linear-gradient(90deg, var(--accent-weak), rgba(14,165,233,0.0))"
                    : "transparent",
                borderLeft: active
                    ? "4px solid rgba(14,165,233,0.65)"
                    : "4px solid transparent",
            }}
        >
            <div className="text-[12px] font-semibold" style={{ color: "var(--text)" }}>
                {title}
            </div>

            <div className="text-[11px]" style={{ color: "var(--muted)" }}>
                {subtitle}
            </div>

            {lines.length > 0 && (
                <div className="mt-2 space-y-1 text-[11px]" style={{ color: "var(--text)" }}>
                    {lines.map((x, i) => (
                        <div key={i} className="flex justify-between gap-3">
                            <span style={{ color: "var(--muted)" }}>{x.k}</span>
                            <span className="font-medium truncate">{x.v}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Wallet() {
    const { setSoftKeys, setHandlers } = usePhone();

    const [rows, setRows] = useState([]);
    const [err, setErr] = useState("");
    const [idx, setIdx] = useState(0);

    const itemRefs = useRef([]);

    async function load() {
        setErr("");
        try {
            const res = await fetch(`${API}/api/credentials`);
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Failed");

            const items = data.items || [];
            setRows(items);

            setIdx((v) => Math.min(v, Math.max(0, items.length - 1)));
        } catch (e) {
            setErr(e.message);
        }
    }

    useEffect(() => {
        load();
    }, []);

    useEffect(() => {
        setSoftKeys({ left: "Refresh", center: "OK", right: "Back" });

        setHandlers({
            onUp: () =>
                setIdx((v) =>
                    rows.length ? (v - 1 + rows.length) % rows.length : 0
                ),

            onDown: () =>
                setIdx((v) =>
                    rows.length ? (v + 1) % rows.length : 0
                ),

            onDigit: (d) => {
                const n = parseInt(d, 10);
                if (!Number.isNaN(n) && n >= 1 && n <= rows.length) {
                    setIdx(n - 1);
                }
            },

            onLeftSoft: () => load(),
        });
    }, [rows.length, setHandlers, setSoftKeys]);

    useEffect(() => {
        const el = itemRefs.current[idx];
        if (el) {
            el.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        }
    }, [idx]);

    const view = useMemo(() => rows, [rows]);

    function pickClaim(claims, key) {
        if (!claims) return "";
        const v = claims[key];
        return v === undefined || v === null ? "" : String(v);
    }

    return (
        <div className="p-3">
            <div
                className="text-[13px] font-semibold"
                style={{ color: "var(--text)" }}
            >
                Wallet
            </div>

            <div
                className="text-[11px] mt-1"
                style={{ color: "var(--muted)" }}
            >
                ▲▼ browse • 1–9 jump
            </div>

            {err && (
                <div
                    className="mt-3 rounded-2xl border px-3 py-2 text-[12px]"
                    style={{
                        borderColor: "rgba(251,113,133,0.45)",
                        background: "var(--bad-weak)",
                        color: "var(--text)",
                    }}
                >
                    Error: {err}
                </div>
            )}

            <div
                className="mt-3 rounded-2xl border overflow-y-auto max-h-60"
                style={{ borderColor: "var(--line)" }}
            >
                {view.length === 0 ? (
                    <div
                        className="px-3 py-3 text-[12px]"
                        style={{ color: "var(--muted)" }}
                    >
                        No credentials yet.
                    </div>
                ) : (
                    view.map((c, i) => {
                        const credType = (c?.claims?.department || "Credential").toString();
                        const isRejected = c.status === "rejected";
                        const numeric =
                            pickClaim(c.claims, "numeric") ||
                            pickClaim(c.claims, "age");
                        const mobile =
                            pickClaim(c.claims, "phone") ||
                            pickClaim(c.claims, "email");

                        return (
                            <CardRow
                                key={c._id}
                                active={i === idx}
                                innerRef={(el) => (itemRefs.current[i] = el)}
                                title={`${i + 1}. ${credType}`}
                                subtitle={`status: ${c.status}`}
                                lines={
                                    isRejected
                                        ? [{ k: "Status", v: "Rejected" }]
                                        : [
                                            { k: "Name", v: name || "-" },
                                            { k: "Numerics", v: numeric || "-" },
                                            { k: "Mobile", v: mobile || "-" },
                                        ]
                                }
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
}
