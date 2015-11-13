$(document).ready(function(){
	console.log("ready")

	var recognizing = false;

	if(('webkitSpeechRecognition' in window)){
		var recognition = new webkitSpeechRecognition();
		recognition.continuous = true;
		recognition.interimResults = true;
		console.log("have web speech!")

		recognition.onstart = function(){
			console.log("starteddddd")
		}

		recognition.onerror = function(){
			console.log("errrorrr")
		}

		recognition.onend = function(){
			console.log("stopppedd")
		}

		recognition.onresult = function(event){
			console.log("got some resullttt")
		}

	}

	$("#record").on('click', function(event){
		console.log("start recognizing");

	})

})