# Complete Deployment Guide for Northstar Bank

## Prerequisites

### 1. Install Node.js
- Download from: https://nodejs.org/
- Download the LTS version (Long Term Support)
- Run the installer
- Restart your computer after installation

### 2. Install Git
- Download from: https://git-scm.com/download/win
- Run the installer
- Use default settings

### 3. Create GitHub Account
- Go to: https://github.com/signup
- Create a free account

---

## Step-by-Step Deployment

### Step 1: Install Project Dependencies

1. Open PowerShell
2. Navigate to project folder:
```powershell
cd "C:\Users\Daniel\Downloads\templatemo_506_tinker"
```

3. Install dependencies:
```powershell
npm install
```

### Step 2: Set up MongoDB Atlas

1. Go to: https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Create an account (use email/password)
4. Choose "Shared" (free tier)
5. Name your cluster (e.g., "northstar-bank")
6. Click "Create Cluster" (wait 2-3 minutes for cluster to be ready)
7. Click "Connect" → "Connect your application"
8. Choose "Node.js" and version "4.1 or later"
9. Copy the connection string (it looks like: `mongodb+srv://...`)
10. Click "Network Access" → "Add IP Address"
11. Enter: `0.0.0.0/0` (allows access from anywhere - for testing)
12. Click "Confirm"

### Step 3: Create .env File

1. In your project folder, create a new file named `.env` (no file extension)
2. Add this content (replace with your actual MongoDB connection string):
```
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/northstar-bank?retryWrites=true&w=majority
PORT=3000
```

### Step 4: Test Locally

1. In PowerShell, run:
```powershell
npm start
```

2. Open your browser and go to: http://localhost:3000
3. Test the application works

### Step 5: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `northstar-bank`
3. Description: "Northstar Bank - Banking Application"
4. Make it "Public" or "Private" (your choice)
5. Click "Create repository"

### Step 6: Push Code to GitHub

1. In PowerShell (in your project folder):
```powershell
git init
git add .
git commit -m "Initial commit - Northstar Bank"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/northstar-bank.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 7: Deploy to Cyclic.sh

1. Go to: https://cyclic.sh
2. Click "Log in with GitHub"
3. Authorize Cyclic to access your GitHub
4. Click "New Project"
5. Select your `northstar-bank` repository
6. Cyclic will detect it as a Node.js project
7. Click "Deploy"

### Step 8: Add Environment Variables

1. In Cyclic, go to your project
2. Click "Project Settings" → "Environment Variables"
3. Add:
   - Key: `MONGODB_URI`
   - Value: Your MongoDB connection string from Step 2
4. Add:
   - Key: `PORT`
   - Value: `3000`
5. Click "Save"

### Step 9: Redeploy

1. Click "Redeploy" in Cyclic
2. Wait for deployment to complete (1-2 minutes)
3. Your app will be live at: `https://your-app-name.cyclic.app`

---

## Troubleshooting

### If npm is not recognized:
- Make sure you installed Node.js from nodejs.org
- Restart your computer after installation
- Try running `node --version` in PowerShell

### If MongoDB connection fails:
- Make sure you whitelisted IP `0.0.0.0/0` in MongoDB Atlas
- Check that your connection string is correct
- Verify cluster is ready (green checkmark in Atlas)

### If deployment fails:
- Check Cyclic logs for errors
- Verify environment variables are set correctly
- Make sure package.json has the correct start script

---

## Your Live Application

Once deployed, your app will be accessible at:
- https://[your-app-name].cyclic.app/index.html (landing page)
- https://[your-app-name].cyclic.app/dashboard.html (dashboard)
- etc.

All features will work with MongoDB Atlas database backend!
