function getTestData1()  {
	return [
		{"sessionId":"OQnR00HWkQbt1eeTT-YR6QD","operation":"Start|initial","referer":"null","userAgent":"Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)","deviceUserAgent":"Mozilla/4.0 (compatible; MSIE 6.0;","parameters":{"method":"GET"}}
		,{"sessionId":"2GZgST0Jw8AN95-1bUH8BYF","operation":"Start|forward","referer":"null","userAgent":"Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)","deviceUserAgent":"Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)","parameters":{"method":"GET","bbts":"[2096]"}}
		,{"sessionId":"g465k2_ExXKbmkP4_QIDh6n","operation":"Start|blank","referer":"null","userAgent":"Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)","deviceUserAgent":"Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)","parameters":{"method":"GET","superNum":"[000000155_8]","event":"[continue]"}}
		,{"sessionId":"bcz3V8xDRzBs5j3-bD4sevr","operation":"Start|initial","referer":"null","userAgent":"Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)","deviceUserAgent":"Mozilla/4.0 (compatible; MSIE 6.0;","parameters":{"method":"GET"}}
		,{"sessionId":"Ii4v2-oDG8uZ4HFwO8WZifa","operation":"Start|blank","referer":"null","userAgent":"Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)","deviceUserAgent":"Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)","parameters":{"method":"GET","superNum":"[000002134_12]","event":"[continue]"}}
		,{"sessionId":"meL7xpX_96gPX-IJVW9uy0B","operation":"Start|initial","referer":"null","userAgent":"Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)","deviceUserAgent":"Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)","parameters":{"method":"GET","superNum":"[000000525_5]","event":"[continue]"}}
		,{"sessionId":"QrEBhyc5OQ1oiFyip_bNQYt","operation":"Start|initial","referer":"null","userAgent":"Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)","deviceUserAgent":"Mozilla/4.0 (compatible; MSIE 6.0;","parameters":{"method":"GET"}}
		,{"sessionId":"5VVrizUg2WRyTe1rfinCEo9","operation":"Start|blank","referer":"null","userAgent":"Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)","deviceUserAgent":"Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)","parameters":{"method":"GET","superNum":"[19900]","event":"[continue]"}}
		,{"sessionId":"Ul2j6PcWsvNGoNxJkmco3F2","operation":"Start|initial","referer":"null","userAgent":"Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)","deviceUserAgent":"Mozilla/4.0 (compatible; MSIE 6.0;","parameters":{"method":"GET"}}
		,{"sessionId":"rndGN3H3F2_6tIiyDwUCgxQ","operation":"Start|initial","referer":"null","userAgent":"Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)","deviceUserAgent":"Mozilla/4.0 (compatible; MSIE 6.0;","parameters":{"method":"GET"}}
	];
};

var test1Output;
function runTest1() {
	var rv;
	var textValue = $("#textarea_test1").val();
	try {
		rv = new Population(JSON.parse(textValue));
	} catch (e) {
		// Huh - try parsing each row individually
		rv = new Population();
		var valArray = textValue.split("\n");
		for (var i = 0; i<valArray.length; i++) {
			try {
				val = JSON.parse(valArray[i]);
				rv.addIndividual(val);
			} catch (e2) {}
		}
	}
	console.debug(rv);
};

jQuery(function() {
	$("#textarea_test1").val(JSON.stringify(getTestData1()));
});
