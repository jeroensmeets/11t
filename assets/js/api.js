var helper			= require( 'assets/js/helper.js' );
var contentparser	= require( 'assets/js/parse.content.js' );

var FETCH_TIMEOUT	= 10000;

var Observable      = require("FuseJS/Observable");
var Storage         = require("FuseJS/Storage");
var EventEmitter    = require("FuseJS/EventEmitter");

var error 			= Observable( '' );
var returntosplash	= Observable( false );

var loading			= Observable( false );
var active			= Observable( false );

var HtmlEnt         = require( 'assets/js/he/he.js' );

var FILE_DATACACHE  = '.posts.cache.json';
var BASE_URL        = false;
var AccessToken     = false;
var at_file         = "APIconnect.json";

/**
 * variable to hold the loaded posts
 */
var posts = {
	home            : Observable(),
	notifications   : Observable(),
	publictimeline  : Observable(),
	favourites		: Observable(),
	hashtag			: Observable(),
	user            : Observable(),
	postcontext		: Observable()
}

function clearPostsObject() {

	for ( var index in posts ) {
		posts[ index ].clear();
		Storage.deleteSync( index + FILE_DATACACHE );
	}
}

/**
 * remove old cache files with different data structures
 */
function cleanUp() {

	// before version 1.0.12, datacache was in {posttype}.data.cache.json
	for ( var index in posts ) {
		Storage.deleteSync( index + '.data.cache.json' );
	}

}

function setError( message ) {
	error.value = message;
}

function clearError() {
	error.clear();
}

var userprofile = Observable();
var userrelationship = Observable();

/**
* load API accesstoken from storage and store it in helper.AccessToken
* returns true when accesstoken loaded, otherwise false
* 
* @return boolean
*/
function loadAPIConnectionData( ) {

	if ( ( false !== AccessToken ) && ( false !== BASE_URL ) ) {
		// no need to load connection settings, already set
		return true;
	}

	try {
		var data = Storage.readSync( at_file );
		data = JSON.parse( data );

		AccessToken = data.token;
		BASE_URL = data.baseurl;

		return ( false !== AccessToken ) && ( false !== BASE_URL );
	}
	catch( e ) {
		return false;
	}

	return false;

}

/* same as loadAPIConnectionData(), just async */
function loadAPIConnectionDataAsync( ) {

	// create promise
	var lacdaEmitter = new EventEmitter( 'loadAPIConnectionDataAsyncEnded' );

	Storage.read( at_file ).
		then(

			// success
			function( data ) {

				data = JSON.parse( data );

				if ( ( 'undefined' !== data.token ) && ( 'undefined' !== data.baseurl ) ) {

					AccessToken = data.token;
					BASE_URL = data.baseurl;

					lacdaEmitter.emit( 'loadAPIConnectionDataAsyncEnded', 'ok' );

				} else {

					lacdaEmitter.emit( 'loadAPIConnectionDataAsyncEnded', 'API connection data not correctly read from storage.' );

				}
			},

			// error reading file data
			function( error ) {
				lacdaEmitter.emit( 'loadAPIConnectionDataAsyncEnded', 'error ' + JSON.stringify( error ) );
			}

	);

	return lacdaEmitter.promiseOf( 'loadAPIConnectionDataAsyncEnded' );

}

/**
 * @param  {string} accesstoken to save
 * @return {boolean} success
 */
function saveAPIConnectionData( base_url, clientid, clientsecret, token ) {

	BASE_URL = base_url;
	AccessToken = token;

	var data = {
		baseurl			: base_url,
		clientid		: clientid,
		clientsecret	: clientsecret,
		token			: token
	}
	// console.log( 'saving connection data', JSON.stringify( data ) );
	return Storage.writeSync( at_file, JSON.stringify( data ) );
}

function deleteAPIConnectionData() {

	return Storage.deleteSync( at_file );

}

function getInstanceInfo() {

	return new Promise( function( resolve, reject ) {

		apiFetch( 'api/v1/instance', {} )
		.then( function( json ) {

			resolve( json );

		})
		.catch( function( err ) {

			reject( err );

		});

	});

}

/**
 * @param  {string}		baseurl		url to Mastodon site
 * @return {array}		{ id: [string], secret: [string] }
 */
