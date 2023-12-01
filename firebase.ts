import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

import 'firebase/firestore'
const firebaseConfig = {
  apiKey: 'AIzaSyCtO2KpJ-4qle3vlsFN9RbJX-5nZguFkYg',
  projectId:'weswipe-ee470',
  storageBucket: 'weswipe-ee470.appspot.com',
  


   
  }
const app = initializeApp(firebaseConfig);






export const db = getFirestore(app);

