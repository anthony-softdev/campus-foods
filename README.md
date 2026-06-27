# 🍔 Campus Foods - University Food Delivery App

<div align="center">
  <p>
    <strong>Fueling Campus Life, One Meal at a Time.</strong>
  </p>
  <p>
    A modern, feature-rich food ordering and delivery platform designed specifically for university students. Built with React, TypeScript, Firebase, and Tailwind CSS.
  </p>
</div>

<br />

<div align="center">
  <a href="https://ai.studio/apps/7f5c84bd-f320-4dee-ac3f-29d65bbceb40" target="_blank" rel="noopener noreferrer">
    <img src="https://i.imgur.com/n2eswjz.png" alt="Campus Foods App Screenshot" width="800">
  </a>
</div>

<br />

## ✨ Key Features

- **🛍️ Student Ordering Flow:** Browse a dynamic menu, add items to the cart, and place orders seamlessly.
- **✍️ Inline Customization:** Edit meal options directly within the cart for a personalized experience.
- **🔐 Secure Authentication:** Robust user sign-up and sign-in using Google OAuth for a seamless and secure experience.
- **👤 User Dashboard:** Registered students can view their order history and track the status of current orders.
- **⚙️ Admin Command Centre:** A comprehensive portal for restaurant staff.
  - **📊 Live Analytics:** View key metrics like total sales, pending orders, and popular items.
  - **📦 Order Management:** Track incoming orders in real-time and update their status (e.g., Placed, Cooking, Out for Delivery, Delivered).
  - **📝 Menu Catalog Management:** Add, edit, delete, and manage stock for all food items and their customizable options.
- **💳 Flexible Payments:** Supports Cash on Delivery, Bank Transfer (with receipt upload), and a placeholder for Card Payments.
- **📱 Responsive Design:** Fully responsive UI/UX for both desktop and mobile devices, built with Tailwind CSS.
- **🔥 Real-time Updates:** Leverages Firebase Firestore for live updates on orders and menu items.

---

## 🛠️ Tech Stack

- **Frontend:**
  - React
  - TypeScript
  - Vite
  - Tailwind CSS
  - Framer Motion for animations
  - Lucide React for icons
- **Backend & Database:**
  - Firebase
    - **Firestore:** Real-time NoSQL database for orders, users, and menu items.
    - **Firebase Authentication:** For user management and secure login.
    - **Firebase Data Connect:** (Setup included) For type-safe data access between your app and backend.

---

## 🔑 Admin Access

Admin accounts are managed through the Admin Dashboard. The flow is as follows:

1.  **Initial Admin:** The first admin account must be created manually in the Firebase Console.
    - Go to your Firestore `users` collection.
    - Create a new document for the admin user (or edit an existing one).
    - Set the `email` field to the admin's email and ensure the `role` field is set to `"admin"`.
2.  **Register as a Student:** All subsequent staff members should first register a normal student account through the app's registration page.
3.  **Promote to Admin:** An existing admin can then log in, go to the **Admin Dashboard**, navigate to the **User Management** tab, find the new user, and change their role from "student" to "admin".
4.  The promoted user will have admin access on their next login.

---

## 📂 Project Structure

A brief overview of the key directories and files:

```
campus-foods/
├── public/
├── src/
│   ├── components/       # Main React components (AdminView, CartView, Navbar, etc.)
│   ├── data/             # Static data (e.g., hostel locations)
│   ├── dataconnect-generated/ # Auto-generated Firebase Data Connect SDK
│   ├── firebase.ts       # Firebase initialization and helper functions
│   ├── types.ts          # Core TypeScript types and interfaces
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── .env                  # Environment variables (you need to create this)
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- A package manager like `pnpm`, `npm`, or `yarn`

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/anthony-softdev/campus-foods.git
    cd campus-foods
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install # or npm install / yarn install
    ```

3.  **Set up Environment Variables:**
    - Create a `.env` file in the project root by copying the contents of `.env.example`.
    - **Client-side keys:** Fill in your Firebase project's web app configuration (the variables prefixed with `VITE_`). You can find these in your Firebase project settings.
    - **Admin SDK keys:** For backend development (e.g., Firebase Functions), you'll need service account credentials.
      1.  In the Firebase console, go to **Project settings > Service accounts**.
      2.  Click **Generate new private key**. This will download a JSON file.
      3.  Copy the `project_id`, `private_key`, and `client_email` values from this file into your `.env` file.
      4.  **Important:** Keep the downloaded JSON file safe and do not commit it.

## � Firebase Data Connect

This project is configured to use **Firebase Data Connect**, a type-safe GraphQL-based data access layer. The generated SDK and documentation can be found in the `src/dataconnect-generated` directory.

- For the vanilla JS/TS SDK, see `src/dataconnect-generated/README.md`.
- For the React Hooks SDK, see `src/dataconnect-generated/react/README.md`.

This allows for strongly-typed, efficient, and secure communication with the Firestore database.

---

<div align="center">
  <p>
    Made with ❤️ for Nigerian University Students.
  </p>
</div>
