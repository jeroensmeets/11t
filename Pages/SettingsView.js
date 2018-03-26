var api = require( 'Assets/js/api' );
var settings = require( 'Assets/js/settings' );
var Observable = require( 'FuseJS/Observable' );

var useTranslations = Observable( false );
var useNotifications = Observable( false );

useNotifications.onValueChanged( module, function( newValue ) {

	if ( newValue === useNotifications.value ) {
		return;
	}

	if ( newValue ) {
		api.subscribeToNotifications()
		.then( function( json ) {
			api.setError( 'Successfully subscribed to notifications' );
		})
		.catch( function( err ) {
			api.setError( 'Could not subscribe to notifications' );
			useNotifications.value = false;
		});
	} else {
		api.unsubscribeFromNotifications();
		useNotifications.value = false;
	}

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
	useNotifications: useNotifications
}