import React, { useEffect, useMemo, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import Navbar from "../Components/Navbar";
import SoftKeys from "../Components/Softkeys";
import Keypad from "../Components/Keypad";
import UssdGate from "../Components/UssdGate";
import { PhoneProvider, usePhone } from "../Phone/PhoneContext";

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
            type === "";
        return ok && !el.readOnly && !el.disabled;
    }
    return !!el.isContentEditable;
}

function focusNoScroll(el) {
    if (!el || typeof el.focus !== "function") return;
    try {
        el.focus({ preventScroll: true });
    } catch {
        el.focus();
    }
}

function Shell() {
    const location = useLocation();
    const navigate = useNavigate();
    const { setGlobalHandlers, setSoftKeys, fire } = usePhone();
    const scrollRef = useRef(null);
    const lastFieldRef = useRef(null);

    useEffect(() => {
        const onFocusIn = (e) => {
            const el = e.target;
            if (isEditable(el)) lastFieldRef.current = el;
        };
        window.addEventListener("focusin", onFocusIn, true);
        return () => window.removeEventListener("focusin", onFocusIn, true);
    }, []);

    const getTarget = useMemo(() => {
        return () => {
            const active = document.activeElement;
            if (isEditable(active)) return active;
            const last = lastFieldRef.current;
            if (last && last.isConnected && isEditable(last)) return last;
            return null;
        };
    }, []);

    const dispatchInput = useMemo(() => {
        return (el) => {
            try {
                el.dispatchEvent(new Event("input", { bubbles: true }));
            } catch {
                el.dispatchEvent(new Event("input"));
            }
        };
    }, []);

    const setValue = useMemo(() => {
        return (el, nextValue, caret) => {
            if (!el) return;
            el.value = nextValue;
            if (typeof el.setSelectionRange === "function" && typeof caret === "number") {
                el.setSelectionRange(caret, caret);
            }
            dispatchInput(el);
            focusNoScroll(el);
        };
    }, [dispatchInput]);

    const insertText = useMemo(() => {
        return (text) => {
            const el = getTarget();
            if (!el || typeof el.value !== "string") return;

            const v = el.value;
            const start = typeof el.selectionStart === "number" ? el.selectionStart : v.length;
            const end = typeof el.selectionEnd === "number" ? el.selectionEnd : start;

            const t = String(text ?? "");
            if (!t) return;

            const next = v.slice(0, start) + t + v.slice(end);
            const caret = start + t.length;
            setValue(el, next, caret);
        };
    }, [getTarget, setValue]);

    const backspace = useMemo(() => {
        return () => {
            const el = getTarget();
            if (!el || typeof el.value !== "string") return;

            const v = el.value;
            const start = typeof el.selectionStart === "number" ? el.selectionStart : v.length;
            const end = typeof el.selectionEnd === "number" ? el.selectionEnd : start;

            if (start !== end) {
                const next = v.slice(0, start) + v.slice(end);
                setValue(el, next, start);
                return;
            }

            if (start <= 0) return;

            const next = v.slice(0, start - 1) + v.slice(start);
            setValue(el, next, start - 1);
        };
    }, [getTarget, setValue]);

    const clearAll = useMemo(() => {
        return () => {
            const el = getTarget();
            if (!el || typeof el.value !== "string") return;
            setValue(el, "", 0);
        };
    }, [getTarget, setValue]);

    useEffect(() => {
        setGlobalHandlers({
            onEnd: () => navigate("/"),
            onBack: () => navigate(-1),
            onCall: () => fire("onOk"),
            onUp: () => {
                if (scrollRef.current) scrollRef.current.scrollBy({ top: -40, behavior: "smooth" });
            },
            onDown: () => {
                if (scrollRef.current) scrollRef.current.scrollBy({ top: 40, behavior: "smooth" });
            },
            onLeft: () => { },
            onRight: () => { },
            onBackspace: () => backspace(),
            onClear: () => clearAll(),
            onDigit: (d) => insertText(String(d ?? "")),
            onStar: () => insertText("*"),
            onHash: () => insertText("#"),
        });

        setSoftKeys({ left: "Menu", center: "OK", right: "Back" });
    }, [navigate, setGlobalHandlers, setSoftKeys, fire, backspace, clearAll, insertText]);

    const title =
        location.pathname === "/"
            ? "Main Menu"
            : location.pathname.startsWith("/holder")
                ? "Holder"
                : location.pathname.startsWith("/issuer")
                    ? "Issuer"
                    : location.pathname.startsWith("/verifier")
                        ? "Verifier"
                        : "SSI SIM";

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4">
            <div className="w-90 max-w-[92vw] rounded-4xl border border-slate-700 bg-slate-950 shadow-2xl overflow-hidden">
                <div className="h-6 flex items-center justify-center">
                    <div className="h-2 w-20 rounded-full bg-slate-800" />
                </div>
                <Navbar title={title} />
                <div className="px-3 mt-2">
                    <div className="rounded-2xl border border-slate-700 bg-linear-to-b from-slate-900 to-slate-950 h-80 overflow-hidden">
                        <div className="h-full flex flex-col">
                            <div ref={scrollRef} className="flex-1 overflow-auto">
                                <UssdGate>
                                    <Outlet />
                                </UssdGate>
                            </div>
                            <div className="pb-2">
                                <SoftKeys />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-3">
                    <Keypad />
                </div>
            </div>
        </div>
    );
}

export default function RootLayouts() {
    return (
        <PhoneProvider>
            <Shell />
        </PhoneProvider>
    );
}
