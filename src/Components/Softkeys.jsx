import React from "react";
import { usePhone } from "../Phone/PhoneContext";

export default function SoftKeys() {
    const { softKeys } = usePhone();

    return (
        <div className="px-3">
            <div className="flex items-center justify-between text-[11px] text-slate-200">
                <span className="opacity-90">{softKeys.left}</span>
                <span className="font-semibold">{softKeys.center}</span>
                <span className="opacity-90">{softKeys.right}</span>
            </div>
            <div className="mt-1 h-0.5 bg-slate-700/80 rounded" />
        </div>
    );
}
