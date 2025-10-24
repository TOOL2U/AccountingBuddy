# SECURITY.md — Phase 1 Security Guidelines

## Webhook Security
- Use `SHEETS_WEBHOOK_SECRET` (32-byte random string generated via `openssl rand -base64 32`).
- Validate the secret in the Google Apps Script webhook before appending any data.
- Keep the secret confidential; never hardcode it in the frontend or share publicly.

## File Handling
- Accept only:  
  - `image/jpeg`  
  - `image/png`  
  - `application/pdf`
- Process uploads in-memory only — do not store files locally or in public storage.
- Clear temporary previews when users navigate away.

## API Key Protection
- All keys (`GOOGLE_VISION_KEY`, `OPENAI_API_KEY`, `SHEETS_WEBHOOK_URL`, `SHEETS_WEBHOOK_SECRET`) stay server-side.
- Never expose them in client code or the browser network panel.

## Current Risks
- No authentication in Phase 1 → anyone with the URL can access the app.
- Webhook secret is the only access control.

## Mitigation Plan
- **Phase 1**: rely on `SHEETS_WEBHOOK_SECRET` + strict file-type validation.
- **Phase 2**: add Google OAuth for user login, server-side validation, and rate limiting.

## Future Security Enhancements
- Encrypt sensitive fields (e.g., `amount`) in Firestore once persistence is added.
- Add client-side throttling or exponential backoff for Vision/API rate limits.
- Implement request logging and monitoring to flag abuse.