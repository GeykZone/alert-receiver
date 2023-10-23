
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCXdeKhNwhrW1qgiNjdvWFWtF2Zk7oSk7w",
    authDomain: "irms-2f0bb.firebaseapp.com",
    databaseURL: "https://irms-2f0bb-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "irms-2f0bb",
    storageBucket: "irms-2f0bb.appspot.com",
    messagingSenderId: "60963607750",
    appId: "1:60963607750:web:90e4d5535cc8e21660f3c7",
    measurementId: "G-J7VTNTWYMT"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
