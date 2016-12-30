var nav = require("assets/js/navigation");
nav.menuVisible.value = 'Collapsed';
nav.showBackButton.value = false;

var data = require("assets/js/data");

function goHome() {
  router.goto( 'timeline' );
}

function goNotifications() {
  router.goto( 'notifications' );
}

function goWrite() {
  router.push( 'write' );
}

function goPublic() {
  router.goto( 'publictimeline' );
}

function goBack() {
  nav.showBackButton.value = false;
	router.goBack();
}

function refreshData() {
  data.refreshCurrentTimeline();
}

var Lifecycle = require('FuseJS/Lifecycle');
Lifecycle.on("enteringInteractive", function() {
  // app activated
  console.log( 'refreshing all timelines' );
  data.refreshCurrentTimeline();
});

module.exports = {
  menuVisible: nav.menuVisible,
  goHome: goHome,
  goNotifications: goNotifications,
  goWrite: goWrite,
  goPublic: goPublic,
  loading: data.loading,
  refreshData: refreshData,
  showBackButton: nav.showBackButton,
  goBack: goBack
}
