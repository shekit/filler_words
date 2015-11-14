$(document).ready(function(){
	console.log("ready")

	var recognizing = false;
	var final_transcript = '';
	var span = $("#finalSpan")

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
		var text = span.html() || "you know basically I like I mean to run away from everything. You know I mean I love you. It's hard what to do.";

		$.ajax({
			"url":"http://localhost:3000/analyze",
			"method": "POST",
			"data":{"text":text}
		})
		.done(function(response){
			console.log(response)
			console.log("hide analyzing screen")
		})
		.error(function(response){
			console.log("ERROR")
		})
	}

	$("#video").on("loadedmetadata", function(){
		console.log("loaded video");

		console.log("start timer")
	})

	$("#camera").on("click", function(event){
		event.preventDefault();

		
	})

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