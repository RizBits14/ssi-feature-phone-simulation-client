import React, { useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import Navbar from "../Components/Navbar";
import SoftKeys from "../Components/Softkeys";
import Keypad from "../Components/Keypad";
import UssdGate from "../Components/UssdGate";
import { PhoneProvider, usePhone } from "../Phone/PhoneContext";

function Shell() {
    const location = useLocation();
    const navigate = useNavigate();
    const { setHandlers, setSoftKeys, fire } = usePhone();
    const scrollRef = useRef(null);

    useEffect(() => {
        setHandlers({
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
        });
        setSoftKeys({ left: "Menu", center: "OK", right: "Back" });
    }, [navigate, setHandlers, setSoftKeys, fire]);

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
