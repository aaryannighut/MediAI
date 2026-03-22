# MediAI - Deployment & Business Model Guide

## Business Model Strategy
MediAI is designed to be a scalable Health-Tech software-as-a-service (SaaS) and platform ecosystem.

### Potential Revenue Models
1. **Premium Subscription (B2C)**
   - Offer a free tier for basic symptom checks and health score tracking.
   - Introduce "MediAI Premium" unlocking features like continuous family health tracking, detailed ML PDF health reports, priority chatbot access, and advanced medicine reminder notifications.
2. **Online Doctor Consultation API**
   - Take a percentage fee or flat rate for matching users directly with real-world specialists via telehealth integrations on the Doctor Recommendation page.
3. **Healthcare Partner Hospitals (B2B)**
   - License the triage software algorithm to local clinics and hospitals to pre-assess incoming patients securely, optimizing emergency room wait times. 
4. **Insurance Company Partnerships**
   - Partner with insurance providers by granting aggregated anonymized health scores (upon user consent) to facilitate dynamic premium discounts for healthier lifestyle cohorts.

---

## Technical Deployment Instructions

### 1. Database Setup (MongoDB)
- In production, set up a managed MongoDB Atlas cluster.
- Inject the connection string into the FastAPI backend using environment variables (`MONGO_URI="mongodb+srv://..."`).

### 2. Backend Deployment (FastAPI)
- Host on scalable cloud architecture like AWS EC2, Google Cloud Run, or Render.
- Set up HTTPS with SSL certificates.
- Example Dockerfile included or executed via `uvicorn main:app --host 0.0.0.0 --port 8000`.

### 3. Machine Learning Ecosystem
- Shift from small dummy models to robust datasets.
- Implement retraining API pipelines triggering scikit-learn models like **Random Forest** and **Gradient Boosting**, pulling new anonymized telemetry weekly.
- Host the `.joblib` model artifact out of S3 arrays for rapid loading across distributed FastAPI workers.

### 4. Frontend Web App (Next.js)
- Deploy utilizing Vercel to harness seamless CI/CD.
- Because `next.config.ts` outputs via `'export'`, this serves static HTML/JS globally via Vercel Edge networks incredibly fast.
- Add domains and secure CORS permissions between FastAPI and the specified URL.

### 5. Mobile App Production (Capacitor/React Native)
- Generate your Android SDK.
- Configure `google-services.json` inside Capacitor's generated `android/` directory for Push notifications.
- Execute standard signing configurations over your generated `.AAB` prior to Google Play Store submission. Please see `APK_INSTRUCTIONS.md` for local testing guidelines.
