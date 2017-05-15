var api = require( 'Assets/js/api' );
var settings = require( 'Assets/js/settings' );
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

function showReports() {
	router.push( 'reportslist' );
}

function showMutedUsers() {
	router.push( 'mutedusers' );
}

function showBlockedUsers() {
	router.push( 'blockedusers' );
}

function logOut() {

	api.setError( 'Logging you out...' );
	api.logOut();
	setTimeout( function() {
		router.goto( 'splash', {}, 'setinstance' );
	}, 2500 );

}

module.exports = {
	showAboutPage: showAboutPage,
	showReports: showReports,
	showBlockedUsers: showBlockedUsers,
	showMutedUsers: showMutedUsers,
	logOut: logOut,
	useTranslations: useTranslations,
	loadSettings: loadSettings
}