var EventEmitter    = require("FuseJS/EventEmitter");
var Observable      = require("FuseJS/Observable");
var auth            = require("assets/js/auth");

var BASE_URL        = 'https://mastodon.social/';

function sendPost( _txt, _inreplyto, access_token ) {

  // POST /api/v1/statuses
  // Form data:
  //
  // status: The text of the status
  // in_reply_to_id (optional): local ID of the status you want to reply to
  // media_ids (optional): array of media IDs to attach to the status (maximum 4)

  return new Promise( function( resolve, reject ) {

    if ( '' == _txt ) {
      reject( Error( 'Post content empty (P001)' ) );
    }

    var _bodyArgs = {
        'status' : _txt
    };

    if ( _inreplyto > 0 )  {
      _bodyArgs.in_reply_to_id = _inreplyto;
    }

    fetch( BASE_URL + 'api/v1/statuses', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
            'Authorization': 'Bearer ' + access_token
        },
        body: JSON.stringify( _bodyArgs )
    })
    .then( function( resp ) {
        console.log( 'P2: ' + resp.status );
        if ( 200 == resp.status ) {
            console.log( 'P3A' );
            return resp.json();
        } else {
            console.log( 'P3B' );
            reject( Error( 'Netwerk error: cannot fetch posts (1003)' ) );
        }
    })
    .then( function( json ) {
      console.log( 'P4' );
      resolve( json );
    })
    .catch( function( err ) {
      console.log( 'P5' );
      reject( Error( 'Netwerk error: cannot fetch posts (1004)' ) );
    });
  });

}

function loadPosts( posttype, access_token, id ) {

  var endpoint = '';
  switch ( posttype ) {
    case 'home':
      endpoint = 'api/v1/timelines/home';
      break;
    case 'notifications':
      endpoint = '/api/v1/notifications';
      break;
    case 'user':
      endpoint = '/api/v1/accounts/' + id + '/statuses';
      break;
    case 'public':
    default:
      endpoint = 'api/v1/timelines/public';
      break;
  }

  console.log( 'LD1: ' + endpoint );

  return new Promise( function( resolve, reject ) {

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

}

function rePost( _postId, access_token, unRepost ) {

  if ( arguments.length < 3 ) {
    var unRepost = false;
  }

  var _apiAction = ( unRepost ) ? 'unreblog' : 'reblog';

  // create promise
  var repostEmitter = new EventEmitter( 'rePostEnded' );

  fetch( BASE_URL + 'api/v1/statuses/' + _postId + '/' + _apiAction, {
    method: 'POST',
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
      repostEmitter.emit( 'rePostEnded', { err: true } );
    }
  })
  .then( function( json ) {
    console.log( 'LD4' );
    repostEmitter.emit( 'rePostEnded', { err: false, post: json } );
  })
  .catch( function( err ) {
    console.log( 'LD5' );
    repostEmitter.emit( 'rePostEnded', { err: true } );
  });

  return repostEmitter.promiseOf( 'rePostEnded' );
}

function favouritePost( _postId, access_token, unFavourite ) {

  if ( arguments.length < 3 ) {
    var unFavourite = false;
  }

  var _apiAction = ( unFavourite ) ? 'unfavourite' : 'favourite';

  // create promise
  var favEmitter = new EventEmitter( 'favouritePostEnded' );

  console.log( 'favourite: ' + _postId + '/' + _apiAction );

  fetch( BASE_URL + 'api/v1/statuses/' + _postId + '/' + _apiAction, {
      method: 'POST',
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
          favEmitter.emit( 'favouritePostEnded', { err: true } );
      }
  })
  .then( function( json ) {
    console.log( 'LD4' );
    favEmitter.emit( 'favouritePostEnded', { err: false, post: json } );
  })
  .catch( function( err ) {
    console.log( 'LD5' );
    favEmitter.emit( 'favouritePostEnded', { err: true } );
  });

  return favEmitter.promiseOf( 'favouritePostEnded' );

}

function getAccessToken( auth_token ) {

  return new Promise( function( resolve, reject ) {

    console.log( 'posting request for access_token with auth_token ' + auth_token );

    var _headerArgs = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    var _bodyArgs = {
        'grant_type'    : 'authorization_code',
        // 'redirect_uri'  : encodeURIComponent( auth.redirect_uri ),
        'redirect_uri'  : auth.redirect_uri,
        'code'          : auth_token,
        'client_id'     : auth.client_id,
        'client_secret' : auth.client_secret
    };

    console.log( JSON.stringify( _bodyArgs ) );

    fetch( BASE_URL + 'oauth/token', {
        method: 'POST',
        headers: _headerArgs,
        body: JSON.stringify( _bodyArgs ),
        // body: _args
    })
    .then( function( resp ) {
        console.log( 'AT3: ' + resp.status );
        if ( 200 == resp.status ) {
            console.log( 'AT3A' );
            return resp.json();
        } else {
            console.log( 'AT3B' );
            console.log( JSON.stringify( resp ) );
            reject( Error( 'Netwerk error: cannot fetch posts (1003)' ) );
        }
    })
    .then( function( json ) {
      console.log( 'AT4' );
      console.log( json );
      resolve( json );
    })
    .catch( function( err ) {
      console.log( 'AT5' );
      reject( Error( 'Netwerk error: cannot fetch posts (1004)' ) );
    });

  });

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
  sendPost: sendPost,
  rePost: rePost,
  favouritePost: favouritePost,
  parseUri: parseUri,
  getAccessToken: getAccessToken
}
