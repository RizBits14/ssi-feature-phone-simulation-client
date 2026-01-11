🔐 Simulation (Step by Step)

🧩 Trust Triangle Setup

This simulaction demonstrates the Self-Sovereign Identity (SSI) Trust Triangle between Issuer, Holder, and Verifier using a phone-based UI.

## Step By Step Simulation

# 1) Trust Triangle - Setup - 1

**(Issuer → Creates Invitation)**

- Go to **Issuer**
- Press **Create Invitation**
- An Invitation URL is Generated
- Press **Copy Invitation**

✅ Output to expect

- **"Invitation Created ✓"**
- A long invitation string / URL

```bash
📌 Meaning:

The Issuer is inviting a Holder to establish a secure connection.

"Holder, please connect with me (Issuer)"

```

# 2) Trsut Triangle - Setup - 2

**(Holder → Connects to Issuer)**

- Go to **Holder**
- Paste the copied invitation into the input box
- Press **OK (Connect)**

✅ Output to expect

- **"Connected ✓"**
- A generated connectionId

```bash
📌 Meaning:

A secure relationship is now established between Holder and Issuer.

"Issuer is now connected with the Holder and vice versa"