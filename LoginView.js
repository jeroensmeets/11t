var api = require( 'assets/js/api' );
var conf = require( 'assets/js/conf' );

var Observable = require("FuseJS/Observable");

var oAuthUri = Observable( '' );
var webviewVisible = Observable( 'Collapsed' );

var ClientIdSecret = false;

function showWebview() {
	api.setError( 'Connecting to Mastodon instance...' );
	webviewVisible.value = 'Visible';
}

function hideWebview() {
	webviewVisible.value = 'Collapsed';
}

function setOAuthUri() {

	// load baseurl from file
	var _connectionData = api.loadAPIConnectionData();

	api.getClientIdSecret().then( function( credentials ) {

		ClientIdSecret = credentials;

		oAuthUri.value = credentials.baseurl + "oauth/authorize?client_id=" + credentials.id
			+ "&redirect_uri=" + encodeURIComponent( conf.redirect_uri )
			+ "&response_type=code"
			+ "&scope=read+write+follow";

		showWebview();

	} ).catch( function( error ) {

		console.log( JSON.stringify( error ) );

	});

}

function webViewUrlChanged( ) {

	if ( 'Visible' != webviewVisible.value ) {
		// TODO why is this handler called, oh Android?
		return;
	}

	var uriparts = api.parseUri( oAuthUri.value );
	var redirecturiparts = api.parseUri( conf.redirect_uri );

	// console.log( '+++++++++++++' );
	// console.log( '+ url in webview has changed' );
	// console.log( '+ visibility of webview is ' + webviewVisible.value );
	// console.log( '+ host of webview is ' + uriparts.host );
	// console.log( '+++++++++++++' );

	if ( redirecturiparts.host != uriparts.host ) {
		// returning as host is not the redirect_uri set in assets/js/conf.js
		return;
	}

	hideWebview();

	var code = '';
	var error = false;

	var getargs = uriparts.query.split('&');
	for (var i = 0; i < getargs.length; i++) {
		if ( !getargs[i] ) {
			continue;
		}
		var getarg = getargs[i].split( '=' );
		// console.log( getarg[ 0 ] + ': ' + getarg[ 1 ] );
		if ( 'code' == getarg[ 0 ] ) {
			code = getarg [ 1 ];
		}
		if ( 'error' == getarg[ 0 ] ) {
			error = true;
		}
	}

	if ( error ) {
		console.log( 'error in oauth (1)' );
		router.goto( 'splash' );
	} else {

	// ok, we have an auth token, now ask for the acces token
	console.log( 'auth token received (' + code + ') -- now ask for access token' );

	api.getAccessToken( code, conf.redirect_uri, ClientIdSecret.id, ClientIdSecret.secret ).then(
		function( access_token ) {
			// {"access_token":"0ddb922452c983a70566e30dce16e2017db335103e35d783874c448862a78168",
			// "token_type":"bearer",
			// "expires_in":7200,
			// "refresh_token":"f2188c4165d912524e04c6496d10f06803cc08ed50271a0b0a73061e3ac1c06c",
			// "scope":"public"}
			// console.log( 'received access token data: ' + JSON.stringify( access_token ) );
			api.saveAPIConnectionData( ClientIdSecret.baseurl, ClientIdSecret.id, ClientIdSecret.secret, access_token.access_token );

			api.setActiveTimeline( 'home' );
			router.goto( 'home' );

		}).catch( function( error ) {

			console.log( 'error in getting access token: ' + JSON.stringify( error ) );
			router.goto( 'splash' );

		})

	}

}

module.exports = {
	oAuthUri: oAuthUri,
	webViewUrlChanged: webViewUrlChanged,
	setOAuthUri: setOAuthUri
}
