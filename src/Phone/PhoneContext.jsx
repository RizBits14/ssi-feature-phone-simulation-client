/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useRef, useState, useCallback, useMemo } from "react";

const PhoneContext = createContext(null);

export function PhoneProvider({ children }) {
    const handlersRef = useRef({
        onUp: null,
        onDown: null,
        onLeft: null,
        onRight: null,
        onOk: null,
        onBack: null,
        onCall: null,
        onEnd: null,
        onDigit: null,
    });

    const [softKeys, setSoftKeys] = useState({
        left: "Menu",
        center: "OK",
        right: "Back",
    });

    const setHandlers = useCallback((next) => {
        handlersRef.current = { ...handlersRef.current, ...next };
    }, []);

    const fire = useCallback((name, payload) => {
        const fn = handlersRef.current[name];
        if (typeof fn === "function") fn(payload);
    }, []);

    const api = useMemo(
        () => ({
            setHandlers,
            fire,
            softKeys,
            setSoftKeys,
        }),
        [setHandlers, fire, softKeys]
    );

    return <PhoneContext.Provider value={api}>{children}</PhoneContext.Provider>;
}

export function usePhone() {
    const ctx = useContext(PhoneContext);
    if (!ctx) throw new Error("usePhone must be used inside PhoneProvider");
    return ctx;
}
