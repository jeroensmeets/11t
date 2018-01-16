var api = require( 'Assets/js/api' );
var parseContent = require( 'Assets/js/parse.content.js' );
var Observable = require("FuseJS/Observable");

var uFollowing = Observable( false );
var uFollowedBy = Observable( false );
var uBlocking = Observable( false );
var uMuting = Observable( false );
var uRequested = Observable( false );

var userObject = this.user.inner();
var userBio = Observable();
userObject.onValueChanged( module, function( newValue  ) {

	if ( ! newValue ) {
		return;
	}

	userBio = parseContent.clickableBio( newValue.note );
	console.dir( userBio.value );

	api.getRelationship( newValue.id )
	.then( function( result ) {

		var relationship = result.shift();

		if ( relationship ) {
			uFollowing.value = relationship.following;
			uFollowedBy.value = relationship.followed_by;
			uBlocking.value = relationship.blocking;
			uMuting.value = relationship.muting;
			uRequested.value = relationship.requested;
		}

	} )
	.catch( function( err ) {
		console.log( err.message );
	});

} );

function mentionUser() {
	router.push( "write", { firstup: userObject.acct } );
}

function followUser() {
	api.followUser( userObject.id, uFollowing.value ).then( function() {
		uFollowing.value = !uFollowing.value;
	}).catch( function( err ) {
		console.log( JSON.stringify( err ) );
	});
}

function muteUser() {
	api.muteUser( userObject.id, uMuting.value ).then( function() {
		uMuting.value = !uMuting.value;
	}).catch( function( err ) {
		console.log( JSON.stringify( err ) );
	});	
}

function blockUser() {
	api.blockUser( userObject.id, uBlocking.value ).then( function() {
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
	blockUser: blockUser,

	userBio: userBio

}
