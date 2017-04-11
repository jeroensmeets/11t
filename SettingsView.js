var api = require( 'assets/js/api' );
var Observable = require( 'FuseJS/Observable' );

var error = Observable( '' );

function showAboutPage() {
	router.push( 'fixedcontent', { content: 'about' } );
}

function logOut() {

	error.value = 'Logging you out...';
	api.logOut();
	setTimeout( function() {
		router.goto( 'splash' );
	}, 2500 );

}

module.exports = {
	showAboutPage: showAboutPage,
	logOut: logOut,
	error: error
}