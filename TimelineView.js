var InterApp = require("FuseJS/InterApp");

var nav = require("assets/js/navigation");
nav.menuVisible.value = 'Visible';

var data = require( 'assets/js/data' );
data.loadHomeTimeLine();

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
  // var HtmlEnt = require( 'assets/js/he/he.js' );
  // args.data.account.note = HtmlEnt.decode( args.data.account.note );
  console.log( JSON.stringify( args.data.account ) );
  router.push( "userprofile", { userid: args.data.account.id } );
}

function wordClicked( args ) {
  // console.log( JSON.stringify( args.data ) );
  if ( args.data.mention ) {
    router.push( "userprofile", { userid: args.data.userid } );
  } else if ( args.data.link ) {
    InterApp.launchUri( args.data.uri );
  }
}

module.exports = {
  posts: data.posts.home,
  menuVisible: nav.menuVisible,
  replyToPost: replyToPost,
  rePost: rePost,
  favouritePost: favouritePost,
  gotoUser: gotoUser,
  wordClicked: wordClicked
};
