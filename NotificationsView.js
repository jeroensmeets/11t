var nav = require("assets/js/navigation");
var data = require( 'assets/js/data' );
setup();

function setup() {

  console.log( 'notifications timeline activated' );
  data.loadNotificationsTimeLine();

  nav.menuVisible.value = 'Visible';
  nav.showBackButton.value = false;
}

module.exports = {
  posts: data.posts.notifications,
  setup: setup
};
