# Email Setup Guide - iCloud SMTP

This contact form uses **Nodemailer** with **iCloud SMTP** to send fan mail to your `@leobruno.it` email address.

## Setup Steps

### 1. Generate an App-Specific Password

Since you have 2FA enabled on your Apple ID (required for custom domains), you need an app-specific password:

1. Go to [Apple ID Account Management](https://appleid.apple.com/account/manage)
2. Sign in with your Apple ID
3. In the **Security** section, find **App-Specific Passwords**
4. Click **Generate an app-specific password**
5. Label it something like `leobruno.it website`
6. Copy the generated password (format: `xxxx-xxxx-xxxx-xxxx`)

### 2. Create `.env.local` File

Create a file called `.env.local` in the root of your project:

```bash
# Your @leobruno.it email address
ICLOUD_EMAIL=your-email@leobruno.it

# The app-specific password you just generated
ICLOUD_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

**Important:** Make sure `.env.local` is in your `.gitignore` (it should be by default in Next.js)

### 3. Restart Your Dev Server

After creating `.env.local`, restart your development server:

```bash
npm run dev
```

### 4. Test the Contact Form

1. Go to any page with the sidebar
2. Type a test message in the fan mail textarea
3. Click "Send"
4. Check your `@leobruno.it` inbox

## Troubleshooting

### "Authentication failed" error

- Double-check your app-specific password is correct
- Make sure you're using your `@leobruno.it` email address
- Verify 2FA is enabled on your Apple ID

### "Connection timeout" error

- Check your internet connection
- iCloud SMTP may be temporarily down (rare)
- Try using port 465 with SSL instead (edit `route.ts`)

### Not receiving emails

- Check your spam folder
- Verify the email in `.env.local` matches your iCloud custom domain
- Check iCloud Mail settings at icloud.com

## Production Deployment (Vercel)

When deploying to Vercel:

1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add:
   - `ICLOUD_EMAIL` = `your-email@leobruno.it`
   - `ICLOUD_APP_PASSWORD` = `xxxx-xxxx-xxxx-xxxx`
4. Redeploy your site

## Security Features

✅ **Rate Limiting**: 3 emails per hour per IP address  
✅ **Input Validation**: 10-10,000 character limit  
✅ **Error Handling**: Graceful failure with user feedback  
✅ **Environment Variables**: Credentials never exposed to client

## How It Works

1. User submits message via sidebar form
2. Frontend calls `/api/contact` endpoint
3. API validates message and checks rate limit
4. Nodemailer sends email via iCloud SMTP (`smtp.mail.me.com:587`)
5. You receive the message at your `@leobruno.it` address
6. User sees "Sent!" confirmation

---

**No domain verification needed** - this works with your existing iCloud+ Custom Email Domain setup!
