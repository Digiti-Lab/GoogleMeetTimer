// content.js

const socket = io.connect('https://timer.digitilab.it');

// Interval functions
const checkCallOn = () => {
    let menu = document.getElementsByClassName('Jrb8ue')
    if (menu.length > 0) { // If the menu exists we are in a call
        clearInterval(intervalId) // Stop the loop
        checkCallOffInterval = setInterval(checkCallOff, 1000)

        let meetingIdNode = document.getElementsByClassName('SSPGKf p2ZbV')
        if (meetingIdNode.length) {
            let meetingId = meetingIdNode[0].getAttribute('data-unresolved-meeting-id')
            if (meetingId) {
                if (socket.connected) {
                    socket.emit('new_meet', {id: meetingId});
                } else {
                    socket.on('connect', () => {
                        console.log('now connected')
                        socket.emit('new_meet', {id: meetingId});
                    }); 
                }
                
                main(meetingId)
            } else {
                console.log('[google-timer] Error: Unable to get meeting id')
            }
        } else {
            console.log('[google-timer] Error: Unable to get meeting id')
        }        
    }    
}

const checkCallOff = () => {
    let menu = document.getElementsByClassName('Jrb8ue')
    if (!menu.length) {
        console.log('[google-timer] Call off')
        socket.close() // End the websocket
        clearInterval(checkCallOffInterval)
        clearInterval(timerInterval)
        timerInterval = null
        displayTimer(false)
    }
}


const displayTimer = (bool) => {   
    if (bool) {
        document.getElementById('google-timer').style.display = 'block'
    } else {
        document.getElementById('google-timer').style.display = 'none'
    }    
}

var intervalId = setInterval(checkCallOn, 250) // Start a loop until a call is entered
var checkCallOffInterval = null
var timerInterval = null
var timeSet = null


const main = (meetingId) => {
    console.log('script on')

    document.body.insertAdjacentHTML('beforeend', style);
    document.body.insertAdjacentHTML('beforeend', timerHtml)

    chrome.storage.local.get(['seconds'], function(result) {
        if (result.seconds) {
            timer(result.seconds)
        } else {
            document.getElementById('time').innerHTML = "Non impostato"
            setTimeout(() => !timer && displayTimer(false), 120000) // Disappear after 2 minutes
        }
    });

    socket.on('update_time', (newTime) => {
        let timeRemaining = Math.round((newTime - Date.now()) /1000)
        if (timeRemaining > 0) {
            clearInterval(timerInterval)
            timerInterval = null
            timer(timeRemaining)
        } else if (timeRemaining > 0) { // remove in production
            console.log('too late')
        }
    })

    chrome.storage.onChanged.addListener(function(changes) {
        if (changes.seconds) {
            clearInterval(timerInterval)
            timerInterval = null
            if (changes.seconds.newValue != 0) {                
                if (document.getElementById('timer-banner')) {
                    document.getElementById('timer-banner').outerHTML = ""
                }
                if (socket.connected) {
                    socket.emit('sync_time', {id: meetingId, endTime: Date.now() + changes.seconds.newValue*1000})
                } else {
                    console.warn('[google-timer] Unable to sync time')
                }
                                                
                timer(changes.seconds.newValue)
            } else {
                document.getElementById('time').innerHTML = "Non impostato"
                setTimeout(() => !timerInterval && displayTimer(false), 60000)
            } 
        }   
    });
}

const timer = (seconds) => {    
    displayTimer(true)    
    setTimer(seconds)
    timerInterval = setInterval(function(){        
        seconds--;
        setTimer(seconds)
        if (seconds < 0) {
            clearInterval(timerInterval);
            timerInterval = null
            let parent = document.getElementsByClassName('o6gIdf zCbbgf')
            if (parent.length) {
                parent = parent[0]
                const messageNode = document.createElement('div')
                messageNode.setAttribute("style", "position: relative")
                messageNode.innerHTML = message
                parent.append(messageNode)
                document.getElementById('timer-banner-button').addEventListener("click", () => document.getElementById('timer-banner').outerHTML = "")
            } else {
                console.log('[google-timer] Error: unable to show the finish message (no element by class)')
            }        
        }
    }, 1000);
}

const setTimer = (seconds) => {
    if (seconds >= 0) {
        let hh = zeroFill(Math.floor(seconds / 3600))
        let mm = zeroFill(Math.floor(seconds / 60) % 60)
        let ss = zeroFill(Math.floor((seconds % 60)))
    
        if (hh > 0) {
            document.getElementById('time').innerHTML = `${hh}:${mm}`
        } else {
            document.getElementById('time').innerHTML = `${mm}:${ss}`
        }

        let textStyle = getComputedStyle(document.getElementById('time')).color 
        if (seconds <= 120 && textStyle == "rgb(95, 99, 104)") {
            document.getElementById('time').style.color = "#d93025"
        } else if (seconds >= 120 && textStyle !== "rgb(95, 99, 104)") {
            document.getElementById('time').style.color = "#5f6368"
        }
    }    
}

const zeroFill = (n) => {
    return ('0'+n).slice(-2)
}
//#d93025
const timerHtml = `
<div class="timer-app-container">
    <div class="timer-body" id="google-timer" style="display: none;">
    <p class="timer-digits text" id="time"></p>
    </div>
</div>
`
const style = `
<style>
.timer-body {
    background-color: white; 
    width: fit-content;
    border-radius: 0 0 8px 8px;
    padding: 0 20px 0 20px;
    text-align: center;
    height: fit-content;
    top: 0;
    /*left: 0;*/
    position: absolute;
    z-index: 1;
    height: 48px;
}
.text {
    color: white;
}
.timer-title {
    font-size: 15px;
    margin: 0;
    opacity: 80%;
}
.timer-digits {
    font-feature-settings: "tnum";
    font-variant-numeric: tabular-nums;
    font-size: 30px;
    color: #5f6368;
    margin: 5px 0 0 0;
}
#timer-banner {
    left: -110px;
    top: -165px;
}
.timer-app-container {
    display: flex;
    justify-content: center;
}
</style>
`

const message = `
<div class="MvD9Jd ncMv2e timer-banner" id="timer-banner" role="alert" aria-label="Stai parlando? Il microfono è disattivato.">
    <div class="dj3AKc">
        <p class="McXdrf">Il timer è scaduto! Vuoi chiudere la chiamata?</p>
    </div>
    <div role="button" id="timer-banner-button" class="uArJ5e Y5FYJe cjq2Db HZJnJ L8jh1" aria-label="Chiudi" aria-disabled="false" tabindex="0" data-tooltip="Chiudi" data-tooltip-vertical-offset="-12" data-tooltip-horizontal-offset="0">
        <div class="PDXc1b MbhUzd" jsname="ksKsZd"></div><span jsslot="" class="XuQwKc"><span class="GmuOkf"><span class="DPvwYc tEYUvc" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" focusable="false" class="CEJND cIGbvc NMm5M"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg></span></span>
        </span>
    </div>
    <div class="QSW55" jsname="nMj4jb" style="left: 125px;"></div>
</div>
`