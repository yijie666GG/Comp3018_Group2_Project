# Comp3018_Group2_Project
COMP3018 Group Project - AI Tax Organiser

# Smart Expense Tracker Assistant

**COMP3018 – Group 2**

Smart Expense Tracker Assistant is a React Native / Expo mobile application designed to help users manage receipts and tax-related expenses throughout the financial year.

The application allows users to scan or upload receipts, extract receipt information using OCR, review and edit receipt details, categorise expenses, organise receipts by financial year, view expense summaries and export data.

## Main Features

- Email and password registration/login
- Google Sign-In
- Forgot password and logout
- Persistent authentication
- Receipt capture using camera
- Receipt upload from gallery
- OCR receipt processing
- Receipt Review and editing
- Expense categories
- Financial-year management
- Home receipt history
- Summary dashboard
- CSV export
- Local receipt-image storage
- Personal information settings
- Notifications and financial-year reminders
- Light, dark and system themes
- Account deletion

## Technology Stack

### Mobile
- React Native
- Expo
- Expo Router
- Firebase Authentication
- Cloud Firestore
- Expo FileSystem
- Expo Notifications
- Google Sign-In

### Backend
- Node.js
- Express.js
- TypeScript
- Tesseract.js OCR
- Sharp image processing

---

# Requirements

Before running the project on a new computer, install:

- Node.js 20.9 or later
- npm
- Git
- Java JDK 17
- Android Studio
- Android SDK
- Android Emulator

VS Code is recommended but not required.

---

# Download the Project

Clone the repository:

```bash
git clone https://github.com/yijie666GG/Comp3018_Group2_Project.git
```

Enter the project folder:

```bash
cd Comp3018_Group2_Project
```

Alternatively, extract the supplied project ZIP and open the project folder.

---

# Firebase Configuration

The application uses Firebase Authentication and Cloud Firestore.

Before building the Android application, make sure the Firebase `google-services.json` file is available.

Also make sure the `googleServicesFile` path inside `mobile/app.json` matches the actual location of `google-services.json`.

Do not publicly share replacement Firebase credentials or private configuration files.

---

# Install Backend Dependencies

From the project root:

```bash
cd backend
npm install
```

If you want to install exactly from the existing lock file, you can use:

```bash
npm ci
```

---

# Install Mobile Dependencies

Open another terminal from the project root:

```bash
cd mobile
npm install
```

Or:

```bash
npm ci
```

---

# How to Run the Application

The backend and mobile application need to run at the same time.

## Step 1 – Start the Android Emulator

Open:

**Android Studio → Device Manager**

Start an Android emulator.

A Pixel 7 emulator can be used.

Keep the emulator running.

---

## Step 2 – Start the Backend

Open a terminal from the project root:

```bash
cd backend
npm run dev
```

A successful start should display:

```text
Backend running on port 3000
```

Keep this terminal open while using the application.

---

## Step 3 – Run the Mobile Application

Open a second terminal from the project root:

```bash
cd mobile
npx expo run:android
```

The first Android build may take several minutes.

After the build completes, the application should automatically open in the Android emulator.

---

# Backend Connection

When using the Android emulator, the mobile application connects to the backend using:

```text
http://10.0.2.2:3000
```

The API address is configured in:

```text
mobile/config/api.ts
```

`10.0.2.2` allows the Android emulator to access the development computer's localhost.

If testing on a physical Android device, replace `10.0.2.2` with the local IP address of the computer running the backend.

Example:

```text
http://192.168.1.10:3000
```

The phone and computer must be connected to the same network.

---

# Running the App After the First Build

After the Android development build has already been installed, you can start Expo using:

```bash
cd mobile
npx expo start --dev-client
```

Then press:

```text
a
```

to open the application in the Android emulator.

The backend still needs to be running:

```bash
cd backend
npm run dev
```

---

# Quick Run

For normal development after everything has already been installed:

### Terminal 1

```bash
cd backend
npm run dev
```

### Terminal 2

```bash
cd mobile
npx expo start --dev-client
```

Then press:

```text
a
```

---

# Testing the Application

After starting the application, a basic test flow is:

1. Register a new account or sign in.
2. Scan a receipt using the camera or select one from the gallery.
3. Wait for OCR processing.
4. Review the extracted receipt information.
5. Edit the store, items, categories or financial year if required.
6. Save the receipt.
7. Confirm the receipt appears on the Home page.
8. Open the Summary page.
9. Confirm the correct financial year is selected.
10. Check the expense totals and receipt information.
11. Test CSV export.
12. Confirm the saved receipt image can be viewed where available.
13. Test account settings, theme and notifications.

---

# Project Structure

```text
Comp3018_Group2_Project/
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   └── services/
│   ├── package.json
│   └── package-lock.json
│
├── mobile/
│   ├── app/
│   ├── firebase/
│   ├── services/
│   ├── config/
│   ├── theme/
│   ├── assets/
│   ├── package.json
│   └── package-lock.json
│
└── README.md
```

## Important Folders

### `mobile/app/`
Contains the application screens and navigation.

### `mobile/firebase/`
Contains Firebase Authentication and Firestore service functions.

### `mobile/services/`
Contains services including receipt storage, receipt-image storage and financial-year reminders.

### `mobile/config/`
Contains API configuration.

### `mobile/theme/`
Contains the application theme configuration.

### `backend/src/routes/`
Contains the backend API routes.

### `backend/src/services/`
Contains OCR processing and receipt parsing services.

---

# Data Storage

## Firebase Authentication

Firebase Authentication is used for:

- Email/password authentication
- Google Sign-In
- User identity
- Password recovery

## Cloud Firestore

User data is stored under the authenticated user's account.

Example:

```text
users/{uid}
├── receipts/{receiptId}
└── categories/{categoryId}
```

Receipt data can include:

```text
userId
store
date
time
total
gst
financialYear
items
createdAt
```

Financial-year and account settings are also associated with the authenticated user.

---

# Receipt Image Storage

Receipt images are stored locally on the device using Expo FileSystem.

The application supports saving, retrieving and deleting receipt images using the receipt ID.

Example:

```text
receipt-images/{receiptId}.jpg
```

Cloud receipt-image storage is not currently implemented.

This means locally stored images may not be available if:

- The application is uninstalled
- Application data is cleared
- The user changes devices

A future version could use services such as Amazon S3 or another cloud storage provider.

---

# Known Limitations / Future Improvements

Possible future improvements include:

- Cloud receipt-image storage
- Improved OCR accuracy across more receipt formats
- Additional Android and iOS device testing
- Further code modularisation
- Production deployment configuration
- Additional automated testing
- Further security-rule review before production release

---

# Troubleshooting

## Backend is not connecting

Check that the backend is running:

```bash
cd backend
npm run dev
```

Then confirm the mobile API configuration uses:

```text
http://10.0.2.2:3000
```

when using the Android emulator.

## Android app does not build

Check that:

- Android Studio is installed
- Android SDK is installed
- An emulator is running
- Java JDK 17 is installed
- Mobile dependencies have been installed
- Firebase configuration is present

Then try again:

```bash
cd mobile
npx expo run:android
```

## Dependencies are missing

Backend:

```bash
cd backend
npm install
```

Mobile:

```bash
cd mobile
npm install
```

---

# Team Members

- Abdullah Alghoraibi
- Saaid Moreno Gonzalez
- Duc Do
- Yijie Li

**Project Sponsor and Academic Supervisor:** Marvis Leung

**Unit:** COMP3018 Professional Experience  
**Western Sydney University**
