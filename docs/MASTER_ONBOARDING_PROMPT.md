# Master Onboarding Prompt for Accounting Buddy

```
You are now the engineering assistant for the "Accounting Buddy" project — a minimal AI-powered P&L automation web app.

Your first task is to read and fully understand all documentation and prompt files in this repository before generating any code.

---

## 🔍 Objective

Accounting Buddy automates expense tracking into Google Sheets using OCR + AI extraction.

### Core Flow:
Upload receipt → OCR (Google Vision) → AI extraction (OpenAI GPT-4o) → Review → Append to Google Sheet.

Phase 1 focuses only on:
✅ Clean responsive UI (Next.js + Tailwind + TypeScript)  
✅ Google Vision OCR + GPT-4o extraction  
✅ Google Sheets webhook append  
✅ Simple toast feedback and error handling  
✅ No authentication, no database, no persistent storage  

---

## 📁 Repository Structure to Study

### Root
- **README.md** — Project overview, architecture, and phase roadmap.
- **SECURITY.md** — Safe handling of API keys, webhook secrets, and uploads.
- **.env.example** — Environment variable references.
- **TESTING.md** — End-to-end flow and acceptance criteria for QA.

### `/prompts/`
Each file defines a build stage for you to execute incrementally:

1. **00_setup_ui.txt** — Build UI scaffold (Upload / Review / Inbox) using mock data.
2. **01_ocr_api.txt** — Add Google Vision OCR API route and integrate into upload flow.
3. **02_extract_api.txt** — Add OpenAI GPT-4o extraction for structured JSON output.
4. **03_sheets_webhook.txt** — Connect Google Sheets webhook via Apps Script.
5. **04_polish_and_tests.txt** — Finalize UI, animations, error messages, and QA polish.

You must read and remember these stages as the official build order.

---

## 🧭 Instructions

1. **Read all files carefully** — understand every section, architecture decision, and security note.
2. **Do NOT start coding yet.**  
   First, summarize internally how each stage connects (UI → OCR → AI → Sheets).
3. **Validate dependencies:**
   - Framework: Next.js (App Router, TypeScript)
   - Styling: Tailwind CSS
   - APIs: Google Vision, OpenAI GPT-4o, Google Apps Script Webhook
4. **Confirm acceptance criteria** from `README.md` and `TESTING.md` — this defines "done".
5. **Note key constraints:**
   - No backend DB
   - No authentication
   - In-memory file handling only
   - Secure API key usage (server-side)
6. After reading all files, respond with:
```

✅ All files read and understood.
✅ Phase 1 ready for staged build.
✅ Awaiting which prompt file to execute first.

```

---

## 🚦 Your Next Step After Reading
When confirmed, you'll begin with `/prompts/00_setup_ui.txt`.

Each phase must be executed one at a time, using the corresponding prompt file for precise scope.

---

**Goal:**  
Ensure you have full comprehension of the system's purpose, structure, flow, and security before writing a single line of code.

```

---

## ✅ Usage Instructions

When you upload everything into **Augment AI**:

1. Add all files (`README.md`, `.env.example`, `SECURITY.md`, `TESTING.md`, and `/prompts/` folder).
2. Paste the above **Master Onboarding Prompt** into Augment's chat.
3. Wait for Augment to confirm understanding with the three green checkmarks.
4. Then you can begin the build by instructing:

   > "Start Phase 1 using `/prompts/00_setup_ui.txt`."

---

This master prompt ensures any AI assistant will:
- Read and understand the complete project architecture
- Follow the phased build approach correctly  
- Implement security best practices from the start
- Meet all acceptance criteria defined in your testing documentation
- Build exactly what's specified without scope creep