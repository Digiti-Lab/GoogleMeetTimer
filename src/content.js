chrome.storage.local.get(['startTime', 'time'], function(result) {
    console.log(result)
});



const updateTime = (time) => {
    chrome.runtime.sendMessage({type: 'updateValue', opts: {startTime: Date.now(), time}}, (response) => {
        if(response == 'success') {
          console.log('updated')
        }
    });
}

// content.js
const checkCallOn = () => {
    let menu = document.getElementsByClassName('Jrb8ue')
    if (menu.length > 0) { // If the menu exists we are in a call
        clearInterval(intervalId) // Stop the loop

        let meetingIdNode = document.getElementsByClassName('SSPGKf p2ZbV')
        if (meetingIdNode.length) {
            let meetingId = meetingIdNode[0].getAttribute('data-unresolved-meeting-id')
            if (meetingId) {
                console.log('meeting id', meetingId)
                chrome.runtime.sendMessage({type: 'startDatabase', opts: {meetingId}}, (response) => {
                    if(response == 'started') {
                        main() // Call the main function
                    }
                });
                
            } else {
                console.log('unable to get meeting id')
            }
        }
        
    }
    
}

var intervalId = setInterval(checkCallOn, 250) // Start a loop until a call is entered
var timerId = null
var timerNode = null
var timeSet = null
const main = () => {
    let meetingIdNode = document.getElementsByClassName('SSPGKf p2ZbV')
    if (meetingIdNode.length) {
        let meetingId = meetingIdNode[0].getAttribute('data-unresolved-meeting-id')
        if (meetingId) {
            console.log('meeting id', meetingId)
        } else {
            console.log('unable to get meeting id')
        }
    }

    const s = document.createElement('style')
    s.innerHTML = style
    document.body.append(s)

    timerNode = document.createElement('div')
    timerNode.innerHTML = timerHtml
    document.body.append(timerNode);

   /* Could be used to develop a pause function
    timerNode.addEventListener('click', () => {
        sessionStorage.setItem('seconds', 'value');
    })*/

    chrome.storage.sync.get(['seconds'], function(result) {
        if (result.seconds) {
            updateTime(result.seconds)
            timer(result.seconds)
        } else {
            document.getElementById('time').innerHTML = "Non impostato"
            setTimeout(() => timerNode.style.display = 'none', 60000)
        }
    });

    chrome.storage.onChanged.addListener(function(changes) {
        console.log(changes)
        if (changes.time) {
            if (changes.time.newValue !== timeSet) {
                chrome.storage.local.get(['startTime'], function(result) {

                    let timeRemaining = changes.time.newValue - Math.round((Date.now() - result.startTime) /1000)
                    console.log(timeRemaining)
                    if (timeRemaining > 0) {
                        clearInterval(timerId)
                        timerId = null
                        timer(timeRemaining)
                    } else {
                        console.log('too late')
                    } 
                });                               
            } else {
                console.log('I was the sender')
            }
        }    
    });

    chrome.storage.onChanged.addListener(function(changes) {
        if (changes.seconds) {
            if (timerId) {
                clearInterval(timerId)
                timerId = null
            }
            if (changes.seconds.newValue != 0) {                
                if (document.getElementById('timer-banner')) {
                    document.getElementById('timer-banner').outerHTML = ""
                }
                updateTime(changes.seconds.newValue)                                
                timer(changes.seconds.newValue)
            } else {
                document.getElementById('time').innerHTML = "Non impostato"
                setTimeout(() => !timerId && (timerNode.style.display = 'none'), 60000)
            }            
        }        
    });
}

const timer = (seconds) => { 
    timeSet = seconds   
    if (timerNode.style.display === "none") {
        timerNode.style.display = 'block'
    }    
    setTimer(seconds)
    timerId = setInterval(function(){        
        seconds--;
        setTimer(seconds)
        if (seconds < 0) {
            clearInterval(timerId);
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
<div class="timer-body MCcOAc ">
    <h3 class="text timer-title">Tempo Rimanente:</h3>
    <div class="timer-container">
        <span class="timer-digits text" id="time"></span>
    </div>
</div>
`
const style = `
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