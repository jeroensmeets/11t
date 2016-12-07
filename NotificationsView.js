var InterApp = require("FuseJS/InterApp");

var nav = require("assets/js/navigation");
nav.menuVisible.value = 'Visible';

var data = require( 'assets/js/data' );
data.loadNotificationsTimeLine();

function replyToPost( args ) {
  router.push( "write", { postid: args.data.status.id, account: args.data.account.username } );
}

function rePost( args ) {
  data.rePost( args.data.status.id, args.data.status.reblogged );
}

function favouritePost( args ) {
  data.favouritePost( args.data.status.id, args.data.status.favourited );
}

function gotoUser( args ) {
  // TODO in notifications, we have args.data.account and args.data.status.account
  router.push( "userprofile", { userprofile: args.data.account } );
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
  posts: data.posts.notifications,
  menuVisible: nav.menuVisible,
  replyToPost: replyToPost,
  rePost: rePost,
  favouritePost: favouritePost,
  gotoUser: gotoUser,
  wordClicked: wordClicked
};
