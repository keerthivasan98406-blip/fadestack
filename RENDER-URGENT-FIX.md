# 🚨 URGENT: Fix MongoDB Connection on Render

## The Problem
Your Fadestack app is deployed but can't connect to MongoDB Atlas due to SSL/TLS issues on Render.

## ⚡ IMMEDIATE FIX (2 minutes)

### Step 1: Update Environment Variable in Render
1. Go to your Render dashboard: https://dashboard.render.com
2. Click on your **fadestack** service
3. Go to **Environment** tab
4. Find `MONGODB_URI` and update it to:

```
mongodb+srv://krish321epsi_db_user:123456789kishore@cluster0.x4udcsa.mongodb.net/fadestack?retryWrites=true&w=majority&ssl=false&authSource=admin
```

### Step 2: Redeploy
1. Click **"Manual Deploy"** → **"Deploy Latest Commit"**
2. Wait 2-3 minutes for deployment to complete

## ✅ Alternative Connection Strings (Try in Order)

If the first one doesn't work, try these:

### Option 2:
```
mongodb+srv://krish321epsi_db_user:123456789kishore@cluster0.x4udcsa.mongodb.net/fadestack?ssl=false&authSource=admin
```

### Option 3:
```
mongodb://krish321epsi_db_user:123456789kishore@cluster0.x4udcsa.mongodb.net:27017/fadestack?ssl=false&authSource=admin
```

## 🔧 MongoDB Atlas Settings Check

1. **Go to MongoDB Atlas**: https://cloud.mongodb.com
2. **Network Access**: 
   - Click "Network Access" in left sidebar
   - Ensure "0.0.0.0/0" is in the IP Access List
   - If not, click "Add IP Address" → "Allow Access from Anywhere"

3. **Database Access**:
   - Click "Database Access" 
   - Verify user `krish321epsi_db_user` exists
   - Password should be `123456789kishore`

## 🧪 Test After Fix

Your app should now:
- ✅ Load the login page at https://fadestack.onrender.com
- ✅ Allow user registration (saves to database)
- ✅ Allow user login (reads from database)
- ✅ Redirect to main app after login

## 📞 If Still Not Working

Try Railway instead (easier MongoDB connection):
1. Go to https://railway.app
2. Deploy from GitHub: `keerthivasan98406-blip/fadestack`
3. Set environment variables (same as above)
4. Railway handles MongoDB connections better than Render

## 🎯 Expected Result

After the fix, your live app at https://fadestack.onrender.com should work exactly like your local version - users can register, login, and access the main portfolio website.

The database connection error should be resolved and user data will be properly stored in MongoDB Atlas.