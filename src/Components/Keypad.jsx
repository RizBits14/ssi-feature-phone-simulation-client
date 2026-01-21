// Keypad.jsx
import React, { useEffect } from "react";
import { usePhone } from "../Phone/PhoneContext";

function isEditable(el) {
    if (!el || typeof el !== "object") return false;
    const tag = el.tagName;
    if (tag === "TEXTAREA") return !el.readOnly && !el.disabled;
    if (tag === "INPUT") {
        const type = String(el.getAttribute?.("type") || "text").toLowerCase();
        const ok =
            type === "text" ||
            type === "tel" ||
            type === "search" ||
            type === "password" ||
            type === "email" ||
            type === "url" ||
            type === "number" ||
            type === "" ||
            type == null;
        return ok && !el.readOnly && !el.disabled;
    }
    return !!el.isContentEditable;
}

function Key({ label, sub, onClick, className = "" }) {
    const prevent = (e) => e.preventDefault();
    return (
        <button
            type="button"
            onPointerDown={prevent}
            onMouseDown={prevent}
            onClick={onClick}
            className={
                "select-none rounded-xl border border-slate-700 bg-slate-900/60 active:bg-slate-800 " +
                "h-12 flex flex-col items-center justify-center text-slate-100 " +
                "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] " +
                className
            }
        >
            <div className="text-[17px] font-bold leading-none">{label}</div>
            {sub ? <div className="text-[10px] opacity-70 leading-none mt-1">{sub}</div> : null}
        </button>
    );
}

function MiniKey({ label, onClick, className = "" }) {
    const prevent = (e) => e.preventDefault();
    return (
        <button
            type="button"
            onPointerDown={prevent}
            onMouseDown={prevent}
            onClick={onClick}
            className={
                "select-none rounded-xl border border-slate-700 bg-slate-900/50 active:bg-slate-800 " +
                "h-9 flex items-center justify-center text-slate-100 " +
                "text-[12px] font-semibold tracking-wide " +
                "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] " +
                className
            }
        >
            {label}
        </button>
    );
}

function NavKey({ label, onClick, className = "" }) {
    const prevent = (e) => e.preventDefault();
    return (
        <button
            type="button"
            onPointerDown={prevent}
            onMouseDown={prevent}
            onClick={onClick}
            className={
                "select-none rounded-lg border border-slate-600 bg-slate-900/40 active:bg-slate-800/60 " +
                "h-7 w-10 flex items-center justify-center text-slate-100 " +
                "text-[11px] font-bold leading-none " +
                "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] " +
                className
            }
            aria-label={label}
            title={label}
        >
            {label}
        </button>
    );
}

export default function Keypad() {
    const { fire } = usePhone();

    useEffect(() => {
        const onKeyDown = (e) => {
            const k = e.key;
            const editing = isEditable(document.activeElement);

            if (k === "ArrowUp") {
                e.preventDefault();
                return fire("onUp");
            }
            if (k === "ArrowDown") {
                e.preventDefault();
                return fire("onDown");
            }
            if (k === "ArrowLeft") {
                e.preventDefault();
                return fire("onLeft");
            }
            if (k === "ArrowRight") {
                e.preventDefault();
                return fire("onRight");
            }

            if (k === "Enter") {
                e.preventDefault();
                return fire("onOk");
            }

            if (k === "Backspace") {
                e.preventDefault();
                return fire("onBackspace");
            }

            if (k === "Delete") {
                e.preventDefault();
                return fire("onBackspace");
            }

            if (k === "Escape") {
                e.preventDefault();
                return fire("onBack");
            }

            if (!editing) {
                if (/^[0-9]$/.test(k)) return fire("onDigit", k);
                if (k === "*") return fire("onStar");
                if (k === "#") return fire("onHash");
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [fire]);

    return (
        <div className="px-3 pb-3">
            <div className="mb-2 grid grid-cols-3 gap-2">
                <MiniKey label="⌫ DEL" onClick={() => fire("onBackspace")} />
                <MiniKey
                    label="CLR"
                    className="border-amber-700 bg-amber-900/20 active:bg-amber-800/30"
                    onClick={() => fire("onClear")}
                />

                <div className="flex items-center justify-end">
                    <div className="grid grid-cols-3 grid-rows-3 gap-1">
                        <div />
                        <NavKey label="▲" onClick={() => fire("onUp")} />
                        <div />
                        <NavKey label="◀" onClick={() => fire("onLeft")} />
                        <NavKey label="OK" onClick={() => fire("onOk")} className="border-slate-500 bg-slate-800/60" />
                        <NavKey label="▶" onClick={() => fire("onRight")} />
                        <div />
                        <NavKey label="▼" onClick={() => fire("onDown")} />
                        <div />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
                <Key label="1" sub="" onClick={() => fire("onDigit", "1")} />
                <Key label="2" sub="ABC" onClick={() => fire("onDigit", "2")} />
                <Key label="3" sub="DEF" onClick={() => fire("onDigit", "3")} />
                <Key label="4" sub="GHI" onClick={() => fire("onDigit", "4")} />
                <Key label="5" sub="JKL" onClick={() => fire("onDigit", "5")} />
                <Key label="6" sub="MNO" onClick={() => fire("onDigit", "6")} />
                <Key label="7" sub="PQRS" onClick={() => fire("onDigit", "7")} />
                <Key label="8" sub="TUV" onClick={() => fire("onDigit", "8")} />
                <Key label="9" sub="WXYZ" onClick={() => fire("onDigit", "9")} />
                <Key label="*" sub="" onClick={() => fire("onStar")} />
                <Key label="0" sub="+" onClick={() => fire("onDigit", "0")} />
                <Key label="#" sub="" onClick={() => fire("onHash")} />

                <Key
                    label="CALL"
                    className="col-span-1 border-green-700 bg-green-900/30 active:bg-green-800/40"
                    onClick={() => fire("onCall")}
                />
                <Key
                    label="BACK"
                    className="col-span-1 border-slate-600 bg-slate-900/40 active:bg-slate-800/50"
                    onClick={() => fire("onBack")}
                />
                <Key
                    label="END"
                    className="col-span-1 border-red-700 bg-red-900/30 active:bg-red-800/40"
                    onClick={() => fire("onEnd")}
                />
            </div>
        </div>
    );
}
