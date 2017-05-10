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

function getYoutubeLinkFromText( _text ) {

	if ( 'string' != typeof _text ) {
		return '';
	}

	// http://stackoverflow.com/a/9102270
	var regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?\<]*).*/;
    var match = _text.match(regExp);
    return ( match && ( match.length > 2 ) ) ? 'https://www.youtube.com/embed/' + match[2] : '';

}

function timeSince( date ) {

	var minute = 6e1;
	var hour = 36e2;
	var day = 864e2;
	var week = 6048e3;
	var year = 31536e4;

	var seconds = Math.floor( ( new Date() - new Date( date ) ) / 1e3 );

	var result = '';

	if ( seconds < minute ) {
		result = seconds + 's';
	} else if ( seconds < hour ) {
		result = Math.floor( seconds / minute ) + 'm';
	} else if ( seconds < day ) {
		result = Math.floor( seconds / hour ) + 'h';
	} else if ( seconds < week ) {
		result = Math.floor( seconds / day ) + 'd';
	} else if ( seconds < year ) {
		result = Math.floor( seconds / week ) + 'w';
	} else {
		result = Math.floor( seconds / year ) + 'y';
	}

	return result;

}

module.exports = {
	parseUri: parseUri,
	getUrisFromText: getUrisFromText,
	timeSince: timeSince,
	getYoutubeLinkFromText: getYoutubeLinkFromText
}