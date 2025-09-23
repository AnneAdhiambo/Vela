# Admin Commands Reference

Quick reference for managing admin users in the Vela landing page.

## 📋 Available Commands

### Create Admin User
```bash
npm run admin:create -- --email admin@example.com --password mypassword
```

### List All Admin Users
```bash
npm run admin:list
```

### Delete Admin User
```bash
npm run admin:delete -- --email admin@example.com
```

## 🔧 Manual Setup

If you prefer to create admin users manually, you can run the script directly:

```bash
# Create admin user
node scripts/create-admin.js create --email admin@example.com --password mypassword

# List admin users
node scripts/create-admin.js list

# Delete admin user
node scripts/create-admin.js delete --email admin@example.com
```

## 🔐 Password Security

- Passwords are hashed using a simple base64 encoding with salt
- For production, consider implementing bcrypt for better security
- Admin passwords are stored in the `admin_users` table

## 🚨 Important Notes

- Make sure your Supabase environment variables are set correctly
- The service role key is required for admin operations
- Admin users can access the `/admin` dashboard
- Each admin user needs a unique email address

## 🐛 Troubleshooting

### "fetch failed" Error
- Check if `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Verify your Supabase URL is correct
- Ensure the `admin_users` table exists

### "Admin user not found" Error
- Verify the email address is correct
- Check if the user exists using `npm run admin:list`
- Ensure the password is correct

### Permission Denied
- Verify the service role key has proper permissions
- Check RLS policies on the `admin_users` table
- Ensure the key is not expired
