var data = require( 'assets/js/data' );
var nav = require("assets/js/navigation");
nav.menuVisible.value = 'Collapsed';

if ( data.loadAccessToken() ) {
  router.goto( 'timeline' );
} else {
  // code not loaded,
  // let user log in
}

function startOAuth() {
  console.log( 'starting oauth' );
  router.goto( 'login' );
}

module.exports = {
  msg: data.msg,
  menuVisible: nav.menuVisible,
  startOAuth: startOAuth
};
