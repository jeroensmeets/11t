var helper			= require( 'assets/js/helper.js' );

var Observable      = require("FuseJS/Observable");
var Storage         = require("FuseJS/Storage");
var EventEmitter    = require("FuseJS/EventEmitter");

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

var userprofile = Observable();

/**
* load API accesstoken from storage and store it in helper.AccessToken
* returns true when accesstoken loaded, otherwise false
* 
* @return boolean
*/
function loadAPIConnectionData( ) {

	if ( ( false != AccessToken ) && ( false !== BASE_URL ) ) {
		// no need to load connection settings, already set
		console.log( 'connection settings loaded from cache' );
		return true;
	}

	try {
		var data = Storage.readSync( at_file );
		data = JSON.parse( data );

		AccessToken = data.token;
		BASE_URL = data.baseurl;

		return true;
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
	router.goto( 'splash' );

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

	console.log( 'timeline type: ' + timelineType );
	console.log( 'loadFromAPI: ' + loadFromAPI );

	active.value = timelineType;
	loadCurrentTimelineFromCache();

	var cacheEmpty = posts[ timelineType ] && ( posts[ timelineType ].length == 0 );

	console.log( 'cache empty? ' + cacheEmpty );
	if ( loadFromAPI || cacheEmpty ) {

		loadCurrentTimelineFromAPI();

	}

}

function loadCurrentTimelineFromAPI() {

	console.log( 'loading posts for timeline ' + active.value );

	if ( loading.value ) {
		// api is already out to fetch posts
		console.log( 'api request is underway, not starting another fetch request' );
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
        refreshPosts( active.value, JSON.parse( fileContents ), true );
    }, function( error ) {
        // error in reading from cache
        console.log( 'error in reading from cache' );
        console.log( JSON.stringify( error ) );
    });

}

/**
 * load timeline (of type _type), store posts in cache and refresh the api.posts object
 * 
 * @param  {string}		_type		which timeline to load
 * @param  {integer}	_id			userid when _type is `user`, or postid when _type is `postcontext`
 * @param  {object}		_postObj	current post object when _type is `postcontext`
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
		case 'user':
			posts.user.clear();
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
		}

		// posts loaded, refresh timeline
		refreshPosts( _type, json, false );

		loading.value = false;

	} );

}

function refreshPosts( posttype, jsondata, isfromcache ) {

	console.log( 'refreshing ' + posttype + ' posts, ' + jsondata.length + ' received.' );

	posts[ posttype ].refreshAll(
		jsondata,
		// compare on ID
		function( oldItem, newItem ) {
			return oldItem.id == newItem.id;
		},
		// update
		function( oldItem, newItem ) {
			oldItem = new MastodonPost( newItem, posttype );
		},
		// add new
		function( newItem ) {
			return new MastodonPost( newItem, posttype );
        }
	);

	console.log( 'saving the data to cache' );

	Storage.write( posttype + FILE_DATACACHE, JSON.stringify( posts[ posttype ].toArray() ) );

	console.log( 'array now has ' + posts[ posttype ].length + ' items.' );

}

function MastodonPost( data, posttype ) {

	this.posttype = posttype;

	this.isRepost = ( null !== data.reblog ) && ( 'notifications' != posttype );

	if ( this.isRepost ) {

		// account details for user that did the repost
		this.whoacct = data.account.acct;
		this.whoname = data.account.display_name;
		this.whoavatar = data.account.avatar;
		this.whoid = data.account.id;

		// copy original post data
		for ( var i in data.reblog ) {
			this[ i ] = data.reblog[ i ];
		}

	} else {

		// copy post data
		for ( var i in data ) {
			this[ i ] = data[ i ];
		}

	}

	console.log( 1 );

	// strip content clean for timelines
	this.previewcontent = cleanupContent( this, posttype );

	console.log( 2 );

	if ( 'postcontext' == posttype ) {
		this.prepcontent = preparePostContent( this );
	}

	console.log( 3 );

	// template needs info if there is no content to remove content box and just a little white space
	this.hascontent = this.previewcontent.length > 0 || ( '' != this.spoiler_text );

	// console.log( JSON.stringify( this ) );

}

/**
 * @param  {integer}	_userid		user to load profile for
 * @return none
 */
