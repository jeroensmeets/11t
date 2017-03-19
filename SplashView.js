var api					= require( 'assets/js/api' );

var Observable			= require( 'FuseJS/Observable' );

var loginFormVisible	= Observable( 'Collapsed' );
var error				= Observable();
var showError			= Observable( false );

var baseurl				= Observable( 'https://mastodon.social/' );

function startLoggedInCheck() {

	// remove old cache files
	api.cleanUp();

	api.loadAPIConnectionDataAsync()
		.then( function( result ) {
			if ( 'ok' == result ) {
				setTimeout( function() { router.goto( 'home' ); }, 2000 );
			} else {
				showLoginForm();
			}
		} )
		.catch( function() {
			// auth code not found, let user log in
			showLoginForm();
		});

}

function showLoginForm() {
	loginFormVisible.value = 'Visible';
}

function startOAuth() {

	showError.value = false;

	if ( ( 'undefined' == typeof baseurl.value ) || ( baseurl.value.length < 8 ) ) {
		error.value = 'Please specify a URL';
		showError.value = true;
		return false;
	}

	// check baseurl
	var urlparts = api.parseUri( baseurl.value );

	if ( 'https' != urlparts.protocol ) {
		error.value = 'Only servers running on SSL are supported.';
		showError.value = true;
		return false;
	}

	var bu = "https://" + urlparts.host + urlparts.path;
	if ( bu.substr( -1 ) != '/' ) { bu += '/'; }

	api.saveAPIConnectionData( bu, false, false, false );
	router.goto( 'login' );
	return;

	// step 1: get client id and client secret
	api.getClientIdSecret( baseurl.value ).then( function( credentials ) {

		// step 2: get access token
		api.getAccessToken( baseurl.value, credentials.id, credentials.secret, email.value, password.value ).then( function( accesstoken ) {

			// step 3: save credentials and access token
			api.saveAPIConnectionData( baseurl.value, credentials.id, credentials.secret, accesstoken.access_token );

			// step 4: get home timeline and then go home!
			api.setActiveTimeline( 'home' );
			api.loadCurrentTimelineFromAPI();
			router.goto( 'home' );

		});

	});

}

module.exports = {
	startOAuth: startOAuth,
	loginFormVisible: loginFormVisible,
	startLoggedInCheck: startLoggedInCheck,
	error: error,
	showError: showError,
	baseurl: baseurl
};