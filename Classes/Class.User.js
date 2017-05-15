var api = require( 'Assets/js/api' );
var Observable = require("FuseJS/Observable");

var uFollowing = Observable( false );
var uFollowedBy = Observable( false );
var uBlocking = Observable( false );
var uMuting = Observable( false );
var uRequested = Observable( false );

var userInfoLoaded = Observable( false );

var userid = 0;
var username = false;

this.useraccount.onValueChanged( module, function( newValue ) {

	console.log( '----------- Class.User.js useraccount has changed -------------' );

	uFollowing.value = false;
	uFollowedBy.value = false;
	uBlocking.value = false;
	uMuting.value = false;
	uRequested.value = false;

	// BUG! BUG! BUG!
	// newValue should be an observable but sometimes is an array
	var a = ( newValue && newValue.value ) ? newValue.value : newValue;

	console.log( JSON.stringify( a ) );

	if ( !a ) {
		return;
	}

	userid = a.id;
	username = a.acct;

	console.log( '----> ' + userid );

	if ( !userid ) {
		return;
	}

	api.getRelationship( userid )
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
