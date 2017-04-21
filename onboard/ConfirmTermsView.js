var api = require( 'assets/js/api' );
var Observable = require( 'FuseJS/Observable' );

var acceptedTerms = Observable( false );

function confirmTerms() {

	if ( acceptedTerms.value ) {
		router.push( 'login', {} );
	} else {
		api.setError( 'Please accept the user agreement first' );
	}

}

function tryAgain() {
	api.logOut();
	router.goto( 'splash', {}, 'setinstance' );
}

module.exports = {
	confirmTerms: confirmTerms,
	acceptedTerms: acceptedTerms,
	tryAgain: tryAgain
}