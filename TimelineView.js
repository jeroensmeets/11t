var nav = require("assets/js/navigation");
nav.menuVisible.value = 'Visible';

var data = require( 'assets/js/data' );
data.loadHomeTimeLine();

function rePost( args ) {
  // console.log( JSON.stringify( args ) );
  data.rePost( args.data );
}

function favouritePost( args ) {
  console.log( 'favourite post in TimelineView.js' );
  data.favouritePost( args.data );
}

module.exports = {
  posts: data.posts.home,
  menuVisible: nav.menuVisible,
  rePost: rePost,
  favouritePost: favouritePost
};
