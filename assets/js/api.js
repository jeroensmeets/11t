var helper			= require( 'Assets/js/helper.js' );
var contentparser	= require( 'Assets/js/parse.content.js' );

var FETCH_TIMEOUT	= 6000;

var Observable      = require("FuseJS/Observable");
var Storage         = require("FuseJS/Storage");
var EventEmitter    = require("FuseJS/EventEmitter");

var error 			= Observable( '' );
var returntosplash	= Observable( false );

var loading			= Observable( false );

var HtmlEnt         = require( 'Assets/js/he/he.js' );

var FILE_DATACACHE  = '.posts.cache.json';
var BASE_URL        = false;
var AccessToken     = false;
var at_file         = "APIconnect.json";

function setError( message ) {
	error.value = message;
}

function clearError() {
	error.clear();
}

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

		var conf = require( 'Assets/js/conf' );

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

function loadTimelineFromCache( timeline ) {

	return new Promise( function( resolve, reject ) {

		Storage.read( timeline + FILE_DATACACHE )
		.then( function( fileContents ) {

			var cacheContents = JSON.parse( fileContents );
			if ( cacheContents.posts && cacheContents.max_id && cacheContents.since_id ) {
				resolve( JSON.parse( fileContents ) );
			} else {
				// old format cache, delete it
				deleteTimelineFromCache( timeline );
				resolve( [] );
			}
		}, function( error ) {
			reject( error );
		} );

	} );

}

function saveTimelineToCache( timeline, posts ) {

	Storage.write( timeline + FILE_DATACACHE, JSON.stringify( posts ) );

}

function deleteTimelineFromCache( timeline ) {

	Storage.deleteSync( timeline + FILE_DATACACHE );

}

/**
 * load timeline (of type _type), store posts in cache and refresh the api.posts object
 * 
 * @param  {string}		type		which timeline to load
 * @param  {integer}	id			since_id or max_id
 * @param  {boolean}	loadprev	go back or forth in loading
 * @return no return value
 */
function loadTimeline( _type, _id, _loadprev ) {

	loadAPIConnectionData();

	var endpoint = '';
	switch ( _type ) {
		case 'home':
			endpoint = 'api/v1/timelines/home';
			if ( parseInt( _id ) > 0 ) {
				if ( _loadprev ) {
					endpoint += '?max_id=' + _id;
				} else {
					endpoint += '?since_id=' + _id;
				}
			}
			console.log( endpoint );
			break;
		case 'notifications':
			endpoint = 'api/v1/notifications';
			break;
		case 'favourites':
			endpoint = 'api/v1/favourites';
			break;
		case 'hashtag':
			endpoint = 'api/v1/timelines/tag/' + _id;
			break;
		case 'publictimeline':
		default:
			endpoint = 'api/v1/timelines/public?local=true';
			break;
	}

	return new Promise( function( resolve, reject ) {

		apiFetch(
			endpoint, {
			headers: { 'Authorization': 'Bearer ' + AccessToken }
		} )
		.then( function( json ) {

			resolve( json );

		}, function( err ) {

			console.log( 'returned from apiFetch back in api.loadTimeline with error: ' );
			console.log( err.message );
			reject( err );

		} );

	} );

}

/**
 * load notifications
 * 
 * @param  {integer}	id			since_id or max_id
 * @param  {boolean}	loadprev	go back or forth in loading
 * @return no return value
 */
function loadNotifications( _id, _loadprev ) {

	loadAPIConnectionData();

	var endpoint = 'api/v1/notifications';
	if ( parseInt( _id ) > 0 ) {
		if ( _loadprev ) {
			endpoint += '?max_id=' + _id;
		} else {
			endpoint += '?since_id=' + _id;
		}
	}

	return new Promise( function( resolve, reject ) {

		apiFetch(
			endpoint, {
			headers: { 'Authorization': 'Bearer ' + AccessToken }
		} )
		.then( function( json ) {

			resolve( json );

		}, function( err ) {

			console.log( 'returned from apiFetch back in api.loadNotifications with error: ' );
			console.log( err.message );
			reject( err );

		} );

	} );

}

/**
 * load user timeline, store posts in cache and refresh the api.posts object
 * 
 * @param  {integer}	id			userid
 * @return no return value
 */
function loadUserTimeline( _id ) {

	loadAPIConnectionData();

	var endpoint = 'api/v1/accounts/' + _id + '/statuses';

	return new Promise( function( resolve, reject ) {

		apiFetch(
			endpoint, {
			headers: { 'Authorization': 'Bearer ' + AccessToken }
		} )
		.then( function( json ) {

			resolve( json );

		}, function( err ) {

			console.log( 'returned from apiFetch back in api.loadUserTimeline with error: ' );
			console.log( err.message );
			reject( err );

		} );

	} );

}

