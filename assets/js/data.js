var Observable      = require("FuseJS/Observable");
var Storage         = require("FuseJS/Storage");

var AccessToken     = Observable( false );
var at_file         = "access_code.txt";

function saveAccessToken( token ) {
  AccessToken.value = token;
  return Storage.writeSync( at_file, token );
}

function loadAccessToken( ) {

  if ( false != AccessToken.value ) {
    return true;
  }

  try {
    var token = Storage.readSync( at_file );
  }
  catch( e ) {
    return false;
  }

  if ( '' == token ) {
    return false;
  } else {
    AccessToken.value = token;
    return true;
  }

}

var Storage = require("FuseJS/Storage");

// api credentials
var api = require( 'assets/js/api' );

var posts = {
  public      : Observable(),
  home        : Observable()
}
var msg = Observable('');

function loadPublicTimeline() {
  loadTimeline( 'public' );
}

function loadHomeTimeLine() {
  loadTimeline( 'home' );
}

function loadTimeline( _type ) {

  if ( !loadAccessToken() ) {
    console.log( 'error loading access token' );
    return false;
  }

  // console.log( 'loading public timeline with code ' + AccessToken.value );

  api.loadPosts( _type, AccessToken.value ).then( function( data ) {

    console.log( 'data loaded, count ' + data.length );
    for (var i in data ) {
      posts[ _type ].add( new MastodonPost( data[i] ) );
    }

    msg.value = 'Timeline loaded';

  });



}

function MastodonPost( info ) {
  for (var i in info ) {
    this[ i ] = info[ i ];
  }
  this.content            = this.content.replace( /<[^>]+>/ig, '' );
  this.timesince          = timeSince( this.created_at );
  this.media_attachments  = this.media_attachments.slice(0, 1);
  // this.account_username   = '@' + account_username;
}

function timeSince(date) {

    var seconds = Math.floor( ( new Date() - new Date( date ) ) / 1000 );

    var interval = Math.floor(seconds / 31536000);
    if (interval > 1) { return interval + "y"; }

    interval = Math.floor(seconds / 2592000);
    if (interval > 1) { return interval + "m"; }

    interval = Math.floor(seconds / 86400);
    if (interval > 1) { return interval + "d"; }

    interval = Math.floor(seconds / 3600);
    if (interval > 1) { return interval + "h"; }

    interval = Math.floor(seconds / 60);
    if (interval > 1) { return interval + "m"; }

    return Math.floor(seconds) + "s";
}

module.exports = {
  loadAccessToken: loadAccessToken,
  saveAccessToken: saveAccessToken,
  loadPublicTimeline: loadPublicTimeline,
  loadHomeTimeLine: loadHomeTimeLine,
  posts: posts,
  msg: msg
}
