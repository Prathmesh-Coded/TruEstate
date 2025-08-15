# 🚀 Google OAuth Setup Guide

## 📋 Prerequisites

Before starting, ensure you have:

- Node.js (v16 or higher)
- MongoDB database (local or cloud)
- Google Cloud Console access

## 🔧 Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install connect-mongo nodemon
```

### 2. Environment Variables

Create/update your `backend/.env` file with:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here

# Session Configuration
SESSION_SECRET=your_super_secure_session_secret_here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_google_client_secret

# Optional Configuration
NODE_ENV=development
PORT=5000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5174
```

### 3. Google Cloud Console Setup

1. **Create/Select Project**

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Google+ API**

   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" or "Google Identity"
   - Enable the API

3. **Create OAuth 2.0 Credentials**

   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Name it "TruEstate Web Client"

4. **Configure Authorized URLs**

   - **Authorized JavaScript origins:**
     ```
     http://localhost:5173
     http://localhost:5174
     http://localhost:3000
     ```
   - **Authorized redirect URIs:**
     ```
     http://localhost:5000/api/auth/google/callback
     ```

5. **Get Credentials**
   - Copy the Client ID and Client Secret
   - Add them to your `.env` file

## 🧪 Testing Configuration

Run the configuration test:

```bash
cd backend
node test-google-auth.js
```

This will verify:

- ✅ All environment variables are present
- ✅ MongoDB connection works
- ✅ Google OAuth credentials format is correct

## 🚀 Starting the Application

### Backend

```bash
cd backend
npm start
# or for development with auto-reload:
npm run dev
```

### Frontend

```bash
cd frontend
npm run dev
```

## 🔒 Security Features

The production implementation includes:

### Authentication Security

- **Rate Limiting**: 10 login attempts per IP per 15 minutes
- **Account Lockout**: 5 failed attempts locks account for 2 hours
- **Secure Sessions**: MongoDB-backed sessions with proper expiration
- **JWT Security**: 7-day expiration with secure cookies

### Input Validation

- **Email Validation**: RFC-compliant email format checking
- **Password Strength**: Minimum 6 characters, maximum 128
- **SQL Injection Protection**: Mongoose ODM with parameterized queries
- **XSS Protection**: Input sanitization and validation

### CORS & Network Security

- **CORS Configuration**: Whitelist of allowed origins
- **Secure Cookies**: HttpOnly, Secure, SameSite attributes
- **Session Security**: Custom session names and secure storage

## 🔄 OAuth Flow

```
1. User clicks "Sign in with Google"
   ↓
2. Frontend redirects to: /api/auth/google
   ↓
3. Backend redirects to Google OAuth
   ↓
4. User authorizes on Google
   ↓
5. Google redirects to: /api/auth/google/callback
   ↓
6. Backend processes user data
   ↓
7. Backend sets JWT cookie
   ↓
8. Backend redirects to frontend with success
   ↓
9. Frontend detects success and logs user in
```

## 🐛 Troubleshooting

### Common Issues

1. **"Not allowed by CORS"**

   - Check `ALLOWED_ORIGINS` in `.env`
   - Ensure frontend URL is in the whitelist

2. **"Google authentication failed"**

   - Verify Google Client ID and Secret
   - Check authorized redirect URIs in Google Console
   - Ensure APIs are enabled

3. **"MongoDB connection error"**

   - Verify `MONGODB_URI` is correct
   - Check database server is running
   - Ensure network connectivity

4. **"Session/Cookie issues"**
   - Check `SESSION_SECRET` is set
   - Verify cookie settings for your environment
   - Clear browser cookies and try again

### Debug Mode

Set environment variable for detailed logging:

```bash
DEBUG=passport:* node index.js
```

## 📊 Monitoring & Logs

The application logs important events:

- User registrations and logins
- Failed authentication attempts
- OAuth callback successes/failures
- Database connection status
- Rate limiting triggers

## 🔄 Production Deployment

For production deployment:

1. **Environment Variables**

   ```env
   NODE_ENV=production
   MONGODB_URI=your_production_mongodb_uri
   ALLOWED_ORIGINS=https://yourdomain.com
   ```

2. **Google Console Updates**

   - Add production domain to authorized origins
   - Update redirect URIs for production

3. **Security Considerations**
   - Use HTTPS in production
   - Set secure cookie flags
   - Configure proper CORS origins
   - Use strong secrets (32+ characters)

## ✅ Success Indicators

When everything is working correctly:

- ✅ Test script passes all checks
- ✅ Backend starts without errors
- ✅ Google sign-in button redirects to Google
- ✅ After Google authorization, user is logged in
- ✅ User data is saved to MongoDB
- ✅ JWT cookie is set properly

## 📞 Support

If you encounter issues:

1. Run the test script first
2. Check the troubleshooting section
3. Verify all environment variables
4. Check browser developer console for errors
5. Review backend server logs

---

**🎉 Congratulations!** Your Google OAuth integration is now production-ready with enterprise-level security features!
