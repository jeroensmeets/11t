var _this = this;

var api = require( 'assets/js/api' );
var helper = require( 'assets/js/helper' );

var Observable = require("FuseJS/Observable");
var InterApp = require("FuseJS/InterApp");

var post = this.Parameter.map( function( param ) {
	return param.post;
})

var favouriting = Observable( false );
var reposting = Observable( false );
var spoilerVisible = Observable( false );

var timeSince =  Observable('');
var postid = 0;
var userid = 0;
var username = Observable('');

this.post.onValueChanged( module, function( newValue ) {

	if ( 'undefined' != typeof newValue ) {
		spoilerVisible.value = ( '' == newValue.spoiler_text );
		timeSince.value = helper.timeSince( newValue.created_at );
		postid = newValue.id;
		userid = newValue.isNotification ? newValue.whodidthis.id : newValue.account.id;
		username.value = newValue.isNotification ? newValue.whodidthis.acct : newValue.account.acct;
	}

} );

function replyToPost() {
	router.push( "write", { postid: postid, mentions: post.mentions, firstup: username } );
}

function rePost( args ) {

	reposting.value = true;
	api.rePost( postid, post.reposted.value ).then( function() {
		post.reposted = post.reposted.not();
		reposting.value = false;
	}).catch( function( err ) {
		console.log( 'error in rePost' );
		console.log( JSON.stringify( err ) );
		reposting.value = false;
	});

}

function favouritePost( args ) {

	favouriting.value = true;
	api.favouritePost( postid, post.favourited.value ).then( function() {
		post.favourited = post.favourited.not();
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
	console.log( userid );
	if ( userid > 0 ) {
		router.push( "userprofile", { userid: userid } );
	}
}

function wordClicked( args ) {

	// console.log( JSON.stringify( args.data ) );
	if ( args.data.mention ) {
		router.push( "userprofile", { userid: userid } );
	} else if ( args.data.link ) {
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
