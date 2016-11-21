var nav = require("assets/js/navigation");
nav.menuVisible.value = 'Visible';

var data = require( 'assets/js/data' );
data.loadHomeTimeLine();

module.exports = {
  posts: data.posts.home,
  menuVisible: nav.menuVisible
};
