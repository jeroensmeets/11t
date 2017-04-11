var api					= require( 'assets/js/api' );
var Observable			= require( 'FuseJS/Observable' );

function showAboutPage() {
	router.push( 'write' );
}

module.exports = {
	showAboutPage: showAboutPage
}