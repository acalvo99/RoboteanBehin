var session = null;
var tts = null;
var background_movement = null;

timeValue =  30;
que_count = 0;
que_numb = 1;
userScore = 0;
score = 0;
puntuak = 0;
timeAnswer = 0;
counter = 0;
counterLine = 0;
widthValue = 0;
questions = [];
questions_length = 10;
var categories_list = [general, science_and_nature, sports]
var question_per_category = 50
valence = 0.0

QiSession(connected, disconnected, location.host);

//gameUser = localStorage.getItem("user");
gameUser = "Igor_0"
localStorage.setItem("gameUser", gameUser);
// alert(gameUser);

function connected(s) {
    console.log("Session connected");
    session = s;
    startSubscribe();

    session.service("ALTextToSpeech").then(function (t) {
        // tts is a proxy to the ALTextToSpeech service
        tts = t;
    });

    session.service("ALBackgroundMovement").then(function (t) {
        // tts is a proxy to the ALTextToSpeech service
        background_movement = t;
    });
}

function disconnected(error) {
    console.log("Session disconnected");
}

function sum(a, b){
    return a+b
}

function startSubscribe() {
    session.service("ALMemory").then(function (memory) {
        memory.subscriber("datosProgreso").then(function (subscriber) {
            subscriber.signal.connect(function (progressData){
               
                //alert(progressData)
                progress_data = progressData;

                var head_tag = '<thead><tr><th>Fecha</th><th>Aciertos</th><th>Tiempo</th><th>Puntuación</th></tr></thead><tbody>';
                var body_tag = '';
                
                if(progress_data.length<7){
                    luzera = 0;
                }
                else{
                    luzera = progress_data.length-6;
                }
                
                for (i=luzera;i<progress_data.length; i++) {
                    
                    date = progress_data[i][0]
                    accuracy = progress_data[i][1]
                    duration = progress_data[i][2]
                    score = progress_data[i][3]


                    if (i == (progress_data.length - 1)){
                        body_tag = body_tag + '<tr class="active-row"><td>' + date + '</td><td>' + accuracy + '</td><td>' + duration + '</td><td>' + score + '</td></tr>';
                    }
                    else{
                        body_tag = body_tag + '<tr><td>' + date + '</td><td>' + accuracy + '</td><td>' + duration + '</td><td>' + score + '</td></tr>';
                    }
                }
                body_tag = body_tag + '</tbody>';
                var progress_tag = head_tag + body_tag;
                $('.content-table').html(progress_tag);
            })
        });

        memory.subscriber("datosEstadoEmocional").then(function (subscriber) {
            subscriber.signal.connect(function (val){
                valence = parseFloat(val);
                // alert(valence);
                if (valence < -0.6){
                    // alert("valence < -0.6");
                    $('#estado-emocional').attr('src','imagenes/juegos-general/emotion-sad-color.png');
                }
                else if (valence >= -0.6 && valence < -0.2){
                    // alert("valence >= -0.6 && valence > -0.2");
                    $('#estado-emocional').attr('src','imagenes/juegos-general/emotion-sad.png');
                }
                else if (valence >= -0.2 && valence <= 0.2){
                    // alert("valence >= -0.2 && valence <= 0.2");
                    $('#estado-emocional').attr('src','imagenes/juegos-general/emotion-neutral.png');
                }
                else if (valence > 0.2 && valence <= 0.6){
                    // alert("valence > 0.2 && valence <= 0.6");
                    $('#estado-emocional').attr('src','imagenes/juegos-general/emotion-happy.png');
                }
                else{
                    // alert("valence > 0.6 ");
                    $('#estado-emocional').attr('src','imagenes/juegos-general/emotion-happy-color.png');
                }
            })
        });
        /*
        memory.subscriber("datosMediaProgreso").then(function (subscriber) {
            subscriber.signal.connect(function (mediapuntu){

                media_puntuak = mediapuntu;

                var averageText = '<span>Puntuación media de las últimas 5 partidas: '+ media_puntuak +' </span>';
                $('.average').html(averageText);

                var numCadena= '<span> ' + score_round + ' </span>';
                    
                if(score_round<media_puntuak){
                    var final_scoreT = '<span>Puntuación de la última partida: '+ numCadena.fontcolor("red") +' </span>';
                    $('.final_score').html(final_scoreT);
                }
                else{
                    var final_scoreT = '<span>Puntuación de la última partida: '+ numCadena.fontcolor("green") +' </span>';
                    $('.final_score').html(final_scoreT); 
                } 
            })
        }); 
        */  
    });
}

