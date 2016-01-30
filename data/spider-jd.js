var spider = require('./spider');
var fs = require('fs');

// Use connect method to connect to the Server 
var mongoCache = new spider.MongoCache('mongodb://localhost:27017/jd-cache')
var jdSpider = spider({cache:mongoCache});
var counter = 0;
function toInnerText(el){
	if(el instanceof Array){
		return el.map(toInnerText).join('\n')
	}
	return el.innerHTML.replace(/<[^>]+?>|\s+/g,'');
}
jdSpider.route('www.jd.com', '/allSort.aspx', function (html, $) {
	$('.category-item').each(function(i,p){
		
		// dl dt,.category-item .items dl dd a
		var groupTitle =  toInnerText($('h2.item-title',p));
		var group = $('.items dl',p);
		console.log('groupTitle:',groupTitle)
		group.each(function(i,p){
			var rowTitle =  toInnerText($('dt',p));
			var rowTypes =  $('dd a',p);
			console.log('\t',rowTitle,'$',rowTypes.map(toInnerText).join(','))
		})
		//console.log(p+'$')
	})
	//console.log(html)
}).route('img13.360buyimg.com', '/*.jpg', function (html, $) {
	console.log('typeof result',typeof html)
	jdSpider.get('http://www.jd.com/allSort.aspx')
})
.log('debug').ok(function(){
	console.log('complete task!')
	mongoCache.close();
})//.get('http://so.gushiwen.org/view_11228.aspx')
//.get('http://www.jd.com/allSort.aspx')
.get('http://img13.360buyimg.com/n3/jfs/t2443/183/1103869869/171925/3884605e/566b87d7N2e5d3a59.jpg')