/**
 * load post context
 * 
 * @param  {integer}	id			postid
 * @return 							json
 */
function loadPostcontext( _id ) {

	loadAPIConnectionData();

	var endpoint = 'api/v1/statuses/' + _id + '/context';

	return new Promise( function( resolve, reject ) {

		apiFetch(
			endpoint, {
			headers: { 'Authorization': 'Bearer ' + AccessToken }
		} )
		.then( function( json ) {

			resolve( json );

		}, function( err ) {

			console.log( 'returned from apiFetch back in api.loadPostcontext with error: ' );
			console.log( err.message );
			reject( err );

		} );

	} );

}

/**
 * a MastodonPost is an object with these values
 *
 * status: the post that is being shared, favourited, reblogged. if this is a notification of a new follower, status is null
 * account: data for the account that is displayed with an avatar for this post
 * type: type of notification
 * rebloggerId, rebloggerName: who reblogged this post (this is for the timelines, not for notifications)
 * mentions: array of mentions
 * media_attachments: array of attachments
 * cleanContent: content in paragraphs
 * clickableContent: content split in words
 * 
 */

function MastodonPost( jsondata ) {

	// in status is the core post itself
	this.status = jsondata;
	this.account = jsondata.account;
	this.rebloggerId = 0;
	this.rebloggerName = '';

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
		this.account = jsondata.reblog.account;

		this.rebloggerId = jsondata.account.id;
		this.rebloggerName = jsondata.account.display_name;

	}

	this.mentions = this.status.mentions;
	this.media_attachments = this.status.media_attachments;

	this.cleanContent = contentparser.cleanContent( this.status );
	this.clickableContent = contentparser.clickableContent( this.status );

	// console.log( JSON.stringify( this.status ) );

}

/**
 * @param  {integer}	userid		user to load profile for
 * @return none
 */
function getUserProfile( userid ) {

	loadAPIConnectionData();

	return new Promise( function( resolve, reject ) {

		apiFetch( 'api/v1/accounts/' + userid, {
			headers: {
				'Authorization': 'Bearer ' + AccessToken
			}
		} )
		.then( function( json ) {
			var userprofile = json;
			userprofile.note = HtmlEnt.decode( userprofile.note );
			userprofile.note = userprofile.note.replace( /<[^>]+>/ig, '' );
			resolve( userprofile );
		} )
		.catch( function( err ) {
			reject( err );
		} );

	} );
}

function getRelationship( userid ) {

	loadAPIConnectionData();

	return new Promise( function( resolve, reject ) {

		apiFetch( 'api/v1/accounts/relationships?id=' + userid, {
			headers: {
				'Authorization': 'Bearer ' + AccessToken
			}
  		})
		.then( function( json ) {
			resolve( json );
		})
		.catch( function( err ) {
			reject( err );
  		});

	} );

}

function followUser( _userid, _isfollowing ) {

	loadAPIConnectionData();

	return new Promise( function( resolve, reject ) {

		var followAction = _isfollowing ? 'unfollow' : 'follow';
		apiFetch( 'api/v1/accounts/' + _userid + '/' + followAction, {
			method: 'POST',
			headers: {
				Authorization: 'Bearer ' + AccessToken
			}
		} )
		.then( function( json ) {
			resolve( json );
		})
		.catch( function( err ) {
			reject( err );
		});

	} );

}

function muteUser( _userid, _ismuted ) {

	loadAPIConnectionData();

	return new Promise( function( resolve, reject ) {

		var muteAction = _ismuted ? 'unmute' : 'mute';
		apiFetch( 'api/v1/accounts/' + _userid + '/' + muteAction, {
			method: 'POST',
			headers: {
				Authorization: 'Bearer ' + AccessToken
			}
		} )
		.then( function( json ) {
			resolve( json );
		})
		.catch( function( err ) {
			reject( err );
		});

	} );

}

function blockUser( _userid, _isblocked ) {

	loadAPIConnectionData();

	return new Promise( function( resolve, reject ) {

		var blockAction = _isblocked ? 'unblock' : 'block';
		apiFetch( 'api/v1/accounts/' + _userid + '/' + blockAction, {
			method: 'POST',
			headers: {
				Authorization: 'Bearer ' + AccessToken
			}
		} )
		.then( function( json ) {
			resolve( json );
		})
		.catch( function( err ) {
			reject( err );
		});

	} );

}

