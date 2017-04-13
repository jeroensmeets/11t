var api = require( 'assets/js/api' );
var helper = require( 'assets/js/helper' );
var HtmlEnt = require( 'assets/js/he/he.js' );
var Observable = require("FuseJS/Observable");

// used in callback functions for reposting and favouriting
var _this = this;
var postid = 0;
var userid = 0;
var username = '';
var mentions = {};
var type = Observable();

// true while favouriting/reposting
var favouriting = Observable( false );
var reposting = Observable( false );

var userHasReposted = Observable( false );
var userHasFavourited = Observable( false );

var isRepost = Observable( false );

var timeSince =  Observable( '0s' );

// every x seconds?
// timeSince.value = helper.timeSince( status.created_at );

this.post.onValueChanged( module, function( newValue ) {

	postid = newValue.postid;
	userid = newValue.userid;
	username = newValue.username;
	mentions = newValue.mentions;

	type.value = newValue.type;

	// reblog
	if ( newValue.rebloggerId > 0 ) {
		isRepost.value = true;
	}

	// mention
	if ( ( 'undefined' != typeof newValue.type ) && ( 'undefined' != typeof newValue.accountData ) ) {
		userid = newValue.accountData.id;
		username = newValue.accountData.acct;
	}

	userHasReposted.value = newValue.status.reposted;
	userHasFavourited.value = newValue.status.favourited;

} );

function replyToPost( ) {

	router.push( "write", { postid: postid, mentions: mentions, firstup: username } );

}

function rePost( ) {

	reposting.value = true;
	api.rePost( postid, _this.post.value.reposted ).then( function() {
		reposting.value = false;
		userHasReposted.value = !userHasReposted.value;
	}).catch( function( err ) {
		console.log( 'error in rePost' );
		console.log( JSON.stringify( err ) );
		reposting.value = false;
	});

}

function favouritePost( ) {

	favouriting.value = true;
	api.favouritePost( postid, _this.post.value.favourited ).then( function() {
		favouriting.value = false;
		userHasFavourited.value = !userHasFavourited.value;
	}).catch( function( err ) {
		console.log( 'error in favouritePost' );
		console.log( JSON.stringify( err ) );
		favouriting.value = false;
	});

}

function gotoPost( args ) {

	router.push( "postcontext", { post: _this.post.value.status } );

}

function gotoUser( ) {

	router.push( "userprofile", { userid: userid } );

}

function gotoReblogger() {

	if ( _this.post.value.rebloggerId > 0 ) {
		router.push( "userprofile", { userid: _this.post.value.rebloggerId } );
	}

}

function wordClicked( args ) {

	if ( args.data.mention ) {

		router.push( "userprofile", { userid: userid } );

	} else if ( args.data.link ) {

		var InterApp = require("FuseJS/InterApp");
		InterApp.launchUri( args.data.uri );

	}

}

module.exports = {

	// timeSince: timeSince,
	type: type,

	isRepost: isRepost,
	gotoReblogger: gotoReblogger,

	replyToPost: replyToPost,

	rePost: rePost,
	reposting: reposting,
	userHasReposted: userHasReposted,

	favouritePost: favouritePost,
	favouriting: favouriting,
	userHasFavourited: userHasFavourited,

	gotoUser: gotoUser,
	gotoPost: gotoPost,

	wordClicked: wordClicked

};
