var nav = require("assets/js/navigation");

var data = require( 'assets/js/data' );
setup();

function setup() {

  console.log( 'public timeline activated' );
  data.loadPublicTimeline();

  nav.menuVisible.value = 'Visible';
  nav.showBackButton.value = false;
}

function goBack() {
	router.goBack();
}

module.exports = {
  posts: data.posts.public,
  goBack: goBack,
	setup: setup
}
