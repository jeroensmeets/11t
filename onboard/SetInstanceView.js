var api					= require( 'assets/js/api' );
var Observable			= require( 'FuseJS/Observable' );

var baseurl				= Observable( 'https://mastodon.social/' );

function saveInstanceUrl() {

	if ( ( 'undefined' == typeof baseurl.value ) || ( baseurl.value.length < 8 ) ) {
		api.setError( 'Please specify a valid URL' );
		return false;
	}

	// check baseurl
	var urlparts = api.parseUri( baseurl.value );

	if ( 'https' != urlparts.protocol ) {
		api.setError( 'Only https connections are supported' );
		return false;
	}

	var path = ( '' == urlparts.path ) ? '/' : urlparts.path;

	var bu = "https://" + urlparts.host + path;

	api.saveAPIConnectionData( bu, false, false, false );

	router.goto( 'splash', {}, 'confirminstance', { instance: urlparts.host } );

}

module.exports = {
	saveInstanceUrl: saveInstanceUrl,
	baseurl: baseurl
};