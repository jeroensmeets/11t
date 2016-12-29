var Observable = require("FuseJS/Observable");

var nav = require("assets/js/navigation");
nav.menuVisible.value = 'Collapsed';

var webviewVisible = Observable( 'Collapsed' );

var auth = require("assets/js/auth");

var oAuthUri = Observable( "https://mastodon.social/oauth/authorize?client_id=" + auth.client_id
        + "&redirect_uri=" + encodeURIComponent( auth.redirect_uri )
        + "&response_type=code"
        + "&scope=read+write+follow" );

function webViewUrlChanged( ) {

  var api = require( 'assets/js/api' );
  var uriparts = api.parseUri( oAuthUri.value );
  if ( 'mastodon.jeroensmeets.net' != uriparts.host ) {
    return;
  }

  // console.log( 'oauth process finished' );

  webviewVisible.value = 'Collapsed';

  var code = '';
  var error = false;

  var getargs = uriparts.query.split('&');
  for (var i = 0; i < getargs.length; i++) {
    if ( !getargs[i] ) { continue; }
    var getarg = getargs[i].split( '=' );
    // console.log( getarg[ 0 ] + ': ' + getarg[ 1 ] );
    if ( 'code' == getarg[ 0 ] ) {
      code = getarg [ 1 ];
    }
    if ( 'error' == getarg[ 0 ] ) {
      error = true;
    }
  }

  if ( error ) {
    console.log( 'error in oauth step 1' );
    router.goto( 'splash' );
  } else {

    // ok, we have an auth token, now ask for the acces token
    api.getAccessToken( code ).then(
      function( access_token ) {
        // {"access_token":"0ddb922452c983a70566e30dce16e2017db335103e35d783874c448862a78168",
        // "token_type":"bearer",
        // "expires_in":7200,
        // "refresh_token":"f2188c4165d912524e04c6496d10f06803cc08ed50271a0b0a73061e3ac1c06c",
        // "scope":"public"}
        console.log( 'received access token ' + access_token.access_token );
        var data = require( 'assets/js/data' );
        if ( data.saveAccessToken( access_token ) ) {
          console.log( 'saved access token to file' );
          router.goto( 'timeline' );
        } else {
          console.log( 'could not save access token to file' );
          router.goto( 'splash' );
        }

      }
    ).catch( function( error ) {
      console.log( 'error in getting access token' );
      router.goto( 'splash' );
    })

  }

}

module.exports = {
  oAuthUri: oAuthUri,
  webViewUrlChanged: webViewUrlChanged
}
