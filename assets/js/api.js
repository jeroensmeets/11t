var Observable      = require("FuseJS/Observable");

var BASE_URL        = 'https://mastodon.social/';

function loadPosts( posttype, access_token ) {

  var endpoint = '';
  switch ( posttype ) {
    case 'home':
      endpoint = '/api/v1/timelines/home';
      break;
    case 'public':
    default:
      endpoint = 'api/v1/timelines/public';
      break;
  }

  console.log( 'LD1' );

  var promise = new Promise( function( resolve, reject ) {

    console.log( 'LD2' );

    fetch( BASE_URL + endpoint, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json',
            'Authorization': 'Bearer ' + access_token
        }
    })
    .then( function( resp ) {
        console.log( 'LD3' );
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

// function getAccessToken( callback_succes, callback_error ) {
//
//   console.log( 'AT1' );
//
//   var promise = new Promise( function( resolve, reject ) {
//
//     // TODO check validity
//     if ( hasAccessToken() ) {
//       console.log( 'AT1B');
//       callback_succes;
//     }
//
//     console.log( 'AT2' );
//
//     fetch( BASE_URL + 'oauth/token', {
//         method: 'POST',
//         headers: { 'Content-type': 'application/json' },
//         body: JSON.stringify({ grant_type: 'client_credentials', client_id: auth.client_id, client_secret: auth.client_secret })
//     })
//     .then( function( resp ) {
//         console.log( 'AT3' );
//         if ( 200 == resp.status ) {
//           console.log( 'AT3A' );
//           return resp.json();
//         } else {
//             console.log( 'AT3B' );
//             callback_error( Error( 'Netwerk error: cannot fetch posts (1001)' ) );
//         }
//     })
//     .then( function( json ) {
//       console.log( 'AT4' );
//       // console.log( '-----' + json.access_token );
//       access_token.value = json.access_token;
//       callback_succes();
//     })
//     .catch( function( err ) {
//       console.log( 'AT5' );
//       callback_error( Error( 'Netwerk error: cannot fetch posts (1002)' ) );
//     });
//   });
//
//   console.log( 'AT6' );
//
//   return promise;
//
// }

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
  parseUri: parseUri
}
