/**
 * Firebase Configuration for Visitor Tracking
 *
 * 📋 Setup Steps:
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a new project (or use existing)
 * 3. Go to Project Settings → General → Your apps → Add Web App
 * 4. Copy the config values below
 * 5. Go to Realtime Database → Create Database → Start in test mode
 * 6. Set the following security rules to allow anonymous writes:
 *
 *    {
 *      "rules": {
 *        "visitors": {
 *          ".read": true,
 *          ".write": true,
 *          "$visitorId": {
 *            ".validate": "newData.hasChildren(['lat', 'lon', 'country', 'timestamp'])"
 *          }
 *        }
 *      }
 *    }
 *
 * 7. Replace the placeholder values below with your real config
 */

import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyBbHRLDC8JH1rKJqDdL89Szac_Df6pB1So",
  authDomain: "mobius-f1994.firebaseapp.com",
  databaseURL: "https://mobius-f1994-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mobius-f1994",
  storageBucket: "mobius-f1994.firebasestorage.app",
  messagingSenderId: "347182841628",
  appId: "1:347182841628:web:4c8daca942d279f009c4d9",
  measurementId: "G-PXE89LH28H"
};


/**
 * Check if Firebase is configured (not placeholder values)
 */
export const isFirebaseConfigured =
  firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
  firebaseConfig.projectId !== 'YOUR_PROJECT'

let app = null
let db = null
let analytics = null

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig)
  db = getDatabase(app)
}

export { db }
export default app
