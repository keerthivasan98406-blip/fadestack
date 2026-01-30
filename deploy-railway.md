# Deploy to Railway (Easiest Option)

Railway is the easiest way to deploy your FADESTACK application. Follow these steps:

## 🚀 Quick Deploy

1. **Go to Railway**
   - Visit: https://railway.app
   - Click "Start a New Project"
   - Choose "Deploy from GitHub repo"

2. **Connect GitHub**
   - Authorize Railway to access your GitHub
   - Select the `fadestack` repository

3. **Set Environment Variables**
   - In the Railway dashboard, click on your project
   - Go to the "Variables" tab
   - Add these variables:
     ```
     MONGODB_URI = mongodb+srv://krish321epsi_db_user:123456789kishore@cluster0.x4udcsa.mongodb.net/fadestack?retryWrites=true&w=majority
     JWT_SECRET = fadestack-secret-key-2024-krish321epsi
     PORT = 3000
     ```

4. **Deploy**
   - Railway will automatically build and deploy your app
   - You'll get a URL like: `https://fadestack-production.up.railway.app`

## ✅ Test Your Deployment

1. Visit your Railway URL
2. You should see the login page
3. Try creating an account - it should save to your MongoDB database
4. Login and access the main website

## 🔧 Troubleshooting

If the database doesn't work:
1. Check that all environment variables are set correctly
2. Verify your MongoDB Atlas cluster is running
3. Ensure network access is set to "Allow access from anywhere" (0.0.0.0/0)

## 💡 Why Railway?

- ✅ Free tier available
- ✅ Automatic deployments on git push
- ✅ Easy environment variable management
- ✅ Built-in monitoring and logs
- ✅ No credit card required for basic usage