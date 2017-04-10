var api = require( 'assets/js/api' );
var Observable = require("FuseJS/Observable");

var amFollowing = false;
var amFollowedBy = Observable( false );
var following = Observable( '' );

var userid = this.Parameter.map( function( param ) {
	return param.userid;
});

userid.addSubscriber( function() {

	if ( userid.value ) {
		api.loadUserProfile( userid.value );
		api.loadTimeline( 'user', userid.value );
	}

});

api.userrelationship.addSubscriber( function( newValue ) {

	if ( 'undefined' != typeof newValue.value ) {

		amFollowing = newValue.value.following;
		following.value = amFollowing ? 'Unfollow' : 'Follow';

		amFollowedBy.value = newValue.value.followed_by;
	}

})

function mentionUser() {
	router.push( "write", { firstup: api.userprofile.value.acct } );
}

function followUser() {
	api.followUser( userid.value, amFollowing ).then( function() {
		amFollowing = !amFollowing;
		following.value = amFollowing ? 'Unfollow' : 'Follow';
	}).catch( function( err ) {
		console.log( JSON.stringify( err ) );
	});
}

module.exports = {
	account: api.userprofile,
	posts: api.posts.user,
	mentionUser: mentionUser,
	followUser: followUser,
	following: following,
	amFollowedBy: amFollowedBy
}
