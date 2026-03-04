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
  // ⬇️ Replace these with your Firebase project credentials
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  databaseURL: 'https://YOUR_PROJECT-default-rtdb.firebaseio.com',
  projectId: 'YOUR_PROJECT',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID'
}

/**
 * Check if Firebase is configured (not placeholder values)
 */
export const isFirebaseConfigured =
  firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
  firebaseConfig.projectId !== 'YOUR_PROJECT'

let app = null
let db = null

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig)
  db = getDatabase(app)
}

export { db }
export default app
