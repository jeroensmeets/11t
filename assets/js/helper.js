// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License

http://blog.stevenlevithan.com/archives/parseuri

function parseUri(str) {
	var o = {
		strictMode: false,
		key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
		q:   {
			name:   "queryKey",
			parser: /(?:^|&)([^&=]*)=?([^&]*)/g
		},
		parser: {
			strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
			loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
		}
	};
	m = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
	uri = {},
	i = 14;

	while (i--) uri[o.key[i]] = m[i] || "";

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri;
};

function getUrisFromText( _text ) {

	// temporary replace urls to prevent splitting on spaces in linktext
	var regex = /<[aA].*?\s+href=["']([^"']*)["'][^>]*>(?:<.*?>)*(.*?)(?:<.*?>)?<\/[aA]>/igm ;
	return _text.match( regex );

}

function timeSince(date) {

	var seconds = Math.floor( ( new Date() - new Date( date ) ) / 1000 );

	var interval = Math.floor(seconds / 31536000);
	if (interval > 1) { return interval + "y"; }

	interval = Math.floor(seconds / 2592000);
	if (interval > 1) { return interval + "m"; }

	interval = Math.floor(seconds / 86400);
	if (interval > 1) { return interval + "d"; }

	interval = Math.floor(seconds / 3600);
	if (interval > 1) { return interval + "h"; }

	interval = Math.floor(seconds / 60);
	if (interval > 1) { return interval + "m"; }

	return Math.floor(seconds) + "s";

}

module.exports = {
	parseUri: parseUri,
	getUrisFromText: getUrisFromText,
	timeSince: timeSince
}