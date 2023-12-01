"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const app_1 = require("firebase/app");
const firestore_1 = require("firebase/firestore");
require("firebase/firestore");
const firebaseConfig = {
    apiKey: 'AIzaSyCtO2KpJ-4qle3vlsFN9RbJX-5nZguFkYg',
    projectId: 'weswipe-ee470',
    storageBucket: 'weswipe-ee470.appspot.com',
};
const app = (0, app_1.initializeApp)(firebaseConfig);
exports.db = (0, firestore_1.getFirestore)(app);
