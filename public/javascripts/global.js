$(document).ready(function(){
	console.log("ready")

	var recognizing = false;

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
				console.log(event.results[i][0].transcript)
			}	
		}
	
	} else {
		upgrade();
	}

	$("#record").on('click', function(event){
		event.preventDefault();
		if(recognizing){
			recognition.stop();
			return;
		}
		console.log("start recognizing");
		// set language to english US
		recognition.lang = "en-US";
		recognition.start()
	})

})