function loadUserProfile( _userid ) {

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

		refreshPosts( active.value, json, false );

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
	var repostEmitter = new EventEmitter( 'rePostEnded' );

	fetch( 'https://mastodon.social/api/v1/statuses/' + _postid + '/' + _apiAction, {
		method: 'POST',
		headers: {
			'Content-type': 'application/json',
			'Authorization': 'Bearer ' + AccessToken.value
		}
	})
	.then( function( resp ) {
		if ( 200 == resp.status ) {
			return resp.json();
		} else {
			repostEmitter.emit( 'rePostEnded', { err: true } );
		}
	})
	.then( function( json ) {

		refreshPosts( active.value, json, false );

		repostEmitter.emit( 'rePostEnded', { err: false, post: json } );
	})
	.catch( function( err ) {
		repostEmitter.emit( 'rePostEnded', { err: true } );
	});

	return repostEmitter.promiseOf( 'rePostEnded' );

}

function loadPostContext( _postid ) {

	posts.postcontext.clear();

	var _post = getPostById( _postid );

	if ( false !== _post ) {
		// posts.postcontext.add( _post );
 		loadTimeline( 'postcontext', _post.id, _post );
	}

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
	loadTimeline: loadTimeline,
	loadUserProfile: loadUserProfile,
	loadPostContext: loadPostContext,
	loading: loading,
	setActiveTimeline: setActiveTimeline,
	loadCurrentTimelineFromAPI: loadCurrentTimelineFromAPI,
	loadCurrentTimelineFromCache: loadCurrentTimelineFromCache,
	getClientIdSecret: getClientIdSecret,
	loadAPIConnectionData: loadAPIConnectionData,
	loadAPIConnectionDataAsync: loadAPIConnectionDataAsync,
	saveAPIConnectionData: saveAPIConnectionData,
	getAccessToken: getAccessToken,
	sendImage: sendImage,
	sendPost: sendPost,
	favouritePost: favouritePost,
	rePost: rePost,
	parseUri: helper.parseUri,
	cleanUp: cleanUp,
	logOut: logOut
}

// https://www.fusetools.com/docs/backend/rest-apis
function apiFetch( path, options ) {

	var url = encodeURI( BASE_URL + path );

	// console.log( 'apiFetch: ' + url );

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

	// Fetch the resource and parse the response as JSON
	return fetch( url, options )
		.then( function( response ) {

			// console.log( 'API path: return status ' + response.status );
			if ( 401 == response.status ) {

				// not authorized
				logOut();

			} else {

				return response.json();

			}

		} );

}

