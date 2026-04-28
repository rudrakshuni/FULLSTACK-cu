# Curator 📚

A personal intellectual sanctuary for avid readers. Curator helps you track your reading journey, manage your book library, save memorable quotes, and set reading goals — all in a beautifully minimal interface.

## Features

- **Library Management** — Add books by searching or manually, track reading status (want to read, currently reading, finished)
- **Reading Progress** — Log pages read and track completion percentage for each book
- **Quote Collection** — Save and organize memorable quotes from your books
- **Reading Goals** — Set weekly, monthly, and yearly reading goals with progress tracking
- **Dashboard** — Get an overview of your reading stats and recent activity
- **Guest Mode** — Try the app without signing in, with data saved locally
- **Google Auth** — Sign in with Google to sync your data across devices via Firebase

## Tech Stack

- **Frontend** — React 19, TypeScript, Vite
- **Styling** — Tailwind CSS
- **Animation** — Motion (Framer Motion)
- **Backend** — Firebase (Firestore + Authentication)
- **Native** — Capacitor 8 (Android APK support)
- **Icons** — Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project with Firestore and Google Auth enabled

### Installation

Clone the repo and install dependencies:

    git clone https://github.com/YOUR_USERNAME/curator.git
    cd curator
    npm install

### Environment Setup

Copy `.env.example` to `.env` and fill in your Firebase config:

    cp .env.example .env

### Development

    npm run dev

### Build

    npm run build

### Android APK

    npm run build
    npx cap sync android
    npx cap open android

Then build the APK from Android Studio.

## Project Structure

    src/
    ├── components/
    │   └── screens/
    │       ├── Dashboard.tsx
    │       ├── Library.tsx
    │       ├── AddBook.tsx
    │       ├── Quotes.tsx
    │       └── Profile.tsx
    ├── lib/
    ├── types/
    ├── App.tsx
    ├── firebase.ts
    └── main.tsx

## Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore and Google Authentication
3. Add your Firebase config to `.env`
4. Deploy Firestore rules: `firebase deploy --only firestore:rules`

## License

MIT

---

Made with 🤍 by PulseEinher