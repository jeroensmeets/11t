var Observable	= require("FuseJS/Observable");
var api			= require("assets/js/api");

function goWrite() {
	router.push( 'write' );
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

function GotoOrRefresh( desiredRoute ) {

	router.getRoute( function( route ) {
		if ( route && ( route.length > 2 ) && ( desiredRoute != route[ 2 ] ) ) {
			router.goto( 'home', {}, desiredRoute );
		} else {
			// TODO how to get the resolve of this function to the active page
			// api.loadTimeline( desiredRoute );
		}
	} );

}

// setting this value to true is enough to make the app logout and go back to the splash screen
api.returntosplash.addSubscriber( function( newValue ) {

	if ( true === newValue.value ) {
		api.logOut();
		api.setError( 'You are not logged in' );
		router.goto( 'splash' );
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