function cleanupContent( postdata, posttype ) {

	if ( 'follow' == postdata.type ) {
		return '';
	}

	console.log( 'cleanupContent ' + 1 );

	var _source = ( 'notifications' == posttype ) ? postdata.status : postdata;

	console.log( JSON.stringify( postdata ) );

	var _text = HtmlEnt.decode( _source.content );

	console.log( 'cleanupContent ' + 2 );

	// remove links to media attachments
	if ( _source.media_attachments.length ) {

		var _uris = helper.getUrisFromText( _text );

		if ( _uris && ( _uris.length > 0 ) ) {
			for ( var i in _uris ) {
				var _cleanupuri = _uris[ i ].match( /https?:([^"']+)/ig );
				if ( _source.media_attachments.some( function (obj) { return ( _cleanupuri.indexOf( obj.text_url ) > -1 ); } ) ) {
					_text = _text.replace( _uris[ i ], '' );
				}
			}
		}
	}

	console.log( 'cleanupContent ' + 3 );

	// remove empty paragraphs
	_text = _text.replace( '<p></p>', '' );

	if ( '' == _text.toLowerCase() ) {
		return [];
	}

	// get paragraphs, ignore last empty one
	var paragraphs = _text.split( '</p>' );
	paragraphs.splice( -1, 1 );

	var result = [];
	for ( var i in paragraphs ) {
		var paragraph = paragraphs[ i ].replace( "<p>", "" );
		result.push( { paragraph: paragraph.replace( /<[^>]+>/ig, '' ) } );
	}

	// in case content has no paragraphs
	if ( 0 == result.length ) {
		result.push( { paragraph: _text.replace( /<[^>]+>/ig, '' ) } );
	}

	return result;

}

// the result of this function is for the view of a single post
// and should NOT be used on a timeline as it generates memory issues
function preparePostContent( postdata ) {

	// replace HTML codes like &amp; and &gt;
	var _content = HtmlEnt.decode( postdata.content );

	// paragraphs

	// last closing </p> needs no replacement
	_content = _content.replace(new RegExp('<\/p>$'), '');

	// other closing </p> need some breathing room (for now a placeholder)
	_content = _content.replace( "</p>", " ]]]] " );
	// opening <p> can be removed
	_content = _content.replace( "<p>", "" );

	// temporary replace urls to prevent splitting on spaces in linktext
	var _uris = helper.getUrisFromText( _content );
	if ( _uris && ( _uris.length > 0 ) ) {
		for ( var i in _uris ) {
			_content = _content.replace( _uris[ i ], '[[[[' + i );
		}
	}

	// now remove al HTML tags
	_content = _content.replace( /<[^>]+>/ig, '' );

	var result = [];

	var _words = _content.split( /\s/g );

	for ( var i in _words ) {

		if ( _words[ i ].indexOf( ']]]]' ) > -1 ) {

			result.push( { word: '', clear: true } );

		} else if ( -1 === _words[ i ].indexOf( '[[[[' ) ) {

			// this is not a link, add it as a word
			// click event in Part.PostCard can send it to the post detail screen
			result.push( { word: _words[ i ] } );

		} else {

			// link found! but: what kind of link?
			// bug fix: if e.g. a mention links to another server, it's a link with a @ before it
			var _charBeforeLink = ( '[[[[' == _words[ i ].substring( 1, 5 ) ) ? _words[ i ].substring( 0, 1 ) : '';
			var _linkId = Number.parseInt( _words[ i ].match(/\d/g).join('') );
			if ( !_uris[ _linkId ] ) {
				continue;
			}
			var _linkTxt = _uris[ _linkId ].replace( /<[^>]+>/ig, '' );

			// first: mentions
			var _mentioner = postdata.mentions.filter( function (obj) { return ( 0 ==  _linkTxt.indexOf( '@' + obj.acct ) ); } );
			if ( _mentioner.length > 0 ) {
				// console.log( '%%%%%%%%%%%%%%%%%%%%%% -- mention' );
				result.push( { mention: true, word: _linkTxt, makeBold: true, userid: _mentioner[0].id } );
			} else {

				// not a mention. maybe a hashtag?
				var _tag = postdata.tags.filter( function (obj) { return '#' + obj.name === _linkTxt; } );
				if ( _tag.length > 0 ) {

					// TODO add hashtags
					// console.log( '%%%%%%%%%%%%%%%%%%%%%% -- hashtag' );
					result.push( { word: _linkTxt } );

				} else if ( postdata.media_attachments.some( function (obj) { return _linkTxt == obj.text_url; } ) ) {

					// do not show the urls for media_attachments in the content
					// console.log( '%%%%%%%%%%%%%%%%%%%%%% -- media attachment: ' + _linkTxt );

				} else if ( ( '@' == _charBeforeLink ) || ( '#' == _charBeforeLink ) ) {

					// mentions on some (older Statusnet installations, says https://community.highlandarrow.com/notice/469679 )
					// are a link with an @ before it. TODO One little thing: no user id from the mentions array
					result.push( { word: _charBeforeLink + _linkTxt } );

				} else {

					// everything else not true. probably just a link
					// click event sends it to the system browser
					var _linkstart = _uris[ _linkId ].indexOf( 'href="' ) + 6;
					var _linkend = _uris[ _linkId ].indexOf( '"', _linkstart );
					var _linkUrl = _uris[ _linkId ].substring( _linkstart, _linkend );
					result.push( { link: true, word: _linkTxt, uri: _linkUrl, makeBold: true } );

				}
			}
		}
	}

	return result;

}