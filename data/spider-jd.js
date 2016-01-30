var spider = require('./spider');
var fs = require('fs');

// Use connect method to connect to the Server 
var mongoCache = new spider.MongoCache('')
var authorSpider = spider({cache:mongoCache});
var counter = 0;
var authorExp = /作者：([\s\S]+)?(?:&nbsp;|\xa0){2}([\d\.]+)\((\d+)人评分\)/;
var authorMap = {};
//http://so.gushiwen.org/type.aspx?p=2
var start = +new Date;
var previousDate = +new Date();
var authorCount = 0;
//http://list.jd.com/list.html?cat=
authorSpider.route('list.jd.com', '/list.html?cat=*', function (html, $) {
	//if (this.fromCache) return;
	//console.log("Fetching page: %s, for the %s th time", this.spider.currentUrl, ++counter);
	// spider all genres
	var newAuthor = 0;
	$('div.sons>p:nth-of-type(2)').each(function(i,p){
		var authorLine = p.innerHTML;
		var match = authorExp.exec(authorLine);
		if(match){
			var n = match[1];
			var sorce = match[2] +'#'+ match[3];
			if(n in authorMap){
				//if(authorMap[n] .indexOf(sorce) == -1){
				//console.warn('author: rate changed:',n,sorce,authorMap[n])
				//}
			}else{
				newAuthor ++;
				authorCount++;
				authorMap[n] = sorce;
				authorSpider.get('http://so.gushiwen.org/search.aspx?type=author&page=1&value='+encodeURIComponent(n))
			}
			//console.log(n,sorce);
		}else{
			console.error('no valid author:',authorLine);
		}
	})
	
	//newAuthor && fs.writeFile('./author.json',JSON.stringify(authorMap),function(err){err && console.error(err)})
	// spider all numbered pages of letters per genre
	$('div.pages a').spider();
	var newDate = new Date();
	if(newDate - previousDate > 1000*60){
		console.log('author count:',authorCount, 'time passed:',(newDate - previousDate)/1000/60+'minute')
		previousDate =+newDate
	}
}).route('so.gushiwen.org','/search.aspx\\?type=author&page=*&value=*',function(html,$){
	$('div.pages a').spider();
	$('.sons a').spider()
}).route('so.gushiwen.org','/view_*.aspx',function(html,$){
	//$('div.pages a').spider();
	//console.log(html)
})
//
.log('info').ok(function(){
	console.log('complete task!')
	//左丘明
	fs.writeFile('./author.json',JSON.stringify(Object.keys(authorMap)),function(err){err && console.error(err)})
	mongoCache.close();
})//.get('http://so.gushiwen.org/view_11228.aspx')
.get('http://so.gushiwen.org/type.aspx?p=1')