function onClickStartButton(){
    background_movement.setEnabled(false);
    questions = loadQuestions(questions_length);
    $('.info_box').addClass('activeInfo');
    $('.start_btn').hide();
    session.service("ALMemory").then(function (memory) {
        memory.raiseEvent("empezarJuego", "reglas");
    });
    //onClick_buttonButton();
}

function onClickExitButton(){
    $('.info_box').removeClass('activeInfo');
    $('.start_btn').show();
}

function onClickQuitButton(){
    // Exit game
    session.service("ALMemory").then(function (memory) {
        memory.raiseEvent("cambiarHTML", "preguntas");
    });
}

function onClickRankingButton(){
    $('.info_box').removeClass('activeInfo');
    $('.quiz_box').removeClass('activeQuiz');
    $('.result_box').removeClass('activeResult');
    $('.ranking_box').addClass('activeRanking');

    session.service("ALMemory").then(function (memory) {
        memory.raiseEvent("pedirDatosProgreso", gameUser);
    });
}

function onClickAcceptButton(){
    $('.ranking_box').removeClass('activeRanking');
    $('.result_box').addClass('activeResult');
}

function resetGame(){
    que_count = 0;
    que_numb = 1;
    userScore = 0;
    score = 0;
    puntuak = 0;

    questions = loadQuestions(questions_length);
}

function onClickContinueButton(){
    resetGame();
    $('.button-back').hide();
    $('.info_box').removeClass('activeInfo');
    $('.result_box').removeClass('activeResult');
    $('.quiz_box').addClass('activeQuiz');

    session.service("ALMemory").then(function (memory) {
        memory.raiseEvent("obtenerEstadoEmocional", gameUser);
    });

    showQuestions(0); //calling showQuestions function
    queCounter(1); //passing 1 parameter to queCounter
    startCountdown(timeValue); //calling startCountdown function
    startCountdownLine(0); //calling startCountdownLine function
    setCronometro("restart", 1000)
    setCronometro("start", 1000);
}

// const restart_quiz = result_box.querySelector(".buttons .restart");
// const quit_quiz = result_box.querySelector(".buttons .quit");

// // if restartQuiz button clicked

// function onClickRestartButton(){
//     $('.quiz_box').addClass('activeQuiz');
//     $('.result_box').removeClass('activeResult');
//     // result_box.classList.remove("activeResult"); //hide result box
//     timeValue = 15; 
//     que_count = 0;
//     que_numb = 1;
//     userScore = 0;
//     widthValue = 0;
//     showQuestions(que_count); //calling showQuestions function
//     queCounter(que_numb); //passing que_numb value to queCounter
//     //clearInterval(counter); //clear counter
//     //clearInterval(counterLine); //clear counterLine
//     //startCountdown(timeValue); //calling startCountdown function
//     //startCountdownLine(widthValue); //calling startCountdownLine function
//     //$('.countdown .time_left_txt').text("Time Left");//change the text of timeText to Time Left
    
//     $('footer .next_btn').removeClass("show");//hide the next button
// }

function onClickQuizButton(){
    window.location.reload(); //reload the current window    
}

// const next_btn = document.querySelector("footer .next_btn");
// const bottom_ques_counter = document.querySelector("footer .total_que");

