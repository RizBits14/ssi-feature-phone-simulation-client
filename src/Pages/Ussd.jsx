import React, { useEffect, useRef, useState } from "react";
import { usePhone } from "../Phone/PhoneContext";

export default function Ussd({ onSubmit, error }) {
    const { setHandlers, setSoftKeys } = usePhone();
    const [input, setInput] = useState("");
    const inputRef = useRef(input);
    const onSubmitRef = useRef(onSubmit);
    useEffect(() => {
        inputRef.current = input;
    }, [input]);

    useEffect(() => {
        onSubmitRef.current = onSubmit;
    }, [onSubmit]);
    useEffect(() => {
        setSoftKeys({ left: "Clear", center: "OK", right: "Back" });

        setHandlers({
            onDigit: (d) => setInput((s) => (s.length < 16 ? s + String(d) : s)),
            onStar: () => setInput((s) => (s.length < 16 ? s + "*" : s)),
            onHash: () => setInput((s) => (s.length < 16 ? s + "#" : s)),
            onBackspace: () => setInput((s) => s.slice(0, -1)),
            onOk: () => {
                const value = inputRef.current;
                onSubmitRef.current?.(value);
                setInput("");
            },
            onLeftSoft: () => setInput(""),
            onRightSoft: () => setInput((s) => s.slice(0, -1)),
        });

        return () => {
            setHandlers({});
            setSoftKeys({ left: "Menu", center: "OK", right: "Back" });
        };
    }, [setHandlers, setSoftKeys]);

    return (
        <div className="p-3 text-slate-100">
            <div className="text-[13px] font-semibold">USSD</div>
            <div className="text-[11px] opacity-75 mt-1">
                Use the phone keypad to type the USSD code.
            </div>

            <div className="mt-3 rounded-xl border border-slate-700 bg-slate-950/40 p-3">
                <div className="text-[10px] opacity-70">Dial</div>
                <div className="mt-1 text-[16px] font-mono tracking-widest break-all">
                    {input || "____"}
                </div>
            </div>

            <div className="mt-3 text-[11px] opacity-70">
                ⌫ deletes • OK submits • Clear wipes
            </div>

            {error ? <div className="mt-2 text-[11px] text-red-400">{error}</div> : null}
        </div>
    );
}
