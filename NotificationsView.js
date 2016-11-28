var nav = require("assets/js/navigation");
nav.menuVisible.value = 'Visible';

var data = require( 'assets/js/data' );
data.loadNotificationsTimeLine();

module.exports = {
  posts: data.posts.notifications,
  menuVisible: nav.menuVisible
};