function getClientIdSecret() {

	return new Promise( function( resolve, reject ) {

		var conf = require( 'assets/js/conf' );

		if ( false === BASE_URL ) {
			reject( Error( 'base url not set' ) );
		}

		apiFetch( 'api/v1/apps', {
			method: 'POST',
			body: {
				'client_name'	: '11t',
				'redirect_uris'	: conf.redirect_uri,
				'scopes'		: 'read write follow'
			}
		} )
		.then( function( json ) {

			// save client id and secret
			// TODO use these when token has expired
			saveAPIConnectionData( BASE_URL, json.client_id, json.client_secret, false );

			resolve( { id: json.client_id, secret: json.client_secret, baseurl: BASE_URL } );

		})
		.catch( function( err ) {

			reject( Error( 'Netwerk error: cannot get client id/secret' ) );

		});

	});

}

function logOut() {

	deleteAPIConnectionData();
	clearPostsObject();

	BASE_URL = false;
	AccessToken = false;

}

/**
 * @param  {string}		base_url		base url of Mastodon instance
 * @param  {string}		client_id		client id for oAuth
 * @param  {string}		client_secret	client secret for oAuth
 * @param  {string}		email			email address for login
 * @param  {string}		password		password for login
 * @return {array}		(json)			
 */
function getAccessToken( auth_token, redirect_uri, client_id, client_secret ) {

	return apiFetch( 'oauth/token', {

		method: 'POST',
		body: {
			'grant_type'    : 'authorization_code',
			'redirect_uri'  : redirect_uri,
			'code'          : auth_token,
			'client_id'     : client_id,
			'client_secret' : client_secret
	    }

	} );

}

/**
 * @param {string}	_type	which timeline to set and load
 *
 * set active timeline and load it from cache
 * load it from API after 3 seconds
 * 
 */
function setActiveTimeline( timelineType, loadFromAPI ) {

	console.log( 'setting timeline to ' + timelineType );

	active.value = timelineType;
	loadCurrentTimelineFromCache();

	var cacheEmpty = posts[ timelineType ] && ( posts[ timelineType ].length == 0 );

	if ( loadFromAPI || cacheEmpty ) {

		loadCurrentTimelineFromAPI();

	}

	// formally not correct, as we don't know if API calls went ok
	return true;

}

function loadCurrentTimelineFromAPI() {

	loadAPIConnectionData();

	// if ( false === BASE_URL || false === AccessToken ) {
	// 	error.value = 'You\'re not logged in.';
	// 	returntosplash.value = true;
	// }

	if ( loading.value ) {
		// api is already out to fetch posts
		return;
	}

	if ( false === active.value ) {
		// probably a reload in FuseTools preview
		setActiveTimeline( 'home' );
		return;
	}

	loadTimeline( active.value );

}

function loadCurrentTimelineFromCache() {

	Storage.read( active.value + FILE_DATACACHE )
    .then( function( fileContents ) {
        refreshPosts( active.value, JSON.parse( fileContents ) );
    }, function( error ) {
        // error in reading from cache
    });

}

/**
 * load timeline (of type _type), store posts in cache and refresh the api.posts object
 * 
 * @param  {string}		_type		which timeline to load
 * @param  {integer}	_id			userid when _type is `user`, or postid when _type is `postcontext`
 * @param  {object}		_postObj	post shown in PostContext screen
 * @return no return value
 */
