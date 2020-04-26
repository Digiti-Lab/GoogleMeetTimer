// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyBsL1AcbuPuycSdJSnFKqgacx0kqX5-1eU",
    authDomain: "meet-timer.firebaseapp.com",
    databaseURL: "https://meet-timer.firebaseio.com",
    projectId: "meet-timer",
    storageBucket: "meet-timer.appspot.com",
    messagingSenderId: "123125780297",
    appId: "1:123125780297:web:800c10c827bd4c6c8a5498"
  };
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the database service
var db = firebase.database();
var newPostKey = 'vxp-wrrd-upo'
console.log(newPostKey)

function writeUserData() {
    db.ref('meet-id/' + newPostKey).set({
      time: 12345,
      startTime: 12345
    });
  }  

writeUserData()
console.log('ok')