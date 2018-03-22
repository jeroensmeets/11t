var api = require( 'Assets/js/api' );
var settings = require( 'Assets/js/settings' );
var Observable = require( 'FuseJS/Observable' );

var useTranslations = Observable( false );
var darkTheme = Observable( false );
var useNotifications = Observable( false );

useTranslations.onValueChanged( module, function( newValue ) {
	settings.saveSetting( 'showTranslationsButton', newValue );
} );

darkTheme.onValueChanged( module, function( newValue ) {
	console.log(newValue);
	settings.saveSetting( 'darkTheme', newValue );
} );

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
	darkTheme = settings.loadSetting( 'darkTheme' );
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
	darkTheme: darkTheme,
	useNotifications: useNotifications,
	loadSettings: loadSettings
}