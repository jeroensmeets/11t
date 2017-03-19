var api = require( 'assets/js/api' );
var helper = require( 'assets/js/helper' );

var _this = this;

var Observable = require("FuseJS/Observable");

var favouriting = Observable( false );
var reposting = Observable( false );

var postid = 0;
var userid = 0;
var username = '';
var mentions = [];

var spoilerVisible = Observable( false );
var timeSince =  Observable( '' );

this.post.onValueChanged( module, function( newValue ) {

	if ( 'undefined' != typeof newValue ) {

		spoilerVisible.value = ( '' == newValue.spoiler_text );
		timeSince.value = helper.timeSince( newValue.created_at );
		postid = newValue.id;
		userid = newValue.isNotification ? newValue.whodidthis.id : newValue.account.id;
		username = newValue.isNotification ? newValue.whodidthis.acct : newValue.account.acct;
		mentions = newValue.mentions;

	}

} );

function replyToPost( ) {

	router.push( "write", { postid: postid, mentions: mentions, firstup: username } );

}

function rePost( ) {

	reposting.value = true;
	api.rePost( postid, _this.post.value.reposted ).then( function() {
		reposting.value = false;
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
	}).catch( function( err ) {
		console.log( 'error in favouritePost' );
		console.log( JSON.stringify( err ) );
		favouriting.value = false;
	});

}

function gotoPost( ) {

	router.push( "postcontext", { postid: postid } );

}

function gotoUser( ) {

	router.push( "userprofile", { userid: userid } );

}

function wordClicked( args ) {

	if ( args.data.mention ) {

		router.push( "userprofile", { userid: userid } );

	} else if ( args.data.link ) {

		var InterApp = require("FuseJS/InterApp");
		InterApp.launchUri( args.data.uri );

	}

}

function showSpoiler() {

	spoilerVisible.value = !spoilerVisible.value;

}

module.exports = {
	replyToPost: replyToPost,
	rePost: rePost,
	reposting: reposting,
	favouritePost: favouritePost,
	favouriting: favouriting,
	gotoUser: gotoUser,
	gotoPost: gotoPost,
	wordClicked: wordClicked,
	spoilerVisible: spoilerVisible,
	showSpoiler: showSpoiler,
	timeSince: timeSince
};