function loadTimeline( _type, _id, _postObj ) {

	if ( undefined === posts[ _type ] ) {
		// TODO probably triggered by splash screen
		return;
	}

	loading.value = true;
	loadAPIConnectionData();

	var endpoint = '';
	switch ( _type ) {
		case 'home':
			endpoint = 'api/v1/timelines/home';
			break;
		case 'notifications':
			endpoint = 'api/v1/notifications';
			break;
		case 'favourites':
			endpoint = 'api/v1/favourites';
			break;
		case 'hashtag':
			posts.hashtag.clear();
			Storage.deleteSync( _type + FILE_DATACACHE );
			endpoint = 'api/v1/timelines/tag/' + _id;
			break;
		case 'user':
			posts.user.clear();
			Storage.deleteSync( _type + FILE_DATACACHE );
			endpoint = 'api/v1/accounts/' + _id + '/statuses';
			break;
		case 'postcontext':
			endpoint = 'api/v1/statuses/' + _id + '/context';
			break;
		case 'publictimeline':
		default:
			endpoint = 'api/v1/timelines/public?local=true';
			break;
	}

	apiFetch(
		endpoint, {
		headers: { 'Authorization': 'Bearer ' + AccessToken }
	} )
	.then( function( json ) {

		// for postcontext, the Mastodon API returns two arrays with ancestors and descendants
		if ( 'postcontext' == _type ) {
			json.ancestors.push( _postObj );
			json = json.ancestors.concat( json.descendants );
			json[ json.length - 1 ][ 'last' ] = true;
		}

		// // save new data to cache
		// var _cache = Storage.readSync( _type + FILE_DATACACHE );
		// var _posts = ( '' == _cache ) ? [] : JSON.parse( _cache );

		// console.log( 'size of array from cache is ' + _posts.length );
		// // console.log( JSON.stringify( _posts ) );
		// console.log( 'size of array from api is ' + json.length );
		// // console.log( JSON.stringify( json ) );

		// // Array.prototype.push.apply( _posts, json );
		// _posts = _posts.concat( json );
		// Storage.write( _type + FILE_DATACACHE, JSON.stringify( _posts ) );

		// // TODO limit size of cache
		// console.log( 'size of posts array is now ' + _posts.length );
		// // console.log( JSON.stringify( _posts ) );

		// posts loaded, refresh timeline
		refreshPosts( _type, json );

		loading.value = false;

	} )
	.catch( function( err ) {
		console.log( 'returned from apiFetch back in api.loadTimeline with error: ' );
		console.log( err.message );
		loading.value = false;
	});

}

function refreshPosts( posttype, jsondata ) {

	posts[ posttype ].refreshAll(
		jsondata,
		// compare on ID
		function( oldItem, newItem ) {
			return oldItem.id == newItem.id;
		},
		// update
		function( oldItem, newItem ) {
			oldItem = new MastodonPost( newItem );
		},
		// add new
		function( newItem ) {
			return new MastodonPost( newItem );
		}
	);

}

function MastodonPost( jsondata ) {

	// in status is the core post itself
	this.status = jsondata;
	this.accountData = jsondata.account;
	this.rebloggerId = 0;

	if ( 'undefined' != typeof jsondata.type ) {

		this.type = jsondata.type;

		if ( 'follow' == jsondata.type ) {

			// for a follow notification, we need account data and bio
			this.clickableBio = contentparser.clickableBio( jsondata.account.note );
			return;

		} else {

			// this is for mentions, repost/favourite notifications
			this.status = jsondata.status;

		}

	} else if ( null != jsondata.reblog ) {

		// this is a reblog (not the notification, but in the main timelines)
		this.status = jsondata.reblog;
		this.accountData = jsondata.reblog.account;

		this.rebloggerId = jsondata.account.id;
		this.rebloggerName = jsondata.account.display_name;

	}

	this.postid = this.status.id;
	this.userid = this.status.account.id;
	this.username = this.status.account.acct;
	this.createat = this.status.created_at;

	this.mentions = this.status.mentions;

	this.cleanContent = contentparser.cleanContent( this.status );
	this.clickableContent = contentparser.clickableContent( this.status );

	this.hascontent = this.cleanContent.length > 0 || ( '' != this.status.spoiler_text );

}

/**
 * @param  {integer}	_userid		user to load profile for
 * @return none
 */
function loadUserProfile( _userid ) {

	userprofile.clear();
	userrelationship.clear();
	loading.value = true;

	apiFetch( 'api/v1/accounts/' + _userid, {
		headers: {
			'Authorization': 'Bearer ' + AccessToken
		}
  	})
	.then( function( json ) {
		var _userprofile = json;
		_userprofile.note = HtmlEnt.decode( _userprofile.note );
		_userprofile.note = _userprofile.note.replace( /<[^>]+>/ig, '' );
		userprofile.value = _userprofile;
	})
	.catch( function( err ) {
		loading.value = false;
  	});

	// console.log( 'get relationship (async) for user ' + _userid );

	apiFetch( 'api/v1/accounts/relationships?id=' + _userid, {
		headers: {
			'Authorization': 'Bearer ' + AccessToken
		}
  	})
	.then( function( json ) {
		// {"id":54837,"following":false,"followed_by":false,"blocking":false,"muting":false,"requested":false}
		// console.log( JSON.stringify( json ) );
		// if ( json.length > 0 ) {
			userrelationship.value = json.shift();
			// console.log( 'response from API for relationship: ' + JSON.stringify( userrelationship.value ) );
		// }
	})
	.catch( function( err ) {
		loading.value = false;
  	});

}

