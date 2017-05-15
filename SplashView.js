var api					= require( 'Assets/js/api' );
var Observable			= require( 'FuseJS/Observable' );

var loginFormVisible	= Observable( false );

function startLoggedInCheck() {

	if ( api.loadAPIConnectionData() ) {
		console.log( 'splashscreen, go direct to timeline do not pass go' );
		router.goto( 'timeline' );
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