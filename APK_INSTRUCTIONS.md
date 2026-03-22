# MediAI - Android APK Packaging Instructions

This document provides steps on how to wrap the MediAI Next.js app into an Android APK using Capacitor.

## Prerequisites
1. Node.js installed
2. Android Studio installed with Android SDK
3. Java Development Kit (JDK) installed

## Step 1: Initialize Capacitor
In the `frontend` directory, Capacitor has already been installed.
Initialize it if not already done:
```bash
npx cap init MediAI com.mediai.app
```
(Set web directory to `out` since we will use Next.js static export).

## Step 2: Next.js Static Export
Update your `next.config.mjs` to enable static export:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true
    }
};
export default nextConfig;
```
Then build the Next.js app:
```bash
npm run build
```
This will generate an `out` folder containing the static HTML/JS/CSS assets.

## Step 3: Add Android Platform
Add the Android platform to Capacitor:
```bash
npx cap add android
```

## Step 4: Sync Web Assets
Identify the `out` directory to the `capacitor.config.ts` (or `.json`):
```json
{
  "appId": "com.mediai.app",
  "appName": "MediAI",
  "webDir": "out",
  "bundledWebRuntime": false
}
```
Sync the `out` directory to the Android project:
```bash
npx cap sync android
```

## Step 5: Build APK
Open the Android project in Android Studio:
```bash
npx cap open android
```
In Android Studio:
1. Wait for Gradle sync to complete.
2. Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
3. Once completed, a popup will show the location of your `app-debug.apk` (usually in `android/app/build/outputs/apk/debug/`).

## Offline Caching Support
We integrated touch-friendly buttons and mobile-optimized layouts using Tailwind container queries and responsive utilities (`sm:`, `md:`). 
For offline caching, you can register a service worker in Next.js (e.g. using `next-pwa`) to cache the assets locally.