function followUser( _userid, _isfollowing ) {

	return new Promise( function( resolve, reject ) {

		var followAction = _isfollowing ? 'unfollow' : 'follow';
		apiFetch( 'api/v1/accounts/' + _userid + '/' + followAction, {
			method: 'POST',
			headers: {
				Authorization: 'Bearer ' + AccessToken
			}
		} )
		.then( function( json ) {
			// console.log( 'api call to ' + followAction + ' user ' + _userid + ' returned with response: ' + JSON.stringify( json ) );
			resolve( json );
		})
		.catch( function( err ) {
			reject( err );
		});

	} );

}

function getReports() {

	loadAPIConnectionData();

	// let's try getting reports
	apiFetch( 'api/v1/reports', {
		headers: {
			Authorization: 'Bearer ' + AccessToken
		}
	} ).then( function( json ) {
		console.log( JSON.stringify( json ) );
	} );

}

function sendReport( uid, pid, commenttxt ) {

	loadAPIConnectionData();

	return new Promise( function( resolve, reject ) {

		apiFetch( 'api/v1/reports', {
			method: 'POST',
			headers: {
				Authorization: 'Bearer ' + AccessToken
			},
			body: {
				account_id	: uid,
				status_ids	: [ pid ],
				comment		: commenttxt
			}
		} )
		.then( function( json ) {
			console.log( 'api call to report user ' + uid + ' for post ' + pid + ' returned with response: ' + JSON.stringify( json ) );
			resolve( json );
		})
		.catch( function( err ) {
			console.log( err.message );
			reject( err );
		});

	} );

}


/**
 * @param  {string}		_txt			text of post
 * @param  {int}		_inreplyto		id of post this is a reply to
 * @param  {array}		_media_ids		array of attached (and already uploaded) media ids
 * @param  {boolean}	_private		is post private?
 * @param  {boolean}	_hidepublic		hide post from public timelines
 * @param  {boolean} 	_issensitive	set sensitive property
 * @param  {string}		_spoilertxt		txt to use as spoiler warning
 * 
 * @return {promise}	resolves error or json for new post
 */
function sendPost( _txt, _inreplyto, _media_ids, _private, _hidepublic, _issensitive, _spoilertxt ) {

	return new Promise( function( resolve, reject ) {

		if ( '' == _txt ) {
			reject( Error( 'Post content empty (P001)' ) );
		}

		var _bodyArgs = {};

		_bodyArgs.status = _txt;

		if ( _inreplyto > 0 )  {
			_bodyArgs.in_reply_to_id = _inreplyto;
		}

		if ( _media_ids.length > 0 ) {
			_bodyArgs.media_ids = _media_ids;
		}

		if ( _hidepublic ) {
			_bodyArgs.visibility = 'unlisted';
		}

		if ( _private ) {
			_bodyArgs.visibility = 'private';
		}

		if ( _issensitive ) {
			_bodyArgs.sensitive = true;
		}

		if ( '' != _spoilertxt ) {
			_bodyArgs.spoiler_text = _spoilertxt;
		}

		fetch( BASE_URL + 'api/v1/statuses', {
			method: 'POST',
			headers: {
				'Content-type': 'application/json',
				'Authorization': 'Bearer ' + AccessToken
			},
			body: JSON.stringify( _bodyArgs )
		})
		.then( function( resp ) {

			if ( 200 == resp.status ) {
				return resp.json();
			} else {
				reject( Error( 'Netwerk error: cannot fetch posts (1003)' ) );
			}
		})
		.then( function( json ) {
			resolve( json );
		})
		.catch( function( err ) {
			console.log( JSON.stringify( err ) );
			reject( Error( 'Netwerk error: cannot fetch posts (1004)' ) );
		});
	});

}

function sendImage( _imgObj ) {

	var Uploader = require("Uploader");
	return Uploader.send(
		_imgObj.path,
		BASE_URL + 'api/v1/media',
		AccessToken
	);

}

function favouritePost( _postid, _currentstatus ) {

	// create promise
	var favEmitter = new EventEmitter( 'favouritePostEnded' );
	var _apiAction = ( _currentstatus ) ? 'unfavourite' : 'favourite';

	apiFetch( 'api/v1/statuses/' + _postid + '/' + _apiAction, {
		method: 'POST',
		headers: { 'Authorization': 'Bearer ' + AccessToken }
	})
	.then( function( json ) {

		favEmitter.emit( 'favouritePostEnded', { err: false, post: json } );

	})
	.catch( function( err ) {

		favEmitter.emit( 'favouritePostEnded', { err: true } );

	});

	return favEmitter.promiseOf( 'favouritePostEnded' );

}

