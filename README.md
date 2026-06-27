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
- **🔐 Secure Authentication:** Robust user sign-up and sign-in using Email/Password and Google OAuth. Includes password recovery.
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
- **Utilities:**
  - `bcryptjs` for client-side password hashing.

---

## 🔑 Admin Access

To access the administrative dashboard:

1.  Navigate to the registration page.
2.  Fill out the registration form.
3.  Click on the "Are you a staff member? Register here →" link.
4.  Enter the `VITE_ADMIN_INVITE_CODE` you set in your `.env` file.
5.  Complete the registration.
6.  Log in with your new admin credentials. The "My Dashboard" button will now be an "Admin Portal" button.

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

## 🔗 Firebase Data Connect

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
