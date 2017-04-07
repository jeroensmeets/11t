var Observable	= require("FuseJS/Observable");

var api			= require("assets/js/api");

function goWrite() {
	router.push( 'write' );
}

function goHome() {
	api.setActiveTimeline( 'home', false );
	gotoPage( 'home' );
}

function goNotifications() {
	api.setActiveTimeline( 'notifications', false );
	gotoPage( 'notifications' );
}

function goFavourites() {
	api.setActiveTimeline( 'favourites', false );
	gotoPage( 'favourites' );
}

function goPublic() {
	api.setActiveTimeline( 'publictimeline', false );
	gotoPage( 'publictimeline' );
}

function gotoPage( _pageid, _pushit ) {

	if ( 0 == arguments ) {
		return;
	}

	if ( 1 == arguments ) {
		var _pushit = false;
	}

	if ( _pushit ) {
		router.push( _pageid );
	} else {
		router.goto( _pageid );
	}

}

// var Lifecycle = require('FuseJS/Lifecycle');
// Lifecycle.on("enteringInteractive", function() {
// 	// app activated
// });

module.exports = {
	goHome: goHome,
	goNotifications: goNotifications,
	goFavourites: goFavourites,
	goWrite: goWrite,
	goPublic: goPublic,
	loading: api.loading,
	refreshCurrentTimeline: api.loadCurrentTimelineFromAPI
}