function onClickNextButton(){

    if(que_count < questions.length - 1){ //if question count is less than total question length
        que_count++; //increment the que_count value
        que_numb++; //increment the que_numb value
        showQuestions(que_count); //calling showQuestions function
        queCounter(que_numb); //passing que_numb value to queCounter
        clearInterval(counter); //clear counter
        clearInterval(counterLine); //clear counterLine
        startCountdown(timeValue); //calling startCountdown function
        startCountdownLine(widthValue); //calling startCountdownLine function
        $('.countdown .time_left_txt').text("Tiempo");
        $('footer .next_btn').removeClass("show");
        setCronometro("start", 1000);
    }
    else{
        clearInterval(counter); //clear counter
        clearInterval(counterLine); //clear counterLine
        setCronometro("stop", 300);
        saveGameData();
        showResult(); //calling showResult function
        session.service("ALMemory").then(function (memory) {
            memory.raiseEvent("obtenerEstadoEmocional", gameUser);
        });
    }
}

// // getting questions and options from array
function showQuestions(index){
    // const que_text = document.querySelector(".que_text");

    //creating a new span and div tag for question and option and passing the value using array index
    var que_tag = '<span>'+ questions[index].numb + ". " + questions[index].question +'</span>';
    var option_tag = '<div class="option"><span>'+ questions[index].options[0] +'</span></div>'
    + '<div class="option"><span>'+ questions[index].options[1] +'</span></div>'
    + '<div class="option"><span>'+ questions[index].options[2] +'</span></div>'
    + '<div class="option"><span>'+ questions[index].options[3] +'</span></div>';
    
    $('.title').html('Preguntas sobre ' + questions[index].category);
    $('.que_text').html(que_tag);
    // que_text.innerHTML = que_tag; //adding new span tag inside que_tag
    $('.option_list').html(option_tag); //adding new div tag inside option_tag
    
    // option = $('.option_list').find(".option");
    // set onclick attribute to all available options

    for(i=0; i < $('.option_list .option').length; i++){
        // $('.option_list .option').get(i).attr("onclick", "optionSelected(this)");
        $($('.option_list .option').get(i)).attr("onclick", "optionSelected(this)");
        // alert("Hola");

    }
}
// // creating the new div tags which for icons
var tickIconTag = '<div class="icon tick"><i class="fas fa-check"></i></div>';
var crossIconTag = '<div class="icon cross"><i class="fas fa-times"></i></div>';

// //if user clicked on option
function optionSelected(answer){
    answer = $(answer)
    console.log(answer);
    var timeAns = $('.countdown .timer_sec').text();
    timeAnswer = parseInt(timeAns);
    clearInterval(counter); //clear counter
    clearInterval(counterLine); //clear counterLine
    //var userAns = escapeHtml(answer.text()); //getting user selected option
    var userAns = answer.text(); //getting user selected option
    //var correcAns = escapeHtml(questions[que_count].answer); //getting correct answer from array
    var correcAns = questions[que_count].answer; //getting correct answer from array
    var allOptions = $('.option_list .option').length; //getting all option items
    
    if(userAns == correcAns){ //if user selected option is equal to array's correct answer
        acierto = 1;
        userScore += 1; //upgrading score value with 1
        answer.addClass("correct"); //adding green color to correct selected option
        // answer.insertAfter("beforeend", tickIconTag); //adding tick icon to correct selected option
        answer.append(tickIconTag);

        // Reacción positiva
        session.service("ALMemory").then(function (memory) {
            memory.raiseEvent("reaccionRespuesta", 1);
        });
        
    }
    else{
        acierto = 0;
        answer.addClass("incorrect"); //adding red color to correct selected option
        answer.append(crossIconTag); //adding cross icon to correct selected option
        // console.log("Wrong Answer");
        // Reacción negativa
        session.service("ALMemory").then(function (memory) {
            memory.raiseEvent("reaccionRespuesta", 0);
        });

        for(i=0; i < allOptions; i++){
            // opt = $($('.option_list').get(i))
            opt = $($('.option_list .option').get(i))
            //alert("opt: " + escapeHtml(opt.text()));
            //alert("correcAns: " + correcAns);
            //if(escapeHtml(opt.text()) == correcAns){ //if there is an option which is matched to an array answer 
            if(opt.text() == correcAns){ //if there is an option which is matched to an array answer 
                opt.attr("class", "option correct"); //adding green color to matched option
                opt.append(tickIconTag); //adding tick icon to matched option
                // console.log("Auto selected correct answer.");
            }
        }
    }

    d = 30;
    
    puntuak = puntuak + (acierto*(d-(d-timeAnswer)));
    //puntuak = puntuak + ((2*acierto-1)*(d-(d-timeAnswer)));

    for(i=0; i < allOptions; i++){
        $($('.option_list .option').get(i)).addClass("disabled"); //once user select an option then disabled all options
    }
    $('footer .next_btn').addClass("show"); //show the next button if user selected any option
    setCronometro("stop", 300);
}

