var Observable      = require("FuseJS/Observable");

var auth            = require("assets/js/auth");

var BASE_URL        = 'https://mastodon.social/';

function loadPosts( posttype, access_token ) {

  var endpoint = '';
  switch ( posttype ) {
    case 'home':
      endpoint = 'api/v1/timelines/home';
      break;
    case 'public':
    default:
      endpoint = 'api/v1/timelines/public';
      break;
  }

  console.log( 'LD1: ' + endpoint );

  var promise = new Promise( function( resolve, reject ) {

    console.log( 'LD2: ' + access_token );

    fetch( BASE_URL + endpoint, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json',
            'Authorization': 'Bearer ' + access_token
        }
    })
    .then( function( resp ) {
        console.log( 'LD3: ' + resp.status );
        if ( 200 == resp.status ) {
            console.log( 'LD3A' );
            return resp.json();
        } else {
            console.log( 'LD3B' );
            reject( Error( 'Netwerk error: cannot fetch posts (1003)' ) );
        }
    })
    .then( function( json ) {
      console.log( 'LD4' );
      resolve( json );
    })
    .catch( function( err ) {
      console.log( 'LD5' );
      reject( Error( 'Netwerk error: cannot fetch posts (1004)' ) );
    });
  });

  return promise;

}

function getAccessToken( auth_token ) {

  var promise = new Promise( function( resolve, reject ) {

    console.log( 'posting request for access_token' );

    fetch( BASE_URL + 'oauth/token', {
        method: 'POST',
        headers: {
            'Content-type'  : 'application/json',
            'grant_type'    : 'authorization_code',
            'code'          : auth_token,
            'redirect_uri'  : encodeURIComponent( auth.redirect_uri ),
            'client_id'     : auth.client_id,
            'client_secret' : auth.client_secret
        }
    })
    .then( function( resp ) {
        console.log( 'AT3: ' + resp.status );
        if ( 200 == resp.status ) {
            console.log( 'AT3A' );
            return resp.json();
        } else {
            console.log( 'AT3B' );
            reject( Error( 'Netwerk error: cannot fetch posts (1003)' ) );
        }
    })
    .then( function( json ) {
      console.log( 'AT4' );
      resolve( json );
    })
    .catch( function( err ) {
      console.log( 'AT5' );
      reject( Error( 'Netwerk error: cannot fetch posts (1004)' ) );
    });

  });

  return promise;

}

// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License

http://blog.stevenlevithan.com/archives/parseuri

function parseUri(str) {
	var	o   = parseUri.options,
		m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		uri = {},
		i   = 14;

	while (i--) uri[o.key[i]] = m[i] || "";

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri;
};

parseUri.options = {
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

module.exports = {
  loadPosts: loadPosts,
  parseUri: parseUri,
  getAccessToken: getAccessToken
}
