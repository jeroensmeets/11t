var nav = require("assets/js/navigation");
nav.menuVisible.value = 'Visible';
nav.showBackButton.value = true;

var Observable = require("FuseJS/Observable");

var data = require( 'assets/js/data' );
data.loadPublicTimeline();

function replyToPost( args ) {
  router.push( "write", { postid: args.data.id, account: args.data.account.username } );
}

function rePost( args ) {
  data.rePost( args.data.id, args.data.reblogged );
}

function favouritePost( args ) {
  data.favouritePost( args.data.id, args.data.favourited );
}

function gotoUser( args ) {
  var HtmlEnt = require( 'assets/js/he/he.js' );
  args.data.account.note = HtmlEnt.decode( args.data.account.note );
  console.log( JSON.stringify( args.data.account ) );
  router.push( "userprofile", { userprofile: args.data.account } );
}

function goBack() {
	router.goBack();
}

module.exports = {
  posts: data.posts.public,
  goBack: goBack,
  replyToPost: replyToPost,
  rePost: rePost,
  favouritePost: favouritePost,
  gotoUser: gotoUser
}
