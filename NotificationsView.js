var nav = require("assets/js/navigation");
nav.menuVisible.value = 'Visible';

var data = require( 'assets/js/data' );
data.loadNotificationsTimeLine();

function replyToPost( args ) {

  // console.log( ' <<<<<<<<<<<<<< ' );
  // console.log( JSON.stringify( args.data.id ) );
  // console.log( ' >>>>>>>>>>>>>> ' );
  router.push( "write", { postid: args.data.id, account: args.data.account.username } );

}

function rePost( args ) {
  // console.log( JSON.stringify( args ) );
  data.rePost( args.data );
}

function favouritePost( args ) {
  console.log( 'favourite post in TimelineView.js' );
  data.favouritePost( args.data );
}

module.exports = {
  posts: data.posts.notifications,
  menuVisible: nav.menuVisible,
  replyToPost: replyToPost,
  rePost: rePost,
  favouritePost: favouritePost
};
