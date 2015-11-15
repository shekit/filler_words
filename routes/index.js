var express = require('express');
var router = express.Router();
var fs = require('fs');

var filler_words = [
	{
		"word":"um",
		"regex": /mmm/ig
	},
	{
		"word":"ah",
		"regex":/ah/ig
	},
	{
		"word":"like",
		"regex": /like/ig
	},
	{
		"word":"ok",
		"regex": /ok/ig
	},
	{
		"word":"actually",
		"regex":/actually/ig
	},
	{
		"word":"basically",
		"regex": /basically/ig
	},
	{
		"word":"literally",
		"regex": /literally/ig
	},
	{
		"word":"seriously",
		"regex": /seriously/ig
	},
	{
		"word":"whatever",
		"regex": /whatever/ig
	},
	{
		"word":"stuff",
		"regex": /stuff/ig
	},
	{
		"word":"right",
		"regex": /right/ig
	},
	{
		"word":"you know",
		"regex": /you\s+know/ig
	},
	{
		"word":"i guess",
		"regex": /i\s+guess/ig
	},
	{
		"word":"having said that",
		"regex": /having\s+said\s+that/ig
	},

	{
		"word": "i mean",
		"regex": /i\s+mean/ig
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

	//get date and write out speech to file
	var date = new Date()
	var writeToFile = date + "\n" + text + "\n\n";
	fs.appendFile('../speech-backups/speech.txt',writeToFile,function(err){
		console.log(err)
	})

	if(word_count.length > 0){
		res.render('result',{results:word_count});
	} else {
		res.render('noResult');
	}
	
})

module.exports = router;