function showResult(){
    $('.info_box').removeClass("activeInfo");
    // info_box.classList.remove("activeInfo"); //hide info box
    // quiz_box.classList.remove("activeQuiz"); //hide quiz box
    $('.quiz_box').removeClass("activeQuiz");
    // result_box.classList.add("activeResult"); //show result box
    $('.result_box').addClass("activeResult");
    var scoreText = $('.result_box').find(".score_text");
    duration = $('#timer').text()
    time = duration.split(':');
    duration_num = time[0] + (time[1]/100)

    score = puntuak*100/300;
    score_round = Math.round(score);

    //puntuak  ----  290   = 10*(30-1)  
    //score    ----  100


    $('.score .score_value').text(score_round);
    text = ""
    
    if (score_round >= 80){ // if user scored more than 3
        //creating a new span tag and passing the user score number and total question number
        // scoreTag = '<span>and congrats! 🎉, You got <p>'+ userScore +'</p> out of <p>'+ questions.length +'</p></span>';
        if (time[0] > 0){
            scoreTag = '<span>¡Sobresaliente! 🎉 Has respondido correctamente '+ userScore +' de '+ questions.length +' preguntas en ' + duration + ' minutos. </span>';
            scoreText.html(scoreTag);  //adding new span tag inside score_Text
            if(time[0]==1){
                text = '¡Sobresaliente! Has respondido correctamente '+ userScore +' de '+ questions.length +' preguntas en ' + time[0] + ' minuto y ' + time[1] + ' segundos. Por lo tanto has conseguido un total de ' + score_round + ' puntos';
            }else{
                text = '¡Sobresaliente! Has respondido correctamente '+ userScore +' de '+ questions.length +' preguntas en ' + time[0] + ' minutos y ' + time[1] + ' segundos. Por lo tanto has conseguido un total de ' + score_round + ' puntos';
            }
        }else{
            scoreTag = '<span>¡Sobresaliente! 🎉 Has respondido correctamente '+ userScore +' de '+ questions.length +' preguntas en ' + duration + ' segundos. </span>';
            scoreText.html(scoreTag);  //adding new span tag inside score_Text
            text = '¡Sobresaliente! Has respondido correctamente '+ userScore +' de '+ questions.length +' preguntas en ' + time[1] + ' segundos. Por lo tanto has conseguido un total de ' + score_round + ' puntos';
        }
    }
    else if (score_round >= 65){ // if user scored more than 3
        //creating a new span tag and passing the user score number and total question number
        // scoreTag = '<span>and congrats! 🎉, You got <p>'+ userScore +'</p> out of <p>'+ questions.length +'</p></span>';
        if (time[0] > 0){
            scoreTag = '<span>¡Lo has hecho genial! 👏 Has respondido correctamente '+ userScore +' de '+ questions.length +' preguntas en ' + duration + ' minutos. </span>'; 
            scoreText.html(scoreTag);  //adding new span tag inside score_Text
            if(time[0]==1){
                text = '¡Lo has hecho genial! Has respondido correctamente '+ userScore +' de '+ questions.length +' preguntas en ' + time[0] + ' minuto y ' + time[1] + ' segundos. Por lo tanto has conseguido un total de ' + score_round + ' puntos';
            }else{
                text = '¡Lo has hecho genial! Has respondido correctamente '+ userScore +' de '+ questions.length +' preguntas en ' + time[0] + ' minutos y ' + time[1] + ' segundos. Por lo tanto has conseguido un total de ' + score_round + ' puntos';
            }
        }else{
            scoreTag = '<span>¡Lo has hecho genial! 👏 Has respondido correctamente '+ userScore +' de '+ questions.length +' preguntas en ' + duration + ' segundos. </span>'; 
            scoreText.html(scoreTag);  //adding new span tag inside score_Text
            text = '¡Lo has hecho genial! Has respondido correctamente '+ userScore +' de '+ questions.length +' preguntas en ' + time[1] + ' segundos. Por lo tanto has conseguido un total de ' + score_round + ' puntos';
        }
    }
    else if(score_round >= 40){ // if user scored more than 1
        // scoreTag = '<span>and nice 😎, You got <p>'+ userScore +'</p> out of <p>'+ questions.length +'</p></span>';
        if (time[0] > 0){
            scoreTag = '<span>¡No está nada mal! 😎 Has respondido correctamente '+ userScore +' de '+ questions.length +' preguntas en ' + duration + ' minutos. </span>'; 
            scoreText.html(scoreTag);
            if(time[0]==1){
                text = '¡No está nada mal! Has respondido correctamente '+ userScore +' de '+ questions.length +' preguntas en ' + time[0] + ' minuto y ' + time[1] + ' segundos. Por lo tanto has conseguido un total de ' + score_round + ' puntos';
            }else{
                text = '¡No está nada mal! Has respondido correctamente '+ userScore +' de '+ questions.length +' preguntas en ' + time[0] + ' minutos y ' + time[1] + ' segundos. Por lo tanto has conseguido un total de ' + score_round + ' puntos';
            }
        }else{
            scoreTag = '<span>¡No está nada mal! 😎 Has respondido correctamente '+ userScore +' de '+ questions.length +' preguntas en ' + duration + ' segundos. </span>'; 
            scoreText.html(scoreTag);
            text = '¡No está nada mal! Has respondido correctamente '+ userScore +' de '+ questions.length +' preguntas en ' + time[1] + ' segundos. Por lo tanto has conseguido un total de ' + score_round + ' puntos';
        }
    }
    else if(score_round >= 25){ // if user scored more than 1
        // scoreTag = '<span>and nice 😎, You got <p>'+ userScore +'</p> out of <p>'+ questions.length +'</p></span>';
        if(time[0] > 0){
            scoreTag = '<span>Te veo un poco floj@... 😔 Has respondido correctamente '+ userScore +' de '+ questions.length +' preguntas en ' + duration + ' minutos. </span>'; 
            scoreText.html(scoreTag);
            if(time[0]==1){
                text = 'Te veo un poco flojo. Has respondido correctamente '+ userScore +' de '+ questions.length +' preguntas en ' + time[0] + ' minuto y ' + time[1] + ' segundos. Por lo tanto has conseguido un total de ' + score_round + ' puntos';
            }else{
                text = 'Te veo un poco flojo. Has respondido correctamente '+ userScore +' de '+ questions.length +' preguntas en ' + time[0] + ' minutos y ' + time[1] + ' segundos. Por lo tanto has conseguido un total de ' + score_round + ' puntos';
            }
            
        }else{    
            scoreTag = '<span>Te veo un poco floj@... 😔 Has respondido correctamente '+ userScore +' de '+ questions.length +' preguntas en ' + duration + ' segundos. </span>'; 
            scoreText.html(scoreTag);
            text = 'Te veo un poco flojo. Has respondido correctamente '+ userScore +' de '+ questions.length +' preguntas en ' + time[1] + ' segundos. Por lo tanto has conseguido un total de ' + score_round + ' puntos';
        }
    }
    else{ // if user scored less than 1
        // scoreTag = '<span>and sorry 😐, You got only <p>'+ userScore +'</p> out of <p>'+ questions.length +'</p></span>';
        if(time[0] > 0){
            scoreTag = '<span>Hoy no es tu día... 😢 Solo has respondido correctamente '+ userScore +' de '+ questions.length +' preguntas en ' + duration + ' minutos. </span>';
            scoreText.html(scoreTag);
            if(time[0]==1){
                text = 'Hoy no es tu día. Solo has respondido correctamente '+ userScore +' de '+ questions.length +' preguntas en ' + time[0] + ' minuto y ' + time[1] + ' segundos. Por lo tanto has conseguido un total de ' + score_round + ' puntos';
            }else{
                text = 'Hoy no es tu día. Solo has respondido correctamente '+ userScore +' de '+ questions.length +' preguntas en ' + time[0] + ' minutos y ' + time[1] + ' segundos. Por lo tanto has conseguido un total de ' + score_round + ' puntos';
            }
        }else{
            scoreTag = '<span>Hoy no es tu día... 😢 Solo has respondido correctamente '+ userScore +' de '+ questions.length +' preguntas en ' + duration + ' segundos. </span>';
            scoreText.html(scoreTag);
            text = 'Hoy no es tu día. Solo has respondido correctamente '+ userScore +' de '+ questions.length +' preguntas en ' + time[1] + ' segundos. Por lo tanto has conseguido un total de ' + score_round + ' puntos';
        }
    }

    resultado = [text, score_round]

    session.service("ALMemory").then(function (memory) {
        memory.raiseEvent("respuestaResultado", resultado);
    });

    gu = gameUser.split(",");
    if (gu[0] === "None"){
        $('#ranking_button').hide();
    }
}

