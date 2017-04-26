var api = require( 'assets/js/api' );
var helper = require( 'assets/js/helper' );
var settings = require( 'assets/js/settings' );

var HtmlEnt = require( 'assets/js/he/he.js' );
var Observable = require("FuseJS/Observable");

// used in callback functions for reposting and favouriting
var _this = this;

var postid = 0;
var userid = 0;
var username = '';
var mentions = {};
var timeSince = Observable( '' );
var type = Observable();
var hasContent = Observable( true );

var spoilerText = Observable();
var unprocessedContent = '';
var contentInParagraphs = Observable();
var contentInWords = Observable();
var originalContentInParagraphs = Observable();
var originalContentInWords = Observable();


// true while favouriting/reposting/translating
var favouriting = Observable( false );
var reposting = Observable( false );
var translating = Observable( false );
var flagging = Observable( false );

var userHasReposted = Observable( false );
var userHasFavourited = Observable( false );
var userHasFlagged = Observable( true );

var isTranslated = Observable( false );

var showTranslation = Observable( function() {
	return settings.loadSetting( 'showTranslationsButton' );
} );

var isRepost = Observable( false );

this.post.onValueChanged( module, function( newValue ) {

	if ( null == newValue ) {
		return;
	}

	postid = newValue.postid;
	userid = newValue.userid;
	username = newValue.username;
	mentions = newValue.mentions;

	type.value = newValue.type;
	hasContent.value = newValue.hascontent;

	// reblog
	isRepost.value = ( newValue.rebloggerId > 0 );

	// mention
	if ( ( 'undefined' != typeof newValue.type ) && ( 'undefined' != typeof newValue.accountData ) ) {
		userid = newValue.accountData.id;
		username = newValue.accountData.acct;
	}

	// follower notifications do not have post content
	if ( 'follow' != newValue.type ) {
		spoilerText.value = newValue.status.spoiler_text;
		unprocessedContent = newValue.status.content;
		contentInParagraphs = newValue.cleanContent;
		contentInWords = newValue.clickableContent;
	}

	userHasReposted.value = newValue.status.reposted;
	userHasFavourited.value = newValue.status.favourited;

	timeSince.value = helper.timeSince( newValue.status.created_at );

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
		console.log( err.message );
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
		console.log( JSON.stringify( err.message ) );
		favouriting.value = false;
	});

}

function gotoReportScreen() {

	console.log( 'clicked on flag for post ' + postid );

	router.push( 'reportcontent', { post: _this.post.value.status, userid: userid, username: username } );

}

function translatePost() {

	if ( !isTranslated.value ) {

		translating.value = true;

		// backup original post content
		originalContentInParagraphs.value = contentInParagraphs.value;
		originalContentInWords.value = contentInWords.value;

		var translation = require( 'assets/js/translations' );
		translation.getTranslation( unprocessedContent )
		.then( function( translation ) {

			var contentparser	= require( 'assets/js/parse.content.js' );
			// TODO this is not working, as cleanContent needs to be called with the whole post object
			contentInParagraphs = contentparser.cleanContent( translation.data.translations[0].translatedText );

			// TODO translate into clickable words

			isTranslated.value = !isTranslated.value;
			translating.value = false;

		} )
		.catch( function( err ) {

			api.setError( 'Could not translate toot: ' + err.message );
			translating.value = false;

		})

	}

}

function gotoPost() {

	router.push( "postcontext", { post: _this.post.value.status } );

}

function gotoUser() {

	router.push( "userprofile", { userid: userid } );

}

function gotoTag( args ) {

	router.push( "hashtag", { tag: args.data.name } );

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

	timeSince: timeSince,

	type: type,
	hasContent: hasContent,

	isRepost: isRepost,
	gotoReblogger: gotoReblogger,

	replyToPost: replyToPost,

	rePost: rePost,
	reposting: reposting,
	userHasReposted: userHasReposted,

	favouritePost: favouritePost,
	favouriting: favouriting,
	userHasFavourited: userHasFavourited,

	gotoReportScreen: gotoReportScreen,

	spoilerText: spoilerText,
	contentInParagraphs: contentInParagraphs,
	contentInWords: contentInWords,

	translating: translating,
	isTranslated: isTranslated,
	showTranslation: showTranslation,
	translatePost: translatePost,

	gotoUser: gotoUser,
	gotoPost: gotoPost,
	gotoTag: gotoTag,

	wordClicked: wordClicked

};
