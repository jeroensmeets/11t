var api = require( 'Assets/js/api' );

function confirmTerms() {
	router.push( 'login', {} );
}

function tryAgain() {
	api.logOut();
	router.goto( 'splash', {}, 'setinstance' );
}

module.exports = {
	confirmTerms: confirmTerms,
	tryAgain: tryAgain
}