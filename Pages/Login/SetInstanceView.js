var api					= require( 'Assets/js/api' );
var Observable			= require( 'FuseJS/Observable' );

var baseurl				= Observable( '' );

function saveInstanceUrl() {

	// check baseurl
	var urlparts = api.parseUri( baseurl.value );

	if ( ( '' == urlparts.host ) || ( urlparts.host.length < 5 ) ) {
		api.setError( 'Please enter a valid URL' );
		return false;
	}

	if ( ( '' != urlparts.protocol ) && ( 'https' != urlparts.protocol ) ) {
		api.setError( 'Only https connections are supported' );
		return false;
	}

	var path = ( '' == urlparts.path ) ? '/' : urlparts.path;

	var bu = "https://" + urlparts.host + path;

	console.log( 'setting baseurl to ' + bu );

	api.saveAPIConnectionData( bu, false, false, false );

	router.goto( 'splash', {}, 'confirminstance', { instance: urlparts.host } );

}

module.exports = {
	saveInstanceUrl: saveInstanceUrl,
	baseurl: baseurl
};