const syncTime = (seconds) => {
    chrome.runtime.sendMessage({type: 'updateValue', opts: {endTime: Date.now() + seconds*1000}});
}

// content.js
const checkCallOn = () => {
    let menu = document.getElementsByClassName('Jrb8ue')
    if (menu.length > 0) { // If the menu exists we are in a call
        clearInterval(intervalId) // Stop the loop
        checkCallOffInterval = setInterval(checkCallOff, 1000)

        let meetingIdNode = document.getElementsByClassName('SSPGKf p2ZbV')
        if (meetingIdNode.length) {
            let meetingId = meetingIdNode[0].getAttribute('data-unresolved-meeting-id')
            if (meetingId) {
                chrome.runtime.sendMessage({type: 'startDatabase', opts: {meetingId}}, (response) => {
                    if(response === 'started' | response === "already_running") {
                        main() // Call the main function
                    }
                });                
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
        clearInterval(checkCallOffInterval)
        clearInterval(timerInterval)
        timerInterval = null
        timerNode.style.display = 'none'
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

const main = () => {
    console.log('script on')

    document.body.insertAdjacentHTML('beforeend', style);
    document.body.insertAdjacentHTML('beforeend', timerHtml)

   /* Could be used to develop a pause function
    timerNode.addEventListener('click', () => {
        sessionStorage.setItem('seconds', 'value');
    })*/
    chrome.storage.local.get(['endTime', 'seconds'], function(result) {
        let timeRemaining = Math.round((result.endTime - Date.now()) /1000)
        if (timeRemaining > 0) {
            timer(timeRemaining)
        } else if (result.seconds) {
            timer(result.seconds)
        } else {
            document.getElementById('time').innerHTML = "Non impostato"
            setTimeout(() => !timer && displayTimer(false), 120000) // Disappear after 2 minutes
        }
    });

    chrome.storage.onChanged.addListener(function(changes) {
        if (changes.seconds) {
            if (timerInterval) {
                clearInterval(timerInterval)
                timerInterval = null
            }
            if (changes.seconds.newValue != 0) {                
                if (document.getElementById('timer-banner')) {
                    document.getElementById('timer-banner').outerHTML = ""
                }
                syncTime(changes.seconds.newValue)                                
                timer(changes.seconds.newValue)
            } else {
                document.getElementById('time').innerHTML = "Non impostato"
                setTimeout(() => !timerInterval && displayTimer(false), 60000)
            } 
        } else if (changes.endTime) {
            let timeRemaining = Math.round((changes.endTime.newValue - Date.now()) /1000)
            if (changes.endTime.newValue !== changes.endTime.oldValue && timeRemaining > 0) {
                console.log('time synced')
                clearInterval(timerInterval)
                timer(timeRemaining)
            } else if (timeRemaining > 0) { // remove in production
                console.log('too late')
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
    }    
}

const zeroFill = (n) => {
    return ('0'+n).slice(-2)
}

const timerHtml = `
<div class="timer-body MCcOAc" id="google-timer" style="display: none;">
    <h3 class="text timer-title">Tempo Rimanente:</h3>
    <div class="timer-container">
        <span class="timer-digits text" id="time"></span>
    </div>
</div>
`
const style = `
<style>
.timer-body {
    background-color: black; 
    width: fit-content;
    padding: 5px 25px 5px 25px;
    text-align: center;
    border-radius: 5px;
    height: fit-content;
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
    color: #3e4dec;
}
#timer-banner {
    left: -110px;
    top: -165px;
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