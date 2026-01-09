import React, { useEffect } from "react";
import { usePhone } from "../Phone/PhoneContext";

function Key({ label, sub, onClick, className = "" }) {
    return (
        <button
            onClick={onClick}
            className={
                "select-none rounded-xl border border-slate-700 bg-slate-900/60 active:bg-slate-800 " +
                "h-14 flex flex-col items-center justify-center text-slate-100 " +
                className
            }
        >
            <div className="text-lg font-bold leading-none">{label}</div>
            {sub ? <div className="text-[10px] opacity-70 leading-none mt-1">{sub}</div> : null}
        </button>
    );
}

export default function Keypad() {
    const { fire } = usePhone();

    useEffect(() => {
        const onKeyDown = (e) => {
            const k = e.key;

            if (k === "ArrowUp") return fire("onUp");
            if (k === "ArrowDown") return fire("onDown");
            if (k === "ArrowLeft") return fire("onLeft");
            if (k === "ArrowRight") return fire("onRight");
            if (k === "Enter") return fire("onOk");
            if (k === "Backspace" || k === "Escape") return fire("onBack");

            if (/^[0-9]$/.test(k)) return fire("onDigit", k);
            if (k === "*") return fire("onDigit", "*");
            if (k === "#") return fire("onDigit", "#");
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [fire]);

    return (
        <div className="px-3 pb-3">
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
                <Key label="*" sub="" onClick={() => fire("onDigit", "*")} />
                <Key label="0" sub="+" onClick={() => fire("onDigit", "0")} />
                <Key label="#" sub="" onClick={() => fire("onDigit", "#")} />

                <Key
                    label="CALL"
                    sub=""
                    className="col-span-1 border-green-700 bg-green-900/30 active:bg-green-800/40"
                    onClick={() => fire("onCall")}
                />
                <Key
                    label="OK"
                    sub=""
                    className="col-span-1 border-slate-500 bg-slate-800/50 active:bg-slate-700"
                    onClick={() => fire("onOk")}
                />
                <Key
                    label="END"
                    sub=""
                    className="col-span-1 border-red-700 bg-red-900/30 active:bg-red-800/40"
                    onClick={() => fire("onEnd")}
                />
            </div>
        </div>
    );
}
