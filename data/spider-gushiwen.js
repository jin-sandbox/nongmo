var spider = require('./spider');
var fs = require('fs');

// Use connect method to connect to the Server 
var mongoCache = new spider.MongoCache('mongodb://localhost:27017/wwnm-gushiwen')
var authorSpider = spider({cache:mongoCache});
var counter = 0;
var authorExp = /作者：([\s\S]+)?(?:&nbsp;|\xa0){2}([\d\.]+)\((\d+)人评分\)/;
var authorMap = {};
//http://so.gushiwen.org/type.aspx?p=2
var start = +new Date;
var previousDate = +new Date();
var authorCount = 0;
authorSpider.route('so.gushiwen.org', '/type.aspx\\?p=*', function (html, $) {
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
	var c1 = $('div.pages a').spider();
	var c2 = $('.sons a').spider();
	if(c1==0 || c2 ==0){
		console.log('无作品：',this.url.href);//,$('.sons a').map(function(e){return e.getAttribute('href')+e}))
	}
}).route('so.gushiwen.org','/view_*.aspx',function(html,$){
	$('.shileft .son5 a').spider();
	var mp3div = $('.langsong')[0];
	if(mp3div){
		var params = $("#dewplayer_content object param[name='movie']",mp3div)[0];
		//<param name="movie" value="/song/dewplayer.swf?id=71138" />
		var id = params.getAttribute('value').replace(/.*id=/,'');
		///song/author/jiangweiwei.aspx
		var author = $('.langRgiht a',mp3div)[0].getAttribute('href').replace(/.*\/|.aspx$/g,'');
		var mp3 = 'http://song.gushiwen.org/mp3/'+author+'/'+id+'.mp3'
		//console.log(mp3)
		authorSpider.get(mp3);
	}
	//
	//console.log(html)
}).route('so.gushiwen.org','/shangxi_*.aspx',function(html,$){
	
}).route('so.gushiwen.org','/author_*.aspx',function(html,$){
	console.log(this.url.href,$(".shileft img[src^='http://img.gushiwen.org/authorImg/']").length)
	$(".shileft img[src^='http://img.gushiwen.org/authorImg/']").spider();
}).route('song.gushiwen.org','/mp3/**.mp3',function(html,$){
	console.log('mp3',typeof html)
}).route('img.gushiwen.org','/authorImg/*',function(html,$){
	console.log('img',typeof html)
})
//
.log('info').ok(function(){
	console.log('complete task!')
	//左丘明
	fs.writeFile('./author.json',JSON.stringify(Object.keys(authorMap)),function(err){err && console.error(err)})
	mongoCache.close();
})
//.get('http://so.gushiwen.org/view_49436.aspx')
.get('http://so.gushiwen.org/type.aspx?p=1')
