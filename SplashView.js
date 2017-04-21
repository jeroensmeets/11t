var api					= require( 'assets/js/api' );
var Observable			= require( 'FuseJS/Observable' );

var loginFormVisible	= Observable( false );

function startLoggedInCheck() {

	// remove old cache files
	api.cleanUp();

	if ( api.loadAPIConnectionData() ) {
		api.setActiveTimeline( 'home', false );
		router.goto( 'home' );
	} else {
		showLoginForm();
	}

}

function showLoginForm() {
	loginFormVisible.value = true;
}

module.exports = {
	loginFormVisible: loginFormVisible,
	startLoggedInCheck: startLoggedInCheck
};