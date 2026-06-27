importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  "projectId": "gen-lang-client-0898605785",
  "appId": "1:1098191553409:web:3693c50698c2fc0c9a9e80",
  "apiKey": "AIzaSyDW6M_c8-2ThHuA-SYCdcd_qiWLuoFKXu8",
  "authDomain": "gen-lang-client-0898605785.firebaseapp.com",
  "storageBucket": "gen-lang-client-0898605785.firebasestorage.app",
  "messagingSenderId": "1098191553409",
  "measurementId": ""
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'Nova Notificação';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/vite.svg',
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
