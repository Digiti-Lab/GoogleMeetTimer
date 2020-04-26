chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'meet.google.com'},
      })
      ],
          actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

// this file will run once on extension load
var config = {
  apiKey: "AIzaSyBsL1AcbuPuycSdJSnFKqgacx0kqX5-1eU",
  authDomain: "meet-timer.firebaseapp.com",
  databaseURL: "https://meet-timer.firebaseio.com",
  projectId: "meet-timer",
  storageBucket: "meet-timer.appspot.com",
  messagingSenderId: "123125780297",
  appId: "1:123125780297:web:800c10c827bd4c6c8a5498"
};

var isRunning = false

const startDatabase = (meetingId) => {
  const app = firebase.initializeApp(config);
  const appDb = app.database().ref('meet-id/' + meetingId);
  
  
  // instantiate global application state object for Chrome Storage and feed in firebase data
  // Chrome Storage will store our global state as a a JSON stringified value.
  
  const applicationState = { values: [] };
  
  appDb.on('child_added', snapshot => {
    updateState(snapshot.key, snapshot.val());
  });
  /*
  appDb.on('child_removed', snapshot => {
    delete applicationState.values[snapshot.key]
    updateState(applicationState);
  });*/
  
  appDb.on('child_changed', snapshot => {
    updateState(snapshot.key, snapshot.val());
  });
  
  // updateState is a function that writes the changes to Chrome Storage
  function updateState(key, value) {
    console.log(key, value)
    chrome.storage.local.set({ [key]: value });
  }
  
  // getChildIndex will return the matching element in the object
  function getChildIndex(appState, id) {
    return appState.values.findIndex(element => element.id == id)
  }
  
  // if your Chrome Extension requires any content scripts that will manipulate data,
  // add a message listener here to access appDb:
  
  chrome.runtime.onMessage.addListener((msg, sender, response) => {
    console.log(msg.opts)
    switch (msg.type) {
      case 'updateValue':
        appDb.set({ startTime: msg.opts.startTime, time: msg.opts.time });
        response('success');
        break;  
      default:
        response('unknown request');
        break;
    }
  });
}

chrome.runtime.onMessage.addListener((msg, sender, response) => {
  console.log(msg)
  if (msg.type === "startDatabase" && isRunning === false && msg.opts.meetingId) {
    console.log('started')
    startDatabase(msg.opts.meetingId)
    response('started');
  } else {
    console.log('error')
    response('error')
  }
});