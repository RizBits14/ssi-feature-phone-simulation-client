🔐 Simulation (Step by Step)

🧩 Trust Triangle Setup

This simulaction demonstrates the Self-Sovereign Identity (SSI) Trust Triangle between Issuer, Holder, and Verifier using a phone-based UI.

# Environment Configuration:

**Required Variables**

- VITE_API_BASE

# Step By Step Simulation

## 1) (Issuer → Creates Invitation)

- Go to **Issuer**
- Press **Create Invitation**
- An Invitation URL is Generated
- Press **Copy Invitation**

Output to expect

- **"Invitation Created ✓"**
- A long invitation string / URL

```bash
Meaning:

The Issuer is inviting a Holder to establish a secure connection.

"Holder, please connect with me (Issuer)"

```

## 2) (Holder → Connects to Issuer)

- Go to **Holder**
- Paste the copied invitation into the input box
- Press **OK (Connect)**

Output to expect

- **"Connected ✓"**
- A generated connectionId

```bash
Meaning:

A secure relationship is now established between Holder and Issuer.

"Issuer is now connected with the Holder and vice versa"

```

## 3) (Issuer → Issues Credential to Holder)

- Go back to **Issuer**
- Press **Refresh**
- Select the connected connectionId
- Fill in credentials fields:
    *The fields are already autofilled if you want you can input as per your requirements on credentials.*
    - name
    - age
    - email
    - department
- Press **Issue Credential (Offer)**

Output to expect

- **"Credential offered"**

```bash
Meaning:

The Issuer is offering a Verifiable Credential to the Holder.

"Issuer has offered the credential to the Holder"

```

## 4) (Holder → Accepts Credential)

- Go to **Holder**
- Press **Refresh**
- Under **Offered Credentials**, locate the new offer
- Press **Accept**

Output to expect

- **"Credential accepted ✓"**

```bash
Meaning:

The credential is now securely stored in the Holder’s wallet (MongoDB).

"Credential moves from Offered → Accepted"

```

## 5) (Verifier → Sends Proof Request to Holder)

- Go to **Verifier**
- Press **Refresh**
- Select the name connected connectionId
- Press **Send Proof**

Output to expect

- **"Proof request sent ✓"**

```bash
Meaning:

The Verifier is requesting proof of specific credential attributes from the Holder.

"A generated proofRequestId"

```

## 6) (Holder → Presents Proof)

- Go to **Holder**
- Press **Refresh**
- Under **Proof Request**, select the request
- Ensure the **Accepted Credential** is selected
- Press **Present Proof**

Output to expect

- **"Presented ✓"**

```bash
Meaning:

The Holder presents a cryptographic proof derived from the credential
(without necessarily sharing the full credential).

"Verified: true or updated proof status"

```

## 7) (Verifier → Verifies Proof)

- Go back to **Verifier**
- Press **Refresh**
- Check the **Presentation**

Output to expect

- **Status: verified / accepted**

```bash
Meaning:

The Verifier has successfully verified the proof using trust in the Issuer.

"Linked to the corresponding proofRequestId"

```

```bash
What This Simulation Demonstrates:
- Issuer Trust
    - The Issuer is trusted to issue valid and authentic credentials
- Holder Control
    - The Holder owns the credentials and decides what information to share
- Verifier Validation
    - The Verifier validates proofs without contracting the Issuer every time

```

## Conclusion

**Issuer → Holder → Verifier (This completes the SSI Trust Triangle simulation)**

**A full end-to-end flow of:**

- Connection
- Credential Issuance
- Proof Request
- Proof Presentation
- Verification