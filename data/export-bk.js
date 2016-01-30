//var sqlite = require('sqlite3');
var fs = require('fs');
var index = '/Users/jinjinyun/Downloads/lemma_index.db';
var data = '/Users/jinjinyun/Downloads/lemma_data';

var start = 404455;
var bytes = 2429
fs.open(data, 'r', function(err,fd){
	var buffer = new Buffer(bytes);
	fs.read(fd, buffer, 0, bytes, start, function(err,bytesRead,buf){
		//3401	3401			东方神起	东方神起				20130411120311
		console.log(buf.toString())
	})
})

//sqlite.open(indexdb, { verbose: true }).catch(function(err){ console.error(err)}).finally(function(){});