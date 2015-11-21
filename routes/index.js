var express = require('express');
var router = express.Router();
var fs = require('fs');

var filler_words = [
	{
		"word":"Um",
		"regex": /mmm/ig
	},
	{
		"word":"Ah",
		"regex":/ah/ig
	},
	{
		"word":"Like",
		"regex": /like/ig
	},
	{
		"word":"Ok",
		"regex": /ok/ig
	},
	{
		"word":"Actually",
		"regex":/actually/ig
	},
	{
		"word":"Basically",
		"regex": /basically/ig
	},
	{
		"word":"Literally",
		"regex": /literally/ig
	},
	{
		"word":"Seriously",
		"regex": /seriously/ig
	},
	{
		"word":"Whatever",
		"regex": /whatever/ig
	},
	{
		"word":"Stuff",
		"regex": /stuff/ig
	},
	{
		"word":"Right",
		"regex": /right/ig
	},
	{
		"word":"You know",
		"regex": /you\s+know/ig
	},
	{
		"word":"I guess",
		"regex": /i\s+guess/ig
	},
	{
		"word":"Having said that",
		"regex": /having\s+said\s+that/ig
	},

	{
		"word": "I mean",
		"regex": /i\s+mean/ig
	},

	{
		"word": "Kind of",
		"regex": /kind\s+of/ig
	}
]

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Pitch Purfect' });
});

router.post('/analyze', function(req, res, next){
	var text = req.body.text
	console.log(text)
	var word_count = []
	for (w in filler_words) {
	 	var matchArray = text.match(filler_words[w].regex);
	 	
	 	if(matchArray){
	 		var wordVal = filler_words[w].word
	 		var obj = {
	 					"count":matchArray.length,
	 					"word":wordVal
	 				  }
	 		word_count.push(obj)
	 	} else {
	 		continue
	 	}
	}

	if(word_count.length){
		//arrange results in descending order - most used word to least
		word_count.sort(function(a,b){
			if(a.count > b.count){
				return -1;
			}

			if(a.count < b.count){
				return 1;
			}

			return 0
		})
	}

	//get date and write out speech to file
	var date = new Date()
	var writeToFile = date + "\n" + text + "\n\n";
	fs.appendFile('../speech-backups/speech.txt',writeToFile,function(err){
		console.log(err)
	})

	if(word_count.length > 0){
		res.render('result',{results:word_count,transcript:text});
	} else {
		res.render('noResult');
	}
	
})

module.exports = router;
