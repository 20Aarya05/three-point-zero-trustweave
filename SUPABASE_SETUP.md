# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Sign in
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - **Name**: `trustweave-backend` (or your preferred name)
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
6. Click "Create new project"

## Step 2: Get Your Credentials

Once your project is created:

1. Go to **Settings** → **API**
2. Copy the following values:

```
Project URL: https://your-project-id.supabase.co
anon public key: eyJ... (starts with eyJ)
service_role secret: eyJ... (starts with eyJ, different from anon)
```

## Step 3: Configure Environment Variables

Create a `.env` file in your project root:

```bash
cp .env.example .env
```

Update the `.env` file with your Supabase credentials:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the contents of `database/schema.sql`
4. Click "Run" to execute the schema

## Step 5: Test Your Connection

Run the connection test:

```bash
npm run test:supabase
```

You should see output like:
```
🔍 Testing Supabase Connection...

📋 Environment Variables:
   SUPABASE_URL: ✅ Set
   SUPABASE_ANON_KEY: ✅ Set
   SUPABASE_SERVICE_ROLE_KEY: ✅ Set

🔐 Testing Service Role Connection...
✅ Service role connection successful!

🔓 Testing Anonymous Key Connection...
✅ Anonymous key connected (access restricted as expected).

📊 Testing Database Schema...
✅ "evaluations" table exists

🧪 Testing Write Permissions...
✅ Write permissions working
✅ Cleanup successful

🎉 Supabase connection test completed!
```

## Troubleshooting

### Common Issues:

1. **"Missing required environment variables"**
   - Check that your `.env` file exists
   - Verify all three Supabase variables are set
   - Make sure there are no extra spaces or quotes

2. **"evaluations table not found"**
   - Run the SQL schema from `database/schema.sql`
   - Check that the SQL executed without errors

3. **"Connection failed"**
   - Verify your Supabase URL is correct
   - Check that your service role key is correct (not the anon key)
   - Ensure your Supabase project is active

4. **"Write test failed"**
   - Check Row Level Security (RLS) policies
   - Verify service role permissions
   - Make sure the table was created properly

### Manual Connection Test

You can also test the connection manually in your Supabase dashboard:

1. Go to **Table Editor**
2. You should see the `evaluations` table
3. Try inserting a test row manually

### Environment Variable Check

Double-check your environment variables:

```bash
# In your terminal, run:
node -e "require('dotenv').config(); console.log('URL:', !!process.env.SUPABASE_URL); console.log('ANON:', !!process.env.SUPABASE_ANON_KEY); console.log('SERVICE:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);"
```

Should output:
```
URL: true
ANON: true
SERVICE: true
```

## Security Notes

- **Never commit your `.env` file** to version control
- The **service role key** has admin privileges - keep it secure
- The **anon key** is safe to use in frontend applications
- Consider using environment-specific projects (dev/staging/prod)

## Next Steps

Once your connection test passes:

1. Start your development server: `npm run dev`
2. Test the API health endpoint: `GET http://localhost:3001/health`
3. The database connection status will be shown in the health response