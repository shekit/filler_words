$(document).ready(function(){
	console.log("ready")

	var recognizing = false;
	var final_transcript = '';
	var span = $("#finalSpan")

	var time = {
			"hours":0,
			"minutes":0,
			"seconds":0
		}

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
			console.log("starteddddd");
			recognizing = true;
		}

		recognition.onerror = function(){
			console.log("errrorrr")
		}

		recognition.onend = function(){
			console.log("stopppedd");
			recognizing = false;
		}

		recognition.onresult = function(event){
			console.log("got some resullttt")
			for(var i=event.resultIndex; i<event.results.length; ++i){
				if(event.results[i].isFinal){
					final_transcript += event.results[i][0].transcript
				}
			}	

			//$("#result").html(linebreak(final_transcript));
			span.html(linebreak(final_transcript))
		}
	
	} else {
		upgrade();
	}

	$("#record").on('click', function(event){
		event.preventDefault();
		console.log("start recognizing");
		recognizing = true;
		// set language to english US
		recognition.lang = "en-US";
		recognition.start();

		navigator.getUserMedia({audio:false, video:true}, function(stream){
			var video = $("#video");
			video.attr({'src':URL.createObjectURL(stream)})
			console.log("GOT VIDEO")
		}, function(error){
			console.log(error)
		})
	})

	$("body").on("click","#stopRecord", function(event){
		event.preventDefault();

		recognizing = false;
		console.log("Show analyzing");

		setTimeout(sendText, 2000);

	})

	function sendText(){
		var text = span.html() || "you know basically I like I mean literally literally literally literally to run away from everything. You know I mean I love you whatever whatever whatever. It's hard what to do.";

		$.ajax({
			"url":"http://localhost:3000/analyze",
			"method": "POST",
			"data":{"text":text}
		})
		.done(function(response){
			//console.log(response)
			console.log("display results");
			console.log("hide analyzing screen")
			displayResults(response);
		})
		.error(function(response){
			console.log("ERROR")
		})
	}

	function displayResults(data){

		//arrange in descending order
		var data = data.sort(function(a,b){
			if(a.count > b.count){
				return -1;
			}

			if(a.count < b.count){
				return 1;
			}

			return 0
		})

		for (var i in data){
			console.log("this is the word: " + data[i].word + " and this is its count: "+data[i].count)
		}
	}


	$("#video").on("loadedmetadata", function(){
		console.log("loaded video");

		console.log("start timer")
	})

	$("#camera").on("click", function(event){
		event.preventDefault();
		seconds.show();
		startTimer();
		displayTime();
	})

	/// TIMER ///

	function startTimer(){

		var timer = setInterval(function(){
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
		var displayTimer = setInterval(function(){

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
		console.log("web speech not supported");
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