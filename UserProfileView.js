var api = require( 'assets/js/api' );
var Observable = require("FuseJS/Observable");

var amFollowing = Observable( false );
var amFollowedBy = Observable( false );

var isMuted = Observable( false );
var isBlocked = Observable( false );

var userid = this.Parameter.map( function( param ) {
	return param.userid;
} );

var userprofile = Observable();

userid.onValueChanged( module, function( newValue ) {

	console.log( newValue );

	if ( newValue ) {

		api.getUserProfile( newValue )
		.then( function( json ) {
			userprofile.value = json;
		})
		.catch( function( err ) {
			console.log( err.message );
		});

		api.loadTimeline( 'user', newValue );

	}

});

function mentionUser() {
	router.push( "write", { firstup: api.userprofile.value.acct } );
}

function followUser() {
	api.followUser( userid.value, amFollowing.value ).then( function() {
		amFollowing.value = !amFollowing.value;
	}).catch( function( err ) {
		console.log( JSON.stringify( err ) );
	});
}

function muteUser() {
	api.muteUser( userid.value, isMuted.value ).then( function() {
		isMuted.value = !isMuted.value;
	}).catch( function( err ) {
		console.log( JSON.stringify( err ) );
	});	
}

function blockUser() {
	api.blockUser( userid.value, isBlocked.value ).then( function() {
		isBlocked.value = !isBlocked.value;
	}).catch( function( err ) {
		console.log( JSON.stringify( err ) );
	});	
}

module.exports = {
	act: userprofile,
	posts: api.posts.user
}
