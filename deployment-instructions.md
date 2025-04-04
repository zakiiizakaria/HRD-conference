# Deployment Instructions for HRD Conference Sponsorship Form

## Files to Upload to Hostinger

1. **store-sponsorship.php**
   - Upload to: `public_html/` or the root directory of your Hostinger website
   - This file handles the database connection and form submission storage

2. **assets/js/form-handler.js**
   - Upload to: `public_html/assets/js/` on your Hostinger website
   - This file contains the JavaScript code that submits the form data to the PHP script

## Important Configuration Notes

1. **Database Connection**
   - The PHP script is configured to use your Hostinger database:
     - Host: `localhost`
     - Database: `u197368543_hrd_db`
     - Username: `u197368543_localhost`
     - Password: `Hrd_conference2025`
   - The `$isLocalEnvironment` flag is set to `false` to use production settings

2. **Form Submission URL**
   - The JavaScript code dynamically determines whether to use the local or production URL
   - In production, it will use: `https://hrdconference.com/store-sponsorship.php`

## Verifying the Setup

1. **Test the Form**
   - After uploading the files, fill out the sponsorship form on your live website
   - Submit the form and check if it's successful
   - Look for any error messages in the browser console (F12 > Console)

2. **Database Verification**
   - Log in to your Hostinger phpMyAdmin
   - Check if the `sponsorship_inquiries` table exists and contains the submitted data
   - The table will be created automatically on the first successful form submission

## Troubleshooting

If you encounter issues after deployment:

1. **404 Error (File Not Found)**
   - Verify that the PHP file is in the correct location on your server
   - Check the URL path in the JavaScript fetch request
   - Ensure the path matches your server's directory structure

2. **Database Connection Errors**
   - Verify your database credentials in the PHP file
   - Check if the database user has the necessary permissions
   - Try connecting to the database using phpMyAdmin with the same credentials

3. **CORS Issues**
   - The PHP script includes headers to handle CORS
   - If you're still seeing CORS errors, check your server configuration
   - You might need to add additional headers in your .htaccess file

## Re-enabling EmailJS (Future)

When you're ready to re-enable EmailJS functionality:

1. Uncomment the EmailJS code in `form-handler.js`
2. Update the EmailJS service ID, template ID, and user ID
3. Test the form to ensure both database storage and email sending work correctly

## Security Recommendations

- Consider using environment variables for database credentials
- Implement input validation and sanitization
- Set up proper error logging
- Consider adding CAPTCHA to prevent spam submissions
- Change the database password regularly for security
