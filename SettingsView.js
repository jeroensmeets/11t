var api = require( 'assets/js/api' );
var settings = require( 'assets/js/settings' );
var Observable = require( 'FuseJS/Observable' );

var useTranslations = Observable( false );

useTranslations.onValueChanged( module, function( newValue ) {
	settings.saveSetting( 'showTranslationsButton', newValue );
} );

function loadSettings() {
	settings.loadSettings();
	useTranslations = settings.loadSetting( 'showTranslationsButton' );
}

function showAboutPage() {
	router.push( 'fixedcontent', { content: 'about' } );
}

function logOut() {

	api.setError( 'Logging you out...' );
	api.logOut();
	setTimeout( function() {
		router.goto( 'splash' );
	}, 2500 );

}

module.exports = {
	showAboutPage: showAboutPage,
	logOut: logOut,
	useTranslations: useTranslations,
	loadSettings: loadSettings
}