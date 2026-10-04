# DUPILIO — Security, Privacy & Compliance Architecture

> **Brand Statement**: *One profile. Every opportunity. A smarter path to your next role.*

---

## 1. Authentication & Session Security

- **JSON Web Tokens (JWT)**: Signed with HMAC-SHA256 (`JWT_SECRET`), expiring in 7 days.
- **Password Protection**: Passwords are salted and hashed using `bcrypt` (10 rounds) before persistence.
- **Route Guards**: Dual-layer authorization:
  - Frontend protected route wrappers redirect unauthenticated visitors.
  - Backend `protect` middleware strictly validates Bearer tokens on all private endpoints.

---

## 2. Zero-Credential Architecture (Section 14)

DUPILIO connects to developer platforms (LeetCode, Codeforces, GitHub, CodeChef, AtCoder) purely through **public user handles**:
- Users are **never** prompted for third-party passwords, personal API tokens, or session cookies.
- No third-party platform credentials exist in our database, memory, or log files.

---

## 3. Resume Upload Security (Section 39)

The Resume Analyzer (`/career/resume`) adheres to enterprise security standards:
1. **Size Limit**: Enforced 10MB maximum payload ceiling. Larger files are rejected with HTTP 400.
2. **Strict MIME Validation**: Only authentic `application/pdf` streams are accepted. Executables or scripts are rejected.
3. **In-Memory Text Processing**: Files are processed in memory buffer streams rather than saved to unmonitored public disks.
4. **Private Access**: Resumes are linked strictly to `req.user._id` and never indexed or served publicly.

---

## 4. Location Privacy (Section 37)

For Hackathons & Opportunities discovery:
- **Coarse Location Only**: DUPILIO only stores coarse metropolitan regions (e.g. `Bengaluru`, `Delhi NCR`, `Hyderabad`, `Online`).
- **No Precise GPS**: Precise GPS coordinates, latitude/longitude, or IP tracking are strictly prohibited.
- **Manual Override**: If location permissions are withheld, users select their preferred city from a manual dropdown.

---

## 5. Network Hardening & Injection Prevention

- **CORS**: Restricted cross-origin configuration.
- **Sanitization**: All user inputs in discussions, commands, and profile edits are sanitized against XSS and NoSQL injection attacks.
- **Zero Raw Secrets in Logs**: Sensitive environment variables, Bearer tokens, and user hashes are excluded from server stdout/stderr logs.
