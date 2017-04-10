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
			console.log( result );
			if ( 'ok' == result ) {
				api.setActiveTimeline( 'home', false );
				router.goto( 'home' );
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

	var bu = "https://" + urlparts.host + '/' + urlparts.path;

	api.saveAPIConnectionData( bu, false, false, false );
	router.goto( 'login' );

}

module.exports = {
	startOAuth: startOAuth,
	loginFormVisible: loginFormVisible,
	startLoggedInCheck: startLoggedInCheck,
	error: error,
	showError: showError,
	baseurl: baseurl
};