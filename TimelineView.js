var nav = require("assets/js/navigation");
var data = require( 'assets/js/data' );
setup();

function setup() {

  console.log( 'home timeline activated' );
  data.loadHomeTimeLine();

  nav.menuVisible.value = 'Visible';
  nav.showBackButton.value = false;
}

module.exports = {
  posts: data.posts.home,
  menuVisible: nav.menuVisible,
  setup: setup
};
