import React, { useEffect, useMemo, useState } from "react";
import { usePhone } from "../Phone/PhoneContext";

const API = import.meta.env.VITE_API_BASE || "http://localhost:3000";

function smallBtn(cls = "") {
    return (
        "w-full rounded-xl border border-slate-600 bg-slate-900/70 py-2 text-[13px] " +
        "active:bg-slate-800 " +
        cls
    );
}

export default function Issuer() {
    const { setSoftKeys } = usePhone();

    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState("");

    const [invitationUrl, setInvitationUrl] = useState("");

    const [connections, setConnections] = useState([]);
    const [selectedConnId, setSelectedConnId] = useState("");

    const [claims, setClaims] = useState({
        name: "John Doe",
        age: 25,
        email: "john@example.com",
        department: "Computer Science",
    });

    useEffect(() => {
        setSoftKeys({ left: "Menu", center: "OK", right: "Back" });
    }, [setSoftKeys]);

    async function refreshConnections() {
        setBusy(true);
        setMsg("");
        try {
            const res = await fetch(`${API}/api/connections`);
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Failed to load connections");
            setConnections(data.items || []);
            // auto-select first connected if none selected
            if (!selectedConnId) {
                const connected = (data.items || []).find((x) => x.status === "connected");
                if (connected?.connectionId) setSelectedConnId(connected.connectionId);
            }
        } catch (e) {
            setMsg(`Error: ${e.message}`);
        } finally {
            setBusy(false);
        }
    }

    async function createInvitation() {
        setBusy(true);
        setMsg("");
        try {
            const res = await fetch(`${API}/api/issuer/create-invitation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ label: "holder", alias: "holder" }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Create invitation failed");
            setInvitationUrl(data.invitationUrl);
            setMsg("Invitation created ✓\nNow copy it and paste into Holder.");
            await refreshConnections();
        } catch (e) {
            setMsg(`Error: ${e.message}`);
        } finally {
            setBusy(false);
        }
    }

    async function copyInvitation() {
        try {
            await navigator.clipboard.writeText(invitationUrl);
            setMsg("Copied ✓");
        } catch {
            setMsg("Copy not allowed.\nManually select and copy the text.");
        }
    }

    async function issueCredential() {
        if (!selectedConnId) {
            setMsg("Select a connected connection first.");
            return;
        }

        setBusy(true);
        setMsg("");
        try {
            const res = await fetch(`${API}/api/issuer/issue-credential`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    connectionId: selectedConnId,
                    claims: {
                        name: claims.name,
                        age: Number(claims.age),
                        email: claims.email,
                        department: claims.department,
                    },
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Issue credential failed");
            setMsg(`Credential offered ✓\ncredentialId: ${data.credentialId}`);
        } catch (e) {
            setMsg(`Error: ${e.message}`);
        } finally {
            setBusy(false);
        }
    }

    const connectedOnly = useMemo(
        () => connections.filter((c) => c.status === "connected" && c.connectionId),
        [connections]
    );

    useEffect(() => {
        refreshConnections();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="p-3 text-slate-100">
            {/* Actions */}
            <div className="text-[13px] font-semibold">Issuer</div>
            <div className="text-[11px] opacity-75 mt-1">
                Step 1: Create Invitation → paste into Holder → then issue credential.
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
                <button className={smallBtn()} disabled={busy} onClick={createInvitation}>
                    {busy ? "Working…" : "Create Invitation"}
                </button>
                <button className={smallBtn()} disabled={busy} onClick={refreshConnections}>
                    Refresh
                </button>
            </div>

            {/* Invitation box */}
            <div className="mt-2 rounded-xl border border-slate-700 bg-slate-900/40 p-2">
                <div className="text-[12px] font-semibold">Invitation URL</div>
                <textarea
                    value={invitationUrl}
                    readOnly
                    className="mt-1 w-full h-20 text-[11px] p-2 rounded-lg bg-slate-950/50 border border-slate-700"
                    placeholder="Create invitation to generate..."
                />
                <button
                    className={smallBtn("mt-2")}
                    disabled={!invitationUrl}
                    onClick={copyInvitation}
                >
                    Copy Invitation
                </button>
            </div>

            {/* Connection picker */}
            <div className="mt-2 rounded-xl border border-slate-700 bg-slate-900/40 p-2">
                <div className="text-[12px] font-semibold">Connected Connections</div>

                {connectedOnly.length === 0 ? (
                    <div className="text-[11px] opacity-70 mt-1">No connected yet.</div>
                ) : (
                    <select
                        value={selectedConnId}
                        onChange={(e) => setSelectedConnId(e.target.value)}
                        className="mt-2 w-full text-[12px] p-2 rounded-lg bg-slate-950/50 border border-slate-700"
                    >
                        {connectedOnly.map((c) => (
                            <option key={c.connectionId} value={c.connectionId}>
                                {c.connectionId.slice(0, 10)}… (connected)
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* Claims */}
            <div className="mt-2 rounded-xl border border-slate-700 bg-slate-900/40 p-2">
                <div className="text-[12px] font-semibold">Credential Claims</div>

                <div className="mt-2 grid grid-cols-2 gap-2">
                    <input
                        value={claims.name}
                        onChange={(e) => setClaims((s) => ({ ...s, name: e.target.value }))}
                        className="text-[12px] p-2 rounded-lg bg-slate-950/50 border border-slate-700"
                        placeholder="Name"
                    />
                    <input
                        value={claims.age}
                        onChange={(e) => setClaims((s) => ({ ...s, age: e.target.value }))}
                        className="text-[12px] p-2 rounded-lg bg-slate-950/50 border border-slate-700"
                        placeholder="Age"
                        inputMode="numeric"
                    />
                    <input
                        value={claims.email}
                        onChange={(e) => setClaims((s) => ({ ...s, email: e.target.value }))}
                        className="col-span-2 text-[12px] p-2 rounded-lg bg-slate-950/50 border border-slate-700"
                        placeholder="Email"
                    />
                    <input
                        value={claims.department}
                        onChange={(e) => setClaims((s) => ({ ...s, department: e.target.value }))}
                        className="col-span-2 text-[12px] p-2 rounded-lg bg-slate-950/50 border border-slate-700"
                        placeholder="Department"
                    />
                </div>

                <button
                    className={smallBtn("mt-2")}
                    disabled={busy || !selectedConnId}
                    onClick={issueCredential}
                >
                    Issue Credential (Offer)
                </button>
            </div>

            {msg ? (
                <pre className="mt-2 text-[11px] whitespace-pre-wrap rounded-xl border border-slate-700 bg-slate-900/50 p-2">
                    {msg}
                </pre>
            ) : null}
        </div>
    );
}
