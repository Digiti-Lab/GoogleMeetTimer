var button = document.getElementById('button')

chrome.storage.local.get(['hh', 'mm', 'ss'], function(result) {
    console.log(result)
    document.getElementById('hh').placeholder = result.hh
    document.getElementById('mm').placeholder = result.mm
    document.getElementById('ss').placeholder = result.ss
  });

document.addEventListener('keyup', (e) => {
    console.log(e)
    let hh = zeroFill(document.getElementById('hh').value)
    let mm = zeroFill(document.getElementById('mm').value)
    let ss = zeroFill(document.getElementById('ss').value)
    let seconds = parseInt(hh)*3600 + parseInt(mm)*60 + parseInt(ss)
    //button.innerHTML = "salvato"
    console.log('ok', {hh, mm, ss, seconds})
     // Save it using the Chrome extension storage API.
     chrome.storage.local.set({hh, mm, ss, seconds}, function() {
        // Notify that we saved.
        console.log('settings saved')
      });
})

const zeroFill = (n) => {
    if (n) {
        return ('0'+n).slice(-2)
    } else {
        return "00"
    }
    
}