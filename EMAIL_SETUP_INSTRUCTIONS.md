# How to Enable Real Email Sending (Gmail)

To make the UrbanGlow system send **actual emails** to your inbox instead of showing a simulated link, follow these steps:

1.  **Open `.env` File**:
    Located in `urban_glow/server/.env`.

2.  **Get a Gmail App Password**:
    *   Go to your [Google Account Security page](https://myaccount.google.com/security).
    *   Enable **2-Step Verification** (if not already on).
    *   Search for **"App Passwords"** in the search bar at the top.
    *   Create a new App Password (name it "UrbanGlow").
    *   Copy the 16-character password it gives you.

3.  **Update `.env`**:
    Uncomment (remove `#`) the last two lines and fill in your details:

    ```env
    EMAIL_USER=your-actual-email@gmail.com
    EMAIL_PASS=paste-your-16-digit-password-here
    ```

4.  **Restart Server**:
    Stop the server (Ctrl+C) and run `node server/index.js` again.

Now, when you request a password reset, the OTP will be sent directly to `your-actual-email@gmail.com`!
