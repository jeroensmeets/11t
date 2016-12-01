var nav = require("assets/js/navigation");
nav.menuVisible.value = 'Collapsed';

var data = require("assets/js/data");

function goHome() {
  router.goto( 'timeline' );
}

function goNotifications() {
  router.goto( 'notifications' );
}

function goWrite() {
  router.goto( 'write' );
}

var Lifecycle = require('FuseJS/Lifecycle');
Lifecycle.on("enteringInteractive", function() {
  // app activated
  console.log( 'refreshing all timelines' );
  data.refreshAllTimelines();
});

module.exports = {
  menuVisible: nav.menuVisible,
  goHome: goHome,
  goNotifications: goNotifications,
  goWrite: goWrite,
  loading: data.loading
}
