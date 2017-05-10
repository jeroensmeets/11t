var api = require( 'assets/js/api' );
var contentparser	= require( 'assets/js/parse.content.js' );

var Observable = require("FuseJS/Observable");

var posts = Observable();

var amFollowing = Observable( false );
var amFollowedBy = Observable( false );
var isMuted = Observable( false );
var isBlocked = Observable( false );

var userid = this.Parameter.map( function( param ) {
	return param.userid;
} );

var userprofile = Observable();
var cb = Observable();

userid.onValueChanged( module, function( newValue ) {

	if ( 'undefined' != typeof newValue ) {

		userprofile.clear();
		posts.clear();

		api.getUserProfile( newValue )
		.then( function( json ) {
			// json.clickableBio = contentparser.clickableBio( json.note );
			userprofile.value = json;
			cb.value = contentparser.clickableBio( json.note );
			console.log( JSON.stringify( cb.value.length ) );
		})
		.catch( function( err ) {
			console.log( err.message );
		});

		api.loadTimeline( 'user', newValue )
		.then( function( APIresponse ) {

			posts.refreshAll(
				APIresponse.posts,
				function( oldItem, newItem ) { return oldItem.id == newItem.id; },
				function( oldItem, newItem ) { oldItem = new api.MastodonPost( newItem ); },
				function( newItem ) { return new api.MastodonPost( newItem ); }
			);

		} )
		.catch( function( err ) {
			console.log( err.message );
		} );

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
	userprofile: userprofile,
	clickableBio: cb,
	posts: posts
}
