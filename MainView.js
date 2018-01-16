var Observable	= require("FuseJS/Observable");
// var push		= require("FuseJS/Push");
var api			= require("Assets/js/api");

//
// notifications
//
 
// push.on( "registrationSucceeded", function( regID ) {
// 	console.log( "Reg Succeeded: " + regID );
// 	api.saveDeviceTokenForPush( regID );
// } );

// push.on( "error", function( reason ) {
// 	console.log( "Reg Failed: " + reason );
// } );

// push.on( "receivedMessage", function( payload ) {
// 	console.log( "Recieved Push Notification: " + payload );
// } );

//
// callbacks from interface
// 

function goWrite() {
	router.push( 'write', { firstup: '', mentions: [] } );
}

function goHome() {
	GotoOrRefresh( 'timeline' );
}

function goNotifications() {
	GotoOrRefresh( 'notifications' );
}

function goFavourites() {
	GotoOrRefresh( 'favourites' );
}

function goPublic() {
	GotoOrRefresh( 'publictimeline' );
}

function goSettings() {
	GotoOrRefresh( 'settings' );
}

//
// internal functions, not exported
// 

function GotoOrRefresh( desiredRoute ) {

	router.getRoute( function( route ) {

		if ( route && ( route.length > 0 ) && ( desiredRoute != route[ 0 ] ) ) {
			router.goto( desiredRoute );
		} else {
			// TODO how to reach the active scrollview
		}

	} );

}

//
// setting this value to true triggers a logout, router goes back to the splash screen
// 

api.returntosplash.addSubscriber( function( newValue ) {

	if ( true === newValue.value ) {
		api.logOut();
		api.setError( 'You are logged out' );
		router.goto( 'splash', {}, 'setinstance' );
	}

})

module.exports = {
	goHome: goHome,
	goNotifications: goNotifications,
	goFavourites: goFavourites,
	goWrite: goWrite,
	goPublic: goPublic,
	goSettings: goSettings,
	loading: api.loading,
	error: api.error
}
