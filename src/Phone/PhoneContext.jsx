/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useRef, useState, useCallback, useMemo } from "react";

const PhoneContext = createContext(null);

const EMPTY = {
    onUp: null,
    onDown: null,
    onLeft: null,
    onRight: null,
    onOk: null,
    onBack: null,
    onCall: null,
    onEnd: null,
    onDigit: null,
    onStar: null,
    onHash: null,
    onBackspace: null,
    onClear: null,
    onLeftSoft: null,
    onRightSoft: null,
};

export function PhoneProvider({ children }) {
    const globalHandlersRef = useRef({ ...EMPTY });
    const screenHandlersRef = useRef({ ...EMPTY });

    const [softKeys, setSoftKeys] = useState({
        left: "Menu",
        center: "OK",
        right: "Back",
    });

    const setGlobalHandlers = useCallback((next) => {
        globalHandlersRef.current = { ...globalHandlersRef.current, ...(next || {}) };
    }, []);

    const setHandlers = useCallback((next) => {
        screenHandlersRef.current = { ...EMPTY, ...(next || {}) };
    }, []);

    const fire = useCallback((name, payload) => {
        const screenFn = screenHandlersRef.current[name];
        const globalFn = globalHandlersRef.current[name];

        if (name === "onUp" || name === "onDown") {
            if (typeof globalFn === "function") globalFn(payload);
            if (typeof screenFn === "function") screenFn(payload);
            return;
        }

        if (typeof screenFn === "function") return screenFn(payload);
        if (typeof globalFn === "function") return globalFn(payload);
    }, []);

    const api = useMemo(
        () => ({
            setHandlers,
            setGlobalHandlers,
            fire,
            softKeys,
            setSoftKeys,
        }),
        [setHandlers, setGlobalHandlers, fire, softKeys]
    );

    return <PhoneContext.Provider value={api}>{children}</PhoneContext.Provider>;
}

export function usePhone() {
    const ctx = useContext(PhoneContext);
    if (!ctx) throw new Error("usePhone must be used inside PhoneProvider");
    return ctx;
}
