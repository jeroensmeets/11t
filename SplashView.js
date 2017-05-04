var api					= require( 'assets/js/api' );
var Observable			= require( 'FuseJS/Observable' );

var loginFormVisible	= Observable( false );

function startLoggedInCheck() {

	if ( api.loadAPIConnectionData() ) {
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