# Supabase Database Setup

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - **Name**: `goia-email-collector`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest to your users
6. Click "Create new project"
7. Wait for the project to be set up (2-3 minutes)

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)
   - **service_role** key (starts with `eyJ`)

## 3. Create the Database Table

1. Go to **Table Editor** in your Supabase dashboard
2. Click **Create a new table**
3. Configure the table:
   - **Name**: `early_adopters`
   - **Description**: `Early access email subscriptions`
4. Add the following columns:

| Column Name | Type | Default Value | Constraints |
|-------------|------|---------------|-------------|
| `id` | `int8` | `auto` | Primary Key, Identity |
| `email` | `text` | - | Not Null, Unique |
| `subscribed_at` | `timestamptz` | `now()` | Not Null |
| `status` | `text` | `'active'` | Not Null |
| `created_at` | `timestamptz` | `now()` | Not Null |
| `updated_at` | `timestamptz` | `now()` | Not Null |

5. Click **Save**

## 4. Set Up Row Level Security (RLS)

1. In the **Table Editor**, click on your `early_adopters` table
2. Go to the **RLS** tab
3. Enable **Row Level Security**
4. Create a new policy:
   - **Name**: `Allow public inserts`
   - **Target roles**: `public`
   - **Operation**: `INSERT`
   - **USING expression**: `true`
   - **WITH CHECK expression**: `true`
5. Click **Save**

## 5. Configure Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Important Security Notes:**
- The `NEXT_PUBLIC_` variables are safe to expose in the browser
- The `SUPABASE_SERVICE_ROLE_KEY` should NEVER be exposed to the client
- Only use the service role key in server-side API routes

## 6. Test the Integration

1. Start your development server: `npm run dev`
2. Go to your landing page
3. Enter an email in the signup form
4. Check your Supabase dashboard:
   - Go to **Table Editor** > `early_adopters`
   - You should see the new email entry

## 7. Optional: Create a View for Analytics

You can create a view to easily see subscription statistics:

```sql
CREATE VIEW subscription_stats AS
SELECT 
  DATE(subscribed_at) as date,
  COUNT(*) as daily_subscriptions,
  COUNT(*) OVER (ORDER BY DATE(subscribed_at)) as total_subscriptions
FROM email_subscriptions
WHERE status = 'active'
GROUP BY DATE(subscribed_at)
ORDER BY date;
```

## Database Schema

```sql
CREATE TABLE early_adopters (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE early_adopters ENABLE ROW LEVEL SECURITY;

-- Create policy for public inserts
CREATE POLICY "Allow public inserts" ON early_adopters
  FOR INSERT TO public
  WITH CHECK (true);
```

## Troubleshooting

### Common Issues:

1. **"Invalid API key"**
   - Check that your environment variables are set correctly
   - Make sure you're using the right keys (anon vs service role)

2. **"Row Level Security policy violation"**
   - Ensure RLS is properly configured
   - Check that the public insert policy exists

3. **"Email already subscribed"**
   - This is expected behavior for duplicate emails
   - The system prevents duplicate subscriptions

4. **"Database insert error"**
   - Check that the table exists and has the correct schema
   - Verify your service role key has the right permissions

## Security Best Practices

- ✅ Use Row Level Security (RLS)
- ✅ Only expose anon key to client-side code
- ✅ Use service role key only in server-side API routes
- ✅ Validate email format on both client and server
- ✅ Prevent duplicate email subscriptions
- ✅ Log subscription attempts for monitoring

## Monitoring

You can monitor your email subscriptions in the Supabase dashboard:
- **Table Editor**: View all subscriptions
- **SQL Editor**: Run custom queries
- **Logs**: Monitor API calls and errors
- **Auth**: Track authentication events (if using Supabase Auth later)
