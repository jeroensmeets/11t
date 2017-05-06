var Observable	= require("FuseJS/Observable");
var api			= require("assets/js/api");

function goWrite() {
	router.push( 'write' );
}

function goHome() {
	router.goto( 'home', {}, 'timeline' );
}

function goNotifications() {
	router.goto( 'home', {}, 'notifications' );
}

function goFavourites() {
	router.goto( 'home', {}, 'favourites' );
}

function goPublic() {
	router.goto( 'home', {}, 'publictimeline' );
}

function goSettings() {
	router.goto( 'home', {}, 'settings' );
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