function startCountdown(time){
    counter = setInterval(timer, 1000);
    function timer(){
        $('.countdown .timer_sec').text(time); //changing the value of timeCount with time value
        time--; //decrement the time value
        if(time < 9){ //if timer is less than 9
            var addZero = $('.countdown .timer_sec').text(); 
            $('.countdown .timer_sec').text("0" + addZero); //add a 0 before time value
        }
        if(time < 0){ //if timer is less than 0
            timeAnswer = 30;
            
            clearInterval(counter); //clear counter
            $('.countdown .time_left_txt').text("Tiempo agotado"); //change the time text to time off
            var allOptions = $('.option_list .option').length; //getting all option items
            //var correcAns = escapeHtml(questions[que_count].answer); //getting correct answer from array
            var correcAns = questions[que_count].answer; //getting correct answer from array
            for(i=0; i < allOptions; i++){
                // console.debug($('.option_list .option span').get(i));
                opt = $($('.option_list .option').get(i))
                // if(escapeHtml(opt.text()) == correcAns){ //if there is an option which is matched to an array answer
                if(opt.text() == correcAns){ //if there is an option which is matched to an array answer  
                    opt.attr("class", "option correct"); //adding green color to matched option
                    opt.append(tickIconTag); //adding tick icon to matched option
                    // console.log("Auto selected correct answer.");
                }
                else{
                    opt.attr("class", "option incorrect"); //adding green color to matched option
                    opt.append(crossIconTag);
                }
            }
            for(i=0; i < allOptions; i++){
                $($('.option_list .option').get(i)).addClass("disabled"); //once user select an option then disabled all options
            }
            $('footer .next_btn').addClass("show"); //show the next button if user selected any option
            setCronometro("stop", 300);

            session.service("ALMemory").then(function (memory) {
                memory.raiseEvent("reaccionRespuesta", 0);
            });
        }
    }
}

function startCountdownLine(time){
    //counterLine = setInterval(timer, 29);
    counterLine = setInterval(timer, 58);
    function timer(){
        time += 1; //upgrading time value with 1
        $('header .time_line').css("width", time+"px"); //increasing width of time_line with px by time value
        if(time > 549){ //if time value is greater than 549    
            clearInterval(counterLine); //clear counterLine
        }
    }
}

function queCounter(index){
    //creating a new span tag and passing the question number and total question
    var totalQueCounTag = '<span>'+ index +' de '+ questions.length +' preguntas</span>';
    $("footer .total_que").html(totalQueCounTag);  //adding new span tag inside bottom_ques_counter
}

function setCronometro(palabra, tiempo) {
    CrearCookie('carga', 'false');
    time = setTimeout(function () {
        if (palabra === "start") startTimer();
        else if (palabra === "stop") stopTimer();
        else if (palabra === "restart") clearTimer();
    }, tiempo);
}

function CrearCookie(nombre, valor)
{
    Cookies.set(nombre, valor);
}


// function loadJSON(callback) {   

//     var xobj = new XMLHttpRequest();
//         xobj.overrideMimeType("application/json");
//     xobj.open('GET', 'my_data.json', true); // Replace 'my_data' with the path to your file
//     xobj.onreadystatechange = function () {
//           if (xobj.readyState == 4 && xobj.status == "200") {
//             // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
//             callback(xobj.responseText);
//           }
//     };
//     xobj.send(null);  
//  }

function loadQuestions()
{
    
    var keys = ["numb","category","question","answer", "options"];
    var arr = [];
    var questions_code = randomUniqueArray();
    console.debug(questions_code)
    for(i=0; i < questions_length; i++){
        // Get random category of questions
        // type_index = getRndInteger(0, categories_list.length-1);
        type_index = Math.floor(questions_code[i]/question_per_category)
        console.debug(type_index)
        que_type_list = categories_list[type_index];
        // alert(que_type_list[0].category);
        // Complete questions array
        var q = questions_code[i] % question_per_category
        var obj = {};
        obj[keys[0]] = i + 1;
        obj[keys[1]] = escapeHtml(que_type_list[q].category);
        obj[keys[2]] = escapeHtml(que_type_list[q].question);
        obj[keys[3]] = escapeHtml(que_type_list[q].correct_answer);
        list = [escapeHtml(que_type_list[q].correct_answer), escapeHtml(que_type_list[q].incorrect_answers[0]), escapeHtml(que_type_list[q].incorrect_answers[1]), escapeHtml(que_type_list[q].incorrect_answers[2])];
        obj[keys[4]] = shuffle(list)
        arr.push(obj);
    }
    return arr;
}

function randomUniqueArray(){
    var arr = [];
    while(arr.length < questions_length){
        var r = Math.floor(Math.random() * categories_list.length * question_per_category);
        if(arr.indexOf(r) === -1) arr.push(r);
    }
    return arr;
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
  }

function escapeHtml(text) {
    var map = {
        '&amp;': '&',
        '&#038;': "&",
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#039;': "'",
        '&#8217;': "’",
        '&#8216;': "‘",
        '&#8211;': "–",
        '&#8212;': "—",
        '&#8230;': "…",
        '&#8221;': '”'
    };
    
    return text.replace(/\&[\w\d\#]{2,5}\;/g, function(m) { return map[m]; });
  }

  function saveGameData(){
    // Save game data
    gameUser = localStorage.getItem("gameUser");
    duration = $('#timer').text()
    //alert(gameUser);
    //alert(duration);
    //alert(userScore);
    //alert(score);
    if(gameUser !== null){
        gu = gameUser.split(",");
        if(gu[0]!=="None"){
            // Guardar información de la partida en fichero xml
            session.service("ALMemory").then(function (memory) {
                memory.raiseEvent("guardarInformacionPartida", ["4", "Preguntas", gu[0], userScore, duration, score_round]);
            });
        }
    }
  }