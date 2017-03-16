var _this = this;

var api = require( 'assets/js/api' );

var Observable = require("FuseJS/Observable");
var InterApp = require("FuseJS/InterApp");

var postObj = Observable();
var postid = 0;
var userid = 0;
var username = '';

var isFavourited = Observable( false );
var isReposted = Observable( false );
var mentions = false;

var favouriting = Observable( false );
var reposting = Observable( false );
var spoilerVisible = Observable( false );

this.post.onValueChanged( module, function( newValue ) {

	if ( 'undefined' != typeof newValue ) {
		postObj.value = newValue;
		postid = newValue.id;
		userid = newValue.isNotification ? newValue.whodidthis.id : newValue.account.id;
		username = newValue.isNotification ? newValue.whodidthis.acct : newValue.account.acct;
		mentions = newValue.mentions;
		isFavourited.value = newValue.favourited;
		isReposted.value = newValue.reposted;
		spoilerVisible.value = ( '' == newValue.spoiler_text );
	}
} );

function replyToPost() {
	router.push( "write", { postid: postid, mentions: mentions, firstup: username } );
}

function rePost( args ) {

	reposting.value = true;
	api.rePost( postid, isReposted.value ).then( function() {
		isReposted.value = !isReposted.value;
		reposting.value = false;
	}).catch( function( err ) {
		console.log( 'error in rePost' );
		console.log( JSON.stringify( err ) );
		reposting.value = false;
	});

}

function favouritePost( args ) {

	favouriting.value = true;
	api.favouritePost( postid, isFavourited.value ).then( function() {
		isFavourited.value = !isFavourited.value;
		favouriting.value = false;
	}).catch( function( err ) {
		console.log( 'error in favouritePost' );
		console.log( JSON.stringify( err ) );
		favouriting.value = false;
	});

}

function gotoPost() {
	if ( postid > 0 ) {
		router.push( "postcontext", { postid: postid } );
	}
}

function gotoUser( args ) {
	if ( userid > 0 ) {
		router.push( "userprofile", { userid: userid } );
	}
}

function wordClicked( args ) {

	// console.log( JSON.stringify( args.data ) );
	if ( args.data.mention ) {
		router.push( "userprofile", { userid: args.data.userid } );
	} else if ( args.data.link ) {
		InterApp.launchUri( args.data.uri );
	}

}

function showSpoiler() {
	spoilerVisible.value = !spoilerVisible.value;
}

module.exports = {
	postObj: postObj,
	replyToPost: replyToPost,
	rePost: rePost,
	isReposted: isReposted,
	reposting: reposting,
	favouritePost: favouritePost,
	isFavourited: isFavourited,
	favouriting: favouriting,
	gotoUser: gotoUser,
	gotoPost: gotoPost,
	wordClicked: wordClicked,
	spoilerVisible: spoilerVisible,
	showSpoiler: showSpoiler
};
