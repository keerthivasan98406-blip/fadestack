#!/bin/bash

echo "🚀 Deploying FADESTACK to Heroku..."

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI not found. Please install it first:"
    echo "   https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Login to Heroku
echo "🔐 Logging into Heroku..."
heroku login

# Create app (or use existing)
read -p "Enter your Heroku app name: " APP_NAME
heroku create $APP_NAME 2>/dev/null || echo "App already exists, continuing..."

# Set environment variables
echo "⚙️ Setting environment variables..."
heroku config:set MONGODB_URI="mongodb+srv://krish321epsi_db_user:123456789kishore@cluster0.x4udcsa.mongodb.net/fadestack?retryWrites=true&w=majority" --app $APP_NAME
heroku config:set JWT_SECRET="fadestack-secret-key-2024-krish321epsi" --app $APP_NAME
heroku config:set PORT=3000 --app $APP_NAME

# Deploy
echo "🚀 Deploying to Heroku..."
git push heroku main

echo "✅ Deployment complete!"
echo "🌐 Your app is available at: https://$APP_NAME.herokuapp.com"