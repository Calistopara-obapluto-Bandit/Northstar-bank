# Northstar Bank - Firebase Version

## 🚀 Firebase Setup Instructions

### Step 1: Create Firebase Project
1. Go to: https://console.firebase.google.com/
2. Click "Add project"
3. Project name: `northstar-bank`
4. Uncheck "Enable Google Analytics"
5. Click "Create project"

### Step 2: Enable Authentication
1. In Firebase console, click "Build" → "Authentication"
2. Click "Get Started"
3. Click "Email/Password" tab
4. Enable "Email/Password" sign-in
5. Click "Save"

### Step 3: Enable Firestore Database
1. Click "Build" → "Firestore Database"
2. Click "Create database"
3. Select "Start in test mode"
4. Select a location (e.g., `us-central`)
5. Click "Enable"

### Step 4: Get Firebase Configuration
1. Click gear icon → "Project settings"
2. Scroll to "Your apps"
3. Click `</>` (Web) icon
4. App nickname: `northstar-bank-web`
5. Click "Register app"
6. Copy the Firebase configuration

### Step 5: Update Firebase Config
1. Open `js/auth-firebase.js`
2. Replace the placeholder config with your actual config:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

3. Open `js/dashboard-loader-firebase.js`
4. Replace the placeholder config with the same config

### Step 6: Deploy to Netlify
1. Push code to GitHub
2. Go to https://app.netlify.com
3. Click "Add new site" → "Import from GitHub"
4. Select your repository
5. Click "Deploy site"

---

## ✅ Files Updated for Firebase

- `js/auth-firebase.js` - Firebase authentication
- `js/dashboard-loader-firebase.js` - Firebase data loading
- `index.html` - Uses auth-firebase.js
- `dashboard.html` - Uses auth-firebase.js and dashboard-loader-firebase.js
- All other pages - Use auth-firebase.js

## 🎯 Features

- Real-time authentication with Firebase
- Firestore database for accounts, transactions, goals
- Automatic account creation on sign up
- Data persists across devices
- Works with Netlify static hosting
