var Observable = require("FuseJS/Observable");
var data = require("assets/js/data");

function goHome() {
  router.goto( 'timeline' );
}

function goNotifications() {
  data.loadFromCache( 'notifications' );
  router.goto( 'notifications' );
}

function goWrite() {
  router.push( 'write' );
}

function goPublic() {
  data.loadFromCache( 'public' );
  router.goto( 'publictimeline' );
}

function goBack() {
	router.goBack();
}

function refreshData() {

  router.getRoute( function(route) {
    switch ( route[0] ) {
      case 'timeline':
        data.loadHomeTimeLine();
        break;
      case 'notifications':
        data.loadNotificationsTimeLine();
        break;
      case 'public':
        data.loadPublicTimeline();
        break;
    }
  } );
}

var Lifecycle = require('FuseJS/Lifecycle');
Lifecycle.on("enteringInteractive", function() {
  // app activated
  refreshData();
});

module.exports = {
  goHome: goHome,
  goNotifications: goNotifications,
  goWrite: goWrite,
  goPublic: goPublic,
  loading: data.loading,
  refreshData: refreshData,
  goBack: goBack
}
