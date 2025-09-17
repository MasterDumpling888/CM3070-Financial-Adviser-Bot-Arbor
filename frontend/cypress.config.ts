import { defineConfig } from 'cypress';
import { plugin as cypressFirebasePlugin } from 'cypress-firebase';
import admin from 'firebase-admin';
import serviceAccount from '../backend/serviceAccountKey.json';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000', // Set port where frontend is hosted
    setupNodeEvents(on, config) {
      const adminConfig = {
        credential: admin.credential.cert(serviceAccount),
      };
      try {
        admin.initializeApp(adminConfig);
      } catch (e) {
        console.log('Firebase already initialized');
      }
      return cypressFirebasePlugin(on, config, admin,{
        projectId: 'arbor-fa572',
      });
    },
  },
});