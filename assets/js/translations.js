var api = require( 'Assets/js/api' );
// var Localization = require("Localization");

var currentLocale = false;

// todo get from conf
var translationAPIUrl = 'https://translation.googleapis.com/language/translate/v2';

// this key is set to only accept requests for Android app com.jeroensmeets.mastodon
// if you want to work on translations, this needs another API key from Google Cloud
// translation functionality is unfinished for now, anyway
var APIKEY = 'AIzaSyCObC4z6HLK2pfBlRK_uNH3d_56d9TM8J4';

function setCurrentLocale() {

	// var deviceLocale = Localization.getCurrentLocale().split('-');
	// currentLocale = deviceLocale.slice( 0, deviceLocale.length === 3 ? 2 : 1 ).join('-');

}

/**
 * [getTranslation description]
 * @param  text
 * @return promise
 *
 * this function does not use api.apiFetch as the Google Cloud API
 * is quite picky about the request and returns 404s all over the place
 * has to do with the options array in apiFetch
 * 
 */
function getTranslation( text ) {

	if ( false === currentLocale ) {
		setCurrentLocale();
	}

	var getargs = 'key=' + APIKEY + '&target=nl&q=' + encodeURIComponent( text ).replace( '%20', '+' );

	// fetch has no timeout, wrap it in a promise
	// https://www.fusetools.com/community/forums/show_and_tell/fetch_timeout
	return new Promise( function( resolve, reject ) {

		var timeout = setTimeout(function() {
			console.log( 'timeout' );
			reject( new Error( 'Request timed out' ) );
		}, 5000 );

		fetch( translationAPIUrl + '?' + getargs )
		.then( function( response ) {

			clearTimeout( timeout );
			if ( response && 200 == response.status ) {
				return response.json();
			} else {
				reject( new Err( 'API error' ) );
			}
		} )
		.then( function( responseObject ) {
			// process results
			resolve( responseObject );
		})
		.catch( function( err ) {
			clearTimeout( timeout );
			reject( err );
		});

	} );

}

module.exports = {
	getTranslation: getTranslation
}