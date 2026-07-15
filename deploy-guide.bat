@echo off
echo ====================================
echo Northstar Bank Deployment Guide
echo ====================================
echo.
echo Step 1: Install Dependencies
echo -------------------------------
echo Run: npm install
echo.
echo Step 2: Set up MongoDB Atlas
echo -------------------------------
echo 1. Go to https://www.mongodb.com/cloud/atlas
echo 2. Create a free account
echo 3. Create a new cluster (free tier)
echo 4. Click "Connect" → "Connect your application"
echo 5. Copy the connection string
echo 6. Create a .env file with your connection string
echo.
echo Step 3: Create .env file
echo --------------------------
echo Create a file named .env in the project folder with:
echo MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/northstar-bank?retryWrites=true&w=majority
echo PORT=3000
echo.
echo Step 4: Test Locally
echo --------------------
echo Run: npm start
echo Then open http://localhost:3000
echo.
echo Step 5: Deploy to Cyclic.sh
echo ---------------------------
echo 1. Create a GitHub repository
echo 2. Initialize git and push:
echo    git init
echo    git add .
echo    git commit -m "Initial commit"
echo    git branch -M main
echo    git remote add origin https://github.com/YOUR_USERNAME/northstar-bank.git
echo    git push -u origin main
echo.
echo 3. Go to https://cyclic.sh
echo 4. Click "New Project" → Connect your GitHub repo
echo 5. Add environment variables:
echo    - MONGODB_URI = your MongoDB connection string
echo    - PORT = 3000
echo 6. Click "Deploy"
echo.
echo ====================================
echo Deployment complete!
echo Your app will be at: https://your-app-name.cyclic.app
echo ====================================
pause
