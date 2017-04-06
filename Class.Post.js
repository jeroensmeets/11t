var api = require( 'assets/js/api' );
var helper = require( 'assets/js/helper' );

var _this = this;

var Observable = require("FuseJS/Observable");

var favouriting = Observable( false );
var reposting = Observable( false );

var who = this.Parameter.map( function( param ) {
	return param.who;
});

var postid = 0;
var userid = 0;
var rebloggerid = 0;
var username = '';
var mentions = [];

var isRepost = Observable( false );
var isFavourite = Observable( false );

var multipleMedia = Observable( false );
var mediaSensitive = Observable();
var timeSince =  Observable( '' );

this.post.onValueChanged( module, function( newValue ) {

	if ( 'undefined' != typeof newValue ) {

		if ( ( 'notifications' == newValue.posttype ) && ( 'follow' == newValue.type ) ) {
			return;
		}

		postid = ( 'notifications' == newValue.posttype ) ? newValue.status.id : newValue.id;

		timeSince.value = helper.timeSince( newValue.created_at );
		multipleMedia.value = newValue.media_attachments && ( newValue.media_attachments.length > 1 );
		userid = newValue.account.id;
		username = newValue.account.acct;
		mentions = newValue.mentions;

		isRepost.value = newValue.reposted;
		isFavourite.value = newValue.favourited;

		mediaSensitive.value = newValue.sensitive;

		if ( newValue.isRepost ) {
			rebloggerid = newValue.whoid;
		}
	}

} );

function replyToPost( ) {

	router.push( "write", { postid: postid, mentions: mentions, firstup: username } );

}

function rePost( ) {

	reposting.value = true;
	api.rePost( postid, _this.post.value.reposted ).then( function() {
		reposting.value = false;
		isRepost.value = !isRepost.value;
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
		isFavourite.value = !isFavourite.value;
	}).catch( function( err ) {
		console.log( 'error in favouritePost' );
		console.log( JSON.stringify( err ) );
		favouriting.value = false;
	});

}

function gotoPost( ) {

	console.log( postid );

	router.push( "postcontext", { postid: postid } );

}

function gotoUser( ) {

	router.push( "userprofile", { userid: userid } );

}

function gotoReblogger() {

	if ( rebloggerid > 0 ) {
		router.push( "userprofile", { userid: rebloggerid } );
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
	replyToPost: replyToPost,
	rePost: rePost,
	reposting: reposting,
	isRepost: isRepost,
	favouritePost: favouritePost,
	favouriting: favouriting,
	isFavourite: isFavourite,
	gotoUser: gotoUser,
	gotoReblogger: gotoReblogger,
	gotoPost: gotoPost,
	wordClicked: wordClicked,
	multipleMedia: multipleMedia,
	timeSince: timeSince
};
