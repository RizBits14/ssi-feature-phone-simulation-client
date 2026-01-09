import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { usePhone } from "../Phone/PhoneContext";

const ITEMS = [
    { label: "1. Holder", path: "/holder" },
    { label: "2. Issuer", path: "/issuer" },
    { label: "3. Verifier", path: "/verifier" },
    { label: "4. Wallet", path: "/wallet" },
];

export default function HomeMenu() {
    const [idx, setIdx] = useState(0);
    const nav = useNavigate();
    const { setHandlers, setSoftKeys } = usePhone();

    useEffect(() => {
        setSoftKeys({ left: "Select", center: "OK", right: "Exit" });

        setHandlers({
            onUp: () => setIdx((v) => (v - 1 + ITEMS.length) % ITEMS.length),
            onDown: () => setIdx((v) => (v + 1) % ITEMS.length),
            onOk: () => nav(ITEMS[idx].path),
            onDigit: (d) => {
                const n = parseInt(d, 10);
                if (!Number.isNaN(n) && n >= 1 && n <= ITEMS.length) {
                    nav(ITEMS[n - 1].path);
                }
            },
        });
    }, [idx, nav, setHandlers, setSoftKeys]);

    return (
        <div className="p-3 text-slate-100">
            <div className="text-[12px] opacity-80 mb-2">Press 1–4</div>

            <div className="rounded-xl border border-slate-700 overflow-hidden">
                {ITEMS.map((it, i) => (
                    <div
                        key={it.label}
                        className={
                            "px-3 py-2 text-[13px] " +
                            (i === idx ? "bg-green-600/20 border-l-4 border-green-400" : "bg-slate-900/40")
                        }
                    >
                        {it.label}
                    </div>
                ))}
            </div>

            <div className="mt-3 text-[11px] opacity-70">
                Tip: Press END to come back Home anytime.
            </div>
        </div>
    );
}
