# Fix MongoDB Connection on Render

## The Issue
Render has SSL/TLS compatibility issues with some MongoDB Atlas clusters. Here's how to fix it:

## Solution 1: Update Environment Variable

In your Render dashboard, update the `MONGODB_URI` environment variable to:

```
mongodb+srv://krish321epsi_db_user:123456789kishore@cluster0.x4udcsa.mongodb.net/fadestack?retryWrites=true&w=majority&ssl=false&authSource=admin
```

## Solution 2: Alternative Connection String

If the above doesn't work, try this connection string:

```
mongodb://krish321epsi_db_user:123456789kishore@ac-gm1gbvp-shard-00-00.x4udcsa.mongodb.net:27017,ac-gm1gbvp-shard-00-01.x4udcsa.mongodb.net:27017,ac-gm1gbvp-shard-00-02.x4udcsa.mongodb.net:27017/fadestack?ssl=false&replicaSet=atlas-1f75wg-shard-0&authSource=admin&retryWrites=true&w=majority
```

## Solution 3: MongoDB Atlas Network Settings

1. Go to MongoDB Atlas dashboard
2. Navigate to Network Access
3. Click "Add IP Address"
4. Select "Allow Access from Anywhere" (0.0.0.0/0)
5. Save changes

## Solution 4: Create New Database User

1. Go to MongoDB Atlas → Database Access
2. Add new database user:
   - Username: `render_user`
   - Password: `render123456`
   - Database User Privileges: Read and write to any database

3. Use this connection string:
```
mongodb+srv://render_user:render123456@cluster0.x4udcsa.mongodb.net/fadestack?retryWrites=true&w=majority&ssl=false
```

## Quick Fix Steps for Render:

1. **Go to your Render dashboard**
2. **Click on your service**
3. **Go to Environment tab**
4. **Update MONGODB_URI to:**
   ```
   mongodb+srv://krish321epsi_db_user:123456789kishore@cluster0.x4udcsa.mongodb.net/fadestack?retryWrites=true&w=majority&ssl=false&authSource=admin
   ```
5. **Save and redeploy**

## Test the Fix:

After updating, your app should:
- Connect to MongoDB successfully
- Allow user registration
- Allow user login
- Store data in the database

The updated server code now includes better error handling and will show clearer error messages if the database connection fails.