var api = require( 'Assets/js/api' );
var Observable = require("FuseJS/Observable");

var uFollowing = Observable( false );
var uFollowedBy = Observable( false );
var uBlocking = Observable( false );
var uMuting = Observable( false );
var uRequested = Observable( false );

var userInfoLoaded = Observable( false );

var userid = this.Parameter.map( function( param ) {
	return param.userid;
} );

var username = this.Parameter.map( function( param ) {
	return param.useraccname;
} );

this.userid.onValueChanged( module, function( newValue ) {

	console.log( '----------- Class.User.js useraccount has changed -------------' );

	uFollowing.value = false;
	uFollowedBy.value = false;
	uBlocking.value = false;
	uMuting.value = false;
	uRequested.value = false;

	api.getRelationship( newValue )
	.then( function( result ) {

		var relationship = result.shift();
		console.log( JSON.stringify( relationship ) );
		uFollowing.value = relationship.following;
		uFollowedBy.value = relationship.followed_by;
		uBlocking.value = relationship.blocking;
		uMuting.value = relationship.muting;
		uRequested.value = relationship.requested;

		userInfoLoaded.value = true;

	} )
	.catch( function( err ) {
		console.log( err.message );
	});

} );

function mentionUser() {
	router.push( "write", { firstup: username } );
}

function followUser() {
	api.followUser( userid, uFollowing.value ).then( function() {
		uFollowing.value = !uFollowing.value;
	}).catch( function( err ) {
		console.log( JSON.stringify( err ) );
	});
}

function muteUser() {
	api.muteUser( userid, uMuting.value ).then( function() {
		uMuting.value = !uMuting.value;
	}).catch( function( err ) {
		console.log( JSON.stringify( err ) );
	});	
}

function blockUser() {
	api.blockUser( userid, uBlocking.value ).then( function() {
		uBlocking.value = !uBlocking.value;
		loadBlockedUsers();
	}).catch( function( err ) {
		console.log( JSON.stringify( err ) );
	});	
}

module.exports = {

	uFollowing: uFollowing,
	uFollowedBy: uFollowedBy,
	uBlocking: uBlocking,
	uMuting: uMuting,
	uRequested: uRequested,

	userInfoLoaded: userInfoLoaded,

	mentionUser: mentionUser,
	followUser: followUser,
	muteUser: muteUser,
	blockUser: blockUser

}
