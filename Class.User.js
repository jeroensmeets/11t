var api = require( 'assets/js/api' );
var Observable = require("FuseJS/Observable");

var uFollowing = Observable( false );
var uFollowedBy = Observable( false );
var uBlocking = Observable( false );
var uMuting = Observable( false );
var uRequested = Observable( false );

var userid = 0;
var username = false;
var act = this.Parameter.map( function( param ) {
	return param.account;
} );

this.act.onValueChanged( module, function( account ) {

	// BUG! BUG! BUG!
	// account should be an observable but sometimes is an array
	if ( account && account.value && 'number' == typeof account.value.id ) {
		userid = account.value.id;
		username = account.value.acct;
	} else {
		userid = account.id;
		username = account.acct;
	}

	if ( !userid ) {
		return;
	}

	api.getRelationship( userid )
	.then( function( result ) {

		var relationship = result.shift();
		uFollowing.value = relationship.following;
		uFollowedBy.value = relationship.followed_by;
		uBlocking.value = relationship.blocking;
		uMuting.value = relationship.muting;
		uRequested.value = relationship.requested;

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
	console.log( '(un)mute user ' + userid );
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

	mentionUser: mentionUser,
	followUser: followUser,
	muteUser: muteUser,
	blockUser: blockUser

}
