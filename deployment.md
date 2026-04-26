# NovaEdge Digital Labs: Deployment & Admin Guide

This guide provides instructions on how to perform over-the-air (OTA) "hot builds" for the mobile application and how to access the centralized Admin Panel.

## 1. Hot Builds (EAS Update)

If you have made small changes (e.g., bug fixes, UI tweaks) and want to deploy them without requiring users to download a new version from the Play Store/App Store, use **EAS Update**.

### Prerequisites
- Install EAS CLI: `npm install -g eas-cli`
- Login to your Expo account: `npx eas login`

### Steps to Deploy
1.  Navigate to the `frontend` directory.
2.  Ensure your changes are committed to Git.
3.  Run the update command:
    ```bash
    npx eas update --branch main --message "DESCRIBE_YOUR_CHANGES"
    ```
4.  The next time users open the app, it will automatically download and apply the update in the background.

---

## 2. Admin Panel Access

The Admin Panel allows you to view system statistics and manage users across the NovaEdge ecosystem.

### Prerequisites
To access the admin panel, your account must satisfy **one** of the following:
- Your email must match the `ADMIN_EMAIL` set in the backend `.env` (Default: `novaedgedigitallabs@gmail.com`).
- Your user record in the database must have `role: "admin"`.

### Accessing the Dashboard
1.  **URL**:
    - **Development**: [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard)
    - **Production**: Navigate to the subdomain configured for your Next.js frontend (e.g., `admin.novaedgedigital.labs`).
2.  **Steps**:
    - Open the frontend application (Next.js).
    - Login with your Admin credentials.
    - If you are not automatically redirected, manually navigate to `/admin/dashboard`.

### Admin Capabilities
- **Stats Dashboard**: View totals for users, payments, and active leads.
- **User Management**: View and update user roles and permissions.

---

## 3. Backend Deployment

The backend is configured for deployment on platforms like **Render** or **Vercel** (via `render.yaml`).

### Key Environment Variables
Ensure these are set in your production environment:
- `MONGO_URI`: Your production MongoDB connection string.
- `JWT_SECRET`: A strong, unique secret key.
- `ADMIN_EMAIL`: The email address that has default admin access.
- `CLOUDINARY_URL`: For media management (if used).
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`: For payments.