function rePost( _postid, _currentstatus ) {

	var _apiAction = ( _currentstatus ) ? 'unreblog' : 'reblog';

	// create promise
	return new Promise( function( resolve, reject ) {

		apiFetch( 'api/v1/statuses/' + _postid + '/' + _apiAction, {
			method: 'POST',
			headers: { 'Authorization': 'Bearer ' + AccessToken }
		})
		.then( function( json ) {
			resolve();
		})
		.catch( function( err ) {
			reject( err );
		});

	});

}

function loadPostContext( post ) {

	posts.postcontext.clear();

 	loadTimeline( 'postcontext', post.id, post );

}

function getPostById( _postid ) {

	// if a post is requested, it should be in one of the posts observables
	// TODO: get the current route, that would be the most obvious suspect where to find the post
	for ( var _i in posts ) {
		// TODO why doesn't this return the post we look for?
		// var _found = posts[ _i ].where( { id: _postid } );
		// console.log( _found.length );
		// if ( _found.length > 0 ) {
		//   return _found.first().value;
		// }
		var _arr = posts[ _i ].toArray();
		for ( var _j in _arr ) {
			if ( _postid == _arr[ _j ].id ) {
				return _arr[ _j ];
			}
		}
	}

	return false;
}


module.exports = {
	posts: posts,
	userprofile: userprofile,
	userrelationship: userrelationship,
	followUser: followUser,
	loadTimeline: loadTimeline,
	loadUserProfile: loadUserProfile,
	loadPostContext: loadPostContext,
	loading: loading,
	error: error,
	setError: setError,
	clearError: clearError,
	returntosplash: returntosplash,
	setActiveTimeline: setActiveTimeline,
	loadCurrentTimelineFromAPI: loadCurrentTimelineFromAPI,
	loadCurrentTimelineFromCache: loadCurrentTimelineFromCache,
	getClientIdSecret: getClientIdSecret,
	loadAPIConnectionData: loadAPIConnectionData,
	loadAPIConnectionDataAsync: loadAPIConnectionDataAsync,
	saveAPIConnectionData: saveAPIConnectionData,
	getAccessToken: getAccessToken,
	getInstanceInfo: getInstanceInfo,
	sendImage: sendImage,
	sendPost: sendPost,
	sendReport: sendReport,
	favouritePost: favouritePost,
	rePost: rePost,
	parseUri: helper.parseUri,
	cleanUp: cleanUp,
	logOut: logOut,

	MastodonPost: MastodonPost
}

// https://www.fusetools.com/docs/backend/rest-apis
function apiFetch( path, options ) {

	var url = encodeURI( BASE_URL + path );

	if ( options === undefined ) {
		options = {};
	}

	// If a body is provided, serialize it as JSON and set the Content-Type header
	if ( undefined !== options.body ) {

		options = Object.assign( {}, options, {
			body: JSON.stringify( options.body ),
			headers: Object.assign( {}, options.headers, {
				"Content-Type": "application/json"
			} )
		} );

	}

	console.log( 'sending request to ' + url );
	console.log( ' ----- options ----- ' );
	console.log( JSON.stringify( options ) );
	console.log( ' ------------------- ' );

	// fetch has no timeout, wrap it in a promise
	// https://www.fusetools.com/community/forums/show_and_tell/fetch_timeout
	return new Promise( function( resolve, reject ) {

		var timeout = setTimeout(function() {
			console.log( 'timeout' );
			reject( new Error( 'Request timed out' ) );
		}, FETCH_TIMEOUT );

		fetch( url, options )
			.then( function( response ) {

				clearTimeout( timeout );
				if ( response && 200 == response.status ) {
					console.log( 'apiFetch returned with status 200' );
					return response.json();
				} else if ( 401 == response.status ) {
					console.log( 'received a 401 from API' );
					logOut();
					reject( '401 not authorized' );
				} else {
					console.log( 'apiFetch error for path ' + path );
					console.log( JSON.stringify( response ) );
					reject( 'API error: status ' + response.status );
				}
			} )
			.then( function( responseObject ) {
				// process results
				console.log( 'return response object' );
				resolve( responseObject );
			})
			.catch( function( err ) {
				clearTimeout( timeout );
				console.log( 'error: ' + err.message );
				reject( err );
			});

	});

}