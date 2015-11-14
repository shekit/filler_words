$(document).ready(function(){
	console.log("ready")

	var recognizing = false;
	var final_transcript = '';
	var span = $("#finalSpan")
	var videoStream = null;

	var time = {
			"hours":0,
			"minutes":0,
			"seconds":0
		}

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
			recognizing = true;
		}

		recognition.onerror = function(){
			console.log("ERROR IN AUDIO")
		}

		recognition.onend = function(){
			console.log("STOP AUDIO");
			recognizing = false;
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
			//span.html(linebreak(final_transcript))
		}
	
	} else {
		upgrade();
	}

	$("#record").on('click', function(event){
		event.preventDefault();
		console.log("Start Recording");
		recognizing = true;
		// set language to english US
		recognition.lang = "en-US";
		recognition.start();

		//get camera access
		navigator.getUserMedia({audio:false, video:true}, function(stream){
			var video = $("#video");
			videoStream = stream;
			video.attr({'src':URL.createObjectURL(stream)})
			console.log("GET VIDEO")
		}, function(error){
			console.log(error)
		})
	})

	$("body").on("click","#stopRecord", function(event){
		event.preventDefault();

		recognizing = false;
		//trigger loading symbol
		console.log("SHOW STOP SCREEN");
		//make copy of time to show to person
		speechLength = $.extend({}, time);

		setTimeout(showAnalyzingScreen,500);

		// call after interval to ensure google speech has captured everything
		setTimeout(stopRecording, 3500);
		setTimeout(sendText, 3600);

	})

	function showAnalyzingScreen(){
		resetTime();
		videoStream.getTracks()[0].stop()
		$("#video").fadeOut(400);
		console.log("HIDE STOP SCREEN")
		console.log("SHOW ANALYZING SCREEN")
	}

	function stopRecording(){
		recognition.stop();
	}

	//send for analysis
	function sendText(){
		console.log("SEND TO SERVER")
		console.log(final_transcript)
		var text = final_transcript || "you know basically I like I mean literally literally literally literally to run away from everything. You know I mean I love you whatever whatever whatever. It's hard what to do.";

		$.ajax({
			"url":"http://localhost:3000/analyze",
			"method": "POST",
			"data":{"text":text}
		})
		.done(function(response){
			console.log(response)
			console.log("GOT RESULTS");
			console.log("HIDE ANALYZING SCREEN")
			displayResults(response);
		})
		.error(function(response){
			console.log("Error in Analyzing")
		})
	}

	function displayResults(data){

		if(data.length){
			//arrange results in descending order - most used word to least
			var data = data.sort(function(a,b){
				if(a.count > b.count){
					return -1;
				}

				if(a.count < b.count){
					return 1;
				}

				return 0
			})

			//display it to screen
			for (var i in data){
				console.log("this is the word: " + data[i].word + " and this is its count: "+data[i].count)
			}
		} else {
			console.log("YOU PERFECT")
		}
	}

	// start timer once video has loaded
	$("#video").on("loadedmetadata", function(){
		console.log("GOT VIDEO");
		console.log("START TIMER");
		
		startTimer();
		displayTime();
	})

	$("#camera").on("click", function(event){
		event.preventDefault();
	})

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

			console.log(time)
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

	function upgrade(){
		console.log("Web speech not supported");
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