function loadBlockedUsers() {

	loadAPIConnectionData();

	return new Promise( function( resolve, reject ) {

		apiFetch( 'api/v1/blocks', {
			headers: {
				Authorization: 'Bearer ' + AccessToken
			}
		} ).then( function( json ) {
			console.log( '>>>' );
			resolve( json );
		} ).catch( function( err ) {
			console.log( '<<<' );
			reject( err );
		} );

	} );

}

function loadMutedUsers() {

	loadAPIConnectionData();

	// let's try getting reports
	return new Promise( function( resolve, reject ) {

		apiFetch( 'api/v1/mutes', {
			headers: {
				Authorization: 'Bearer ' + AccessToken
			}
		} ).then( function( json ) {
			resolve( json );
		} ).catch( function( err ) {
			reject( err );
		} );

	} );

}

function loadReports() {

	loadAPIConnectionData();

	// let's try getting reports
	return new Promise( function( resolve, reject ) {

		apiFetch( 'api/v1/reports', {
			headers: {
				Authorization: 'Bearer ' + AccessToken
			}
		} ).then( function( json ) {
			resolve( json );
		} ).catch( function( err ) {
			reject( err );
		} );

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
function sendPost( _txt, _inreplyto, _media_ids, _visibility, _issensitive, _spoilertxt ) {

	loadAPIConnectionData();

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

		if ( _visibility ) {
			_bodyArgs.visibility = _visibility;
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

	loadAPIConnectionData();

	var Uploader = require("Uploader");
	return Uploader.send(
		_imgObj.path,
		BASE_URL + 'api/v1/media',
		AccessToken
	);

}

function favouritePost( _postid, _currentstatus ) {

	loadAPIConnectionData();

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
	followUser: followUser,
	muteUser: muteUser,
	blockUser: blockUser,
	loadTimeline: loadTimeline,
	loadNotifications: loadNotifications,
	loadPostcontext: loadPostcontext,
	loadUserTimeline: loadUserTimeline,
	getUserProfile: getUserProfile,
	getRelationship: getRelationship,
	loadReports: loadReports,
	loadBlockedUsers: loadBlockedUsers,
	loadMutedUsers: loadMutedUsers,
	loading: loading,
	error: error,
	setError: setError,
	clearError: clearError,
	returntosplash: returntosplash,
	loadTimelineFromCache: loadTimelineFromCache,
	saveTimelineToCache: saveTimelineToCache,
	deleteTimelineFromCache: deleteTimelineFromCache,
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

	// save max_id and since_id for subsequent API requests
	var max_id = false;
	var since_id = false;

	// fetch has no timeout, wrap it in a promise
	// https://www.fusetools.com/community/forums/show_and_tell/fetch_timeout
	return new Promise( function( resolve, reject ) {

		var timeout = setTimeout(function() {
			console.log( 'timeout' );
			reject( new Error( 'Request timed out' ) );
		}, FETCH_TIMEOUT );

		loading.value = true;

		fetch( url, options )
			.then( function( response ) {

				clearTimeout( timeout );
				if ( response && 200 == response.status ) {

					// ["<https://mastodon.social/api/v1/timelines/home?max_id=4899975>; rel=\"next\", <https://mastodon.social/api/v1/timelines/home?since_id=4902190>; rel=\"prev\""]
					if ( 'object' == typeof response.headers.map.link ) {
						var linkheader = response.headers.map.link.shift();
						if ( 'string' == typeof linkheader ) {
							linkheader = linkheader.split( /[<>]/ );
							if ( linkheader.length > 3 ) {
								max_id = linkheader[ 1 ].split( 'max_id=' ).pop();
								since_id = linkheader[ 3 ].split( 'since_id=' ).pop();
							}
						}

					}

					loading.value = false;

					return response.json();

				} else if ( 401 == response.status ) {
					console.log( 'received a 401 from API' );
					loading.value = false;
					logOut();
					reject( '401 not authorized' );
				} else {
					console.log( 'apiFetch error for path ' + path );
					console.log( JSON.stringify( response ) );
					loading.value = false;
					reject( 'API error: status ' + response.status );
				}
			} )
			.then( function( responseObject ) {
				// process results
				if ( max_id && since_id ) {
					resolve( {
						posts: responseObject,
						max_id: max_id,
						since_id: since_id
					} );
				} else {
					resolve( responseObject );
				}
			})
			.catch( function( err ) {
				clearTimeout( timeout );
				loading.value = false;
				console.log( 'error: ' + err.message );
				reject( err );
			} );

	});

}