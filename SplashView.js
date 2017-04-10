var api					= require( 'assets/js/api' );
var Observable			= require( 'FuseJS/Observable' );

var loginFormVisible	= Observable( 'Collapsed' );
var error				= Observable('');

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

	if ( ( 'undefined' == typeof baseurl.value ) || ( baseurl.value.length < 8 ) ) {
		error.value = 'Please specify a valid URL';
		return false;
	}

	// check baseurl
	var urlparts = api.parseUri( baseurl.value );

	if ( 'https' != urlparts.protocol ) {
		error.value = 'Only https connections are supported';
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
	baseurl: baseurl
};