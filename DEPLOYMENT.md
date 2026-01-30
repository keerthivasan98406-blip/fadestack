# Deployment Guide

This guide explains how to deploy your FADESTACK application to various platforms and ensure the database connection works properly.

## 🚀 Quick Deploy Options

### Option 1: Heroku (Recommended)

1. **Install Heroku CLI**
   ```bash
   # Download from: https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login and Create App**
   ```bash
   heroku login
   heroku create your-app-name
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI="mongodb+srv://krish321epsi_db_user:123456789kishore@cluster0.x4udcsa.mongodb.net/fadestack?retryWrites=true&w=majority"
   heroku config:set JWT_SECRET="fadestack-secret-key-2024-krish321epsi"
   heroku config:set PORT=3000
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

### Option 2: Railway

1. **Connect GitHub Repository**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub account
   - Select the fadestack repository

2. **Set Environment Variables**
   - In Railway dashboard, go to Variables tab
   - Add:
     - `MONGODB_URI`: `mongodb+srv://krish321epsi_db_user:123456789kishore@cluster0.x4udcsa.mongodb.net/fadestack?retryWrites=true&w=majority`
     - `JWT_SECRET`: `fadestack-secret-key-2024-krish321epsi`
     - `PORT`: `3000`

3. **Deploy**
   - Railway will automatically deploy on push

### Option 3: Render

1. **Connect Repository**
   - Go to [render.com](https://render.com)
   - Create new Web Service
   - Connect your GitHub repository

2. **Configure Service**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables:
     - `MONGODB_URI`: `mongodb+srv://krish321epsi_db_user:123456789kishore@cluster0.x4udcsa.mongodb.net/fadestack?retryWrites=true&w=majority`
     - `JWT_SECRET`: `fadestack-secret-key-2024-krish321epsi`

## 🔧 Environment Variables Setup

### Required Variables:
```bash
MONGODB_URI=mongodb+srv://krish321epsi_db_user:123456789kishore@cluster0.x4udcsa.mongodb.net/fadestack?retryWrites=true&w=majority
JWT_SECRET=fadestack-secret-key-2024-krish321epsi
PORT=3000
```

### MongoDB Atlas Setup:
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Login with your account
3. Go to Database Access → Add Database User
4. Username: `krish321epsi_db_user`
5. Password: `123456789kishore`
6. Go to Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)

## 🐛 Troubleshooting

### Database Connection Issues:
1. **Check MongoDB Atlas**:
   - Ensure cluster is running
   - Verify database user credentials
   - Check network access (whitelist 0.0.0.0/0 for all IPs)

2. **Check Environment Variables**:
   - Verify MONGODB_URI is set correctly
   - Ensure no extra spaces or quotes

3. **Check Server Logs**:
   ```bash
   # Heroku
   heroku logs --tail
   
   # Railway
   Check logs in Railway dashboard
   
   # Render
   Check logs in Render dashboard
   ```

### Common Errors:
- `MongoNetworkError`: Check network access in MongoDB Atlas
- `Authentication failed`: Verify username/password in connection string
- `CORS errors`: Ensure frontend is accessing the correct API URL

## 🔄 Auto-Deploy Setup

### GitHub Actions (Optional):
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Heroku
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "your-app-name"
        heroku_email: "your-email@example.com"
```

## 📱 Testing Deployment

1. **Visit your deployed URL**
2. **Test Registration**: Create a new account
3. **Check Database**: Verify user is saved in MongoDB Atlas
4. **Test Login**: Login with created account
5. **Check Navigation**: Ensure all features work

## 🔒 Security Notes

- Never commit `.env` file to GitHub
- Use strong JWT secrets in production
- Enable MongoDB Atlas IP whitelisting for production
- Use HTTPS in production (most platforms provide this automatically)

## 📞 Support

If you encounter issues:
1. Check the platform-specific logs
2. Verify MongoDB Atlas connection
3. Ensure all environment variables are set correctly
4. Test locally first with the same environment variables