$(document).ready(function(){

	// keep track of spoken words
	var final_transcript = '';

	//allow user to see themselves speak
	var videoStream = null;

	var time = {
			"hours":0,
			"minutes":0,
			"seconds":0
		}

	//copy of speech length to display to user
	var speechLength = {}

	var timer = null;
	var displayTimer = null;

	var seconds = $("#seconds")
	var minutes = $("#minutes")
	var hours = $("#hours")

	navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

	if(('webkitSpeechRecognition' in window)){
		var recognition = new webkitSpeechRecognition();
		recognition.continuous = true;
		recognition.interimResults = true;
		console.log("have web speech!")

		recognition.onstart = function(){
			console.log("START AUDIO");
		}

		recognition.onerror = function(){
			console.log("ERROR IN AUDIO")
			alert("Oops there was an error in detecting your speech. Please reload and try again")
		}

		recognition.onend = function(){
			console.log("STOP AUDIO");
		}

		recognition.onresult = function(event){
			console.log("GOT AUDIO RESULT")
			//console.log(event.results[0][0].transcript)
			for(var i=event.resultIndex; i<event.results.length; ++i){
				if(event.results[i].isFinal){
					final_transcript += event.results[i][0].transcript
				}
			}	

			//$("#result").html(linebreak(final_transcript));
		}
	
	} else {
		upgrade();
	}

	/// RECORD /////

	$("body").on('click',"#record", function(event){
		event.preventDefault();
		console.log("START RECORDING");

		//reset transcript
		final_transcript = '';

		// set language to english US and start
		recognition.lang = "en-US";
		recognition.start();

		// change icon to indicate its starting up
		$(this).hide();
		$(".starting").show();
		console.log("STARTING RECORDING")

		//get camera access
		navigator.getUserMedia({audio:false, video:true}, function(stream){
			var video = $("#video");
			video.fadeIn(200);
			videoStream = stream;
			video.attr({'src':URL.createObjectURL(stream)})
			console.log("GET VIDEO")
		}, function(error){
			alert("Error accessing your camera. Please reload and allow access.")
			console.log(error)
		})
	})

	// start timer once video has loaded
	$("#video").on("loadedmetadata", function(){
		console.log("GOT VIDEO");
		console.log("START TIMER");
		$(".starting").hide();
		$(".title-div").hide();
		$("#stopRecord").fadeIn(200);
		startTimer();
		displayTime();
	})

	//// STOP RECORD /////
	$("body").on("click","#stopRecord", function(event){
		event.preventDefault();
		$(this).hide();
		//trigger loading symbol
		console.log("SHOW STOP SCREEN");
		$(".loading").show();
		//make copy of time to show to person
		speechLength = $.extend({}, time);

		setTimeout(showAnalyzingScreen,500);
		$(".recording").hide();
		// call after interval to ensure google speech has captured everything
		setTimeout(stopRecording, 3500);
		setTimeout(sendText, 3600);

	})

	function showAnalyzingScreen(){
		resetTime();
		videoStream.getTracks()[0].stop()
		$("#video").fadeOut(400);
		$(".title-div").fadeIn(400);
		console.log("HIDE STOP SCREEN")
		console.log("SHOW ANALYZING SCREEN")

	}

	function stopRecording(){
		recognition.stop();
	}

	function showTotalSpeechTime(){
		console.log("displayin time")
		var displayHour = speechLength.hours>0 ? speechLength.hours : 0;
		var displayMinute = padTime(speechLength.minutes)
		var displaySeconds = padTime(speechLength.seconds)

		console.log(displayHour+":"+displayMinute+":"+displaySeconds)
	}

	function padTime(t){
		if(t>0 && t<10){
			t = "0"+t
		} else if(t==0){
			t = "00"
		} else {
			t = t
		}
		return t
	}

	//send for analysis
	function sendText(){
		
		console.log(final_transcript)
		var text = final_transcript;// || "you know basically I like I mean literally literally literally literally to run away from everything. You know I mean I love you whatever whatever whatever. It's hard what to do.";

		if(text){
			console.log("SEND TO SERVER")
			$.ajax({
				"url":"http://localhost:3000/analyze",
				"method": "POST",
				"data":{"text":text}
			})
			.done(function(response){
				console.log(response)
				console.log("GOT RESULTS");
				console.log("HIDE ANALYZING SCREEN");
				$(".loading").hide();
				displayResults(response);
			})
			.error(function(response){
				alert("There was an error in analyzing your speech. Try again")
				$(".loading").hide();
				console.log("Error in Analyzing")
			})
		} else {
			noTextDetected();
		}
	}

	function noTextDetected(){
		console.log("NO SPEECH DETECTED")
	}

	function displayResults(data){
		console.log("DISPLAY")
		showTotalSpeechTime();
		$("#results").append(data);
	}

	


	/// TIMER ///

	function startTimer(){
		seconds.show();

		timer = setInterval(function(){
			var scount = time.seconds
			scount++;
			time.seconds = scount;
			
			//console.log("SECONDS: " + time.seconds)
			if(time.seconds%60==0){
				time.seconds = 0;
				var mcount = time.minutes;
				mcount++;
				time.minutes = mcount;
				//console.log("MINUTES: " + time.minutes)
			}
			if(time.minutes%60==0 && mcount>0){
				time.seconds = 0;
				time.minutes = 0;
				var hcount = time.hours;
				hcount++;
				time.hours = hcount;
				//console.log("HOURS: " + time.hours)
			}

			//console.log(time)
		},1000)
	}

	function displayTime(){
		displayTimer = setInterval(function(){

			if(time.seconds<10){
				seconds.html("0"+time.seconds)
			} else {
				seconds.html(time.seconds)
			}
			

			if(time.minutes > 0 || time.hours > 0){
				minutes.show();
				if(time.minutes < 10){
					minutes.html("0"+time.minutes)
				}else {
					minutes.html(time.minutes)
				}
				
			}

			if(time.hours > 0){
				hours.show();
				if(time.hours < 10){
					hours.html("0"+hours.minutes)
				} else {
					hours.html(hours.minutes)
				}
			}
		}, 1000)
	}

	function resetTime(){
		console.log("RESET TIMER")
		clearInterval(timer)
		clearInterval(displayTimer)
		time.seconds = 0;
		time.minutes = 0;
		time.hours = 0;
		seconds.html(time.seconds)
		minutes.html(time.minutes)
		hours.html(time.hours)
		seconds.hide()
		minutes.hide()
		hours.hide()
	}

	/// FORMATTING ///

	var two_line = /\n\n/g;
	var one_line = /\n/g;
	function linebreak(s) {
  		return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
	}

	//// INFO STUFF ////

	// download better browser notification
	function upgrade(){
		console.log("Web speech not supported");
		$("#record").hide();
		$("#stopRecord").hide();
		showInfo('')
	}

	function showInfo(info){
		if(info){
			console.log("have some info")
		} else {
			console.log("clear all info")
		}
	}

})