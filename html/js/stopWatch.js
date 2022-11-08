a = setTimeout(function () {
    T = {} ;
    T.timerSpan = document.getElementById('timer');
}, 200);

function displayTimer() {
    // Inicializar variables locales
    var hours='00', minutes='00',
    miliseconds=0, seconds='00',
    time = '',
    timeNow = new Date().getTime(); // timestamp (miliseconds)

    T.difference = timeNow - T.timerStarted;


    //RETENCIÓN DEL TIEMPO
    /*
    if(typeof  Cookies.get('tiempoTotal') !== 'undefined')
    {
        if(Cookies.get('carga') !== 'true')
        {
            Cookies.set('carga', 'true');
            if((seconds === '00') && (minutes === '00'))
            {
                seconds = (parseInt(seconds) + parseInt(Cookies.get('tiempoTotal').substring(6,3))).toString(); //segundos totales
                if(seconds.length < 2)
                {
                    seconds = '0' + seconds;
                }
                minutes = (parseInt(minutes) + parseInt(Cookies.get('tiempoTotal').substring(4,0))).toString(); //minutos totales
                if(minutes.length < 2)
                {
                    minutes = '0' + minutes;
                }
                T.difference = T.difference + (parseInt(minutes)*60*1000) + (parseInt(seconds)*1000);
            }
        }
    }
    */


    // milliseconds
    if(T.difference > 10) {
        miliseconds = Math.floor((T.difference % 1000) / 10);
        if(miliseconds < 10) {
            miliseconds = '0'+String(miliseconds);
        }
    }
    // seconds
    if(T.difference > 1000) {
        seconds = Math.floor(T.difference / 1000);
        if (seconds > 60) {
            seconds = seconds % 60;
        }
        if(seconds < 10) {
            seconds = '0'+String(seconds);
        }
    }

    // minutes
    if(T.difference > 60000) {
        minutes = Math.floor(T.difference/60000);
        if (minutes > 60) {
            minutes = minutes % 60;
        }
        if(minutes < 10) {
            minutes = '0'+String(minutes);
        }
    }

    // hours
    if(T.difference > 3600000) {
        hours = Math.floor(T.difference/3600000);
        // if (hours > 24) {
        // 	hours = hours % 24;
        // }
        if(hours < 10) {
            hours = '0'+String(hours);
        }
    }
    if(seconds == 60) {
        time += minutes + ':'
        time += '00'
    }
    else {
        time += minutes + ':'
        time += seconds
    }
    T.timerSpan.innerHTML = time;
}

function startTimer() {
    // Guardar tiempo inicio
    T.timerStarted = new Date().getTime()
    
    if(typeof Cookies.get('tiempoTotal') !== 'undefined')
    {
        seconds = parseInt(Cookies.get('tiempoTotal').substring(6,3)); //segundos totales
        
        minutes = parseInt(Cookies.get('tiempoTotal').substring(4,0)); //minutos totales
        
        T.timerStarted = T.timerStarted - (parseInt(minutes)*60*1000) - (parseInt(seconds)*1000);
    }
    
    if (T.difference > 0) {
        T.timerStarted = T.timerStarted - T.difference
    }
    // Actualizarlo de forma periodica
    T.timerInterval = setInterval(function() {
        displayTimer()
    }, 10);

    // Modificar botones:
    //document.getElementById('stop').style.display="inline";
}

function stopTimer() {
    if(T.timerInterval > 0)
    {
        clearInterval(T.timerInterval); // pausar timer 
    }
    else
    {
        startTimer();
    }
}

function clearTimer() {
    clearInterval(T.timerInterval);
    T.timerSpan.innerHTML = "00:00"; // resetear timer
    T.difference = 0;
}