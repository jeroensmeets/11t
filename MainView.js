var Observable = require("FuseJS/Observable");
var data = require("assets/js/data");

function goWrite() {
  router.push( 'write' );
}

function goHome() {
  // data.loadFromCache( 'home' );
  // router.goto( 'home' );
  gotoPage( 'home' );
}

function goNotifications() {
  // data.loadFromCache( 'notifications' );
  // router.goto( 'notifications' );
  gotoPage( 'notifications' );
}

function goPublic() {
  // data.loadFromCache( 'publictimeline' );
  // router.goto( 'publictimeline' );
  gotoPage( 'publictimeline' );
}

function goBack() {
	router.goBack();
}

function gotoPage( _pageid, _pushit ) {

  if ( 0 == arguments ) {
    return;
  }

  data.loadFromCache( _pageid );

  if ( 1 == arguments ) {
    var _pushit = false;
  }

  if ( _pushit ) {
    router.push( _pageid );
  } else {
    router.goto( _pageid );
  }

  setTimeout( function() { data.loadTimeline( _pageid ); }, 500 );

}

function refreshData(  ) {

  router.getRoute( function( route ) {
    data.loadTimeline( route[ 0 ] );
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
