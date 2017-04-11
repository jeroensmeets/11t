var api					= require( 'assets/js/api' );
var Observable			= require( 'FuseJS/Observable' );

var loginFormVisible	= Observable( 'Collapsed' );

var baseurl				= Observable( 'https://mastodon.social/' );

function startLoggedInCheck() {

	// remove old cache files
	api.cleanUp();

	if ( api.loadAPIConnectionData() ) {

		console.log( 'checking if logged in: yes!' );
		api.setActiveTimeline( 'home', false );
		router.goto( 'home' );

	} else {

		console.log( 'checking if logged in: no!' );
		showLoginForm();

	}


	// api.loadAPIConnectionDataAsync()
	// 	.then( function( result ) {

	// 		if ( 'ok' == result ) {
	// 			api.setActiveTimeline( 'home', false );
	// 			router.goto( 'home' );
	// 		} else {
	// 			showLoginForm();
	// 		}

	// 	} )
	// 	.catch( function() {

	// 		// auth code not found, let user log in
	// 		showLoginForm();

	// 	});

}

function showLoginForm() {
	loginFormVisible.value = 'Visible';
}

function startOAuth() {

	if ( ( 'undefined' == typeof baseurl.value ) || ( baseurl.value.length < 8 ) ) {
		api.setError( 'Please specify a valid URL' );
		return false;
	}

	// check baseurl
	var urlparts = api.parseUri( baseurl.value );

	if ( 'https' != urlparts.protocol ) {
		api.setError( 'Only https connections are supported' );
		return false;
	}

	var path = ( '' == urlparts.path ) ? '/' : urlparts.path;

	var bu = "https://" + urlparts.host + path;

	api.saveAPIConnectionData( bu, false, false, false );
	router.push( 'login' );

}

module.exports = {
	startOAuth: startOAuth,
	loginFormVisible: loginFormVisible,
	startLoggedInCheck: startLoggedInCheck,
	baseurl: baseurl
};