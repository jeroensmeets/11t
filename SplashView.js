var data = require( 'assets/js/data' );
var nav = require("assets/js/navigation");
nav.menuVisible.value = 'Collapsed';

var Observable = require("FuseJS/Observable");
var loginButtonVisible = Observable( 'Collapsed' );

data.loadFromCache();

if ( data.loadAccessToken() ) {
  setTimeout( function() { router.goto( 'timeline' ); }, 3000 );
} else {
  // code not loaded, let user log in
  loginButtonVisible.value = 'Visible';
}

function startOAuth() {
  console.log( 'starting oauth' );
  router.goto( 'login' );
}

module.exports = {
  msg: data.msg,
  menuVisible: nav.menuVisible,
  startOAuth: startOAuth,
  loginButtonVisible: loginButtonVisible
};
