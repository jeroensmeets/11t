var Observable      = require("FuseJS/Observable");
var Storage         = require("FuseJS/Storage");
var FILE_DATACACHE  = 'data.cache.json';

// api credentials
var api = require( 'assets/js/api' );

var posts = {
  public        : Observable(),
  home          : Observable(),
  notifications : Observable()
}

var msg = Observable('');
var loading = Observable( false );

var AccessToken     = Observable( false );
var at_file         = "access_code.json";

function loadFromCache( _type ) {

  Storage.read( _type + '.' + FILE_DATACACHE )
    .then(function(contents) {
      if ( '' != contents ) {
        var _json = JSON.parse( contents );
        if ( ( 'object' == typeof _json ) && ( _json.length > 0 ) ) {
          posts[ _type ] = _json;
        }
      }
    }, function(error) {
      console.log(error);
    });
}

function saveToCache() {
  for ( var _type in posts ) {
    Storage.write( _type + '.' + FILE_DATACACHE, JSON.stringify( posts[ _type ] ) );
  }
}

function saveAccessToken( token ) {
  AccessToken.value = token.access_token;
  return Storage.writeSync( at_file, token );
}

function loadAccessToken( ) {

  if ( false != AccessToken.value ) {
    return true;
  }

  try {
    var token = Storage.readSync( at_file );
    console.log( 'token from file: ' + token );
  }
  catch( e ) {
    return false;
  }

  if ( '' == token ) {
    return false;
  } else {
    token = JSON.parse( token );
    for ( var i in token ) {
      console.log( i + ': ' + token[i] );
    }
    AccessToken.value = token.access_token;
    return true;
  }

}

function loadPublicTimeline() {
  loadTimeline( 'public' );
}

function loadHomeTimeLine() {
  loadTimeline( 'home' );
}

function loadNotificationsTimeLine() {
  loadTimeline( 'notifications' );
}

function loadTimeline( _type ) {

  loading.value = true;

  loadFromCache( _type );

  if ( !loadAccessToken() ) {
    console.log( 'error loading access token' );
    loading.value = false;
    return false;
  }

  // console.log( 'loading public timeline with code ' + AccessToken.value );

  api.loadPosts( _type, AccessToken.value ).then(

    function( data ) {

      posts[ _type ].refreshAll(
        data,
        // compare ID
        function( oldItem, newItem ) {
          return oldItem.id == newItem.id;
        },
        // Update text
        function( oldItem, newItem ) {
            // oldItem.text.value = newItem.text;
        },
        // Map to object with an observable version of text
        function( newItem ) {
          return ( 'notifications' == _type ) ? new MastodonNotification( newItem ) : new MastodonPost( newItem );
        }
      );

      saveToCache();
      loading.value = false;

    }
  ).catch(

    function( error ) {
      console.log( JSON.parse( error ) );
      loading.value = false;
    }

  );

}

function sendPost( _txt, _inreplyto ) {

  loading.value = true;

  if ( arguments.length < 2 ) {
    _inreplyto = 0;
  }

  api.sendPost( _txt, _inreplyto, AccessToken.value ).then(

    function( data ) {

      console.log( JSON.stringify( data ) );
      loading.value = false;

    }

  ).catch(

    function( error ) {
      console.log( JSON.parse( error ) );
      loading.value = false;
    }

  );

}

function rePost( _post ) {

  api.rePost( _post.id, AccessToken.value, _post.reblogged ).then(

    function( data ) {

      _post.reblogged = true;

    }

  ).catch(

    function( error ) {
      console.log( JSON.parse( error ) );
    }

  );

}

function favouritePost( _post ) {

  console.log( JSON.stringify( _post ) );

  console.log( 'favourite post in data.js, post id is ' + _post.id );

  api.favouritePost( _post.id, AccessToken.value, _post.favourited ).then(

    function( data ) {

      _post.favourited = true;

    }
  ).catch(

    function( error ) {
      console.log( JSON.parse( error ) );
    }

  );


}

function MastodonNotification( info ) {

  // console.log( JSON.stringify( info ) );

  this.isReblog           = ( 'reblog' == info.type );
  this.isMention          = ( 'mention' == info.type );
  this.isFavourite        = ( 'favourite' == info.type );
  this.isFollow           = ( 'follow' == info.type );

  for (var i in info ) {
    this[ i ] = info[ i ];
  }

  if ( this.isFollow ) {

    this.account.note       = this.account.note.replace( /<[^>]+>/ig, '' );

  } else {

    this.content            = this.status.content.replace( /<[^>]+>/ig, '' );
    this.timesince          = timeSince( this.status.created_at );
    this.media_attachments  = this.status.media_attachments.slice(0, 1);

  }

}

function MastodonPost( info ) {

  this.isReblog     = ( null !== info.reblog );

  if ( this.isReblog ) {
    this.reblogname =  info.account.display_name;
    info            = info.reblog;
  } else {
    this.reblogname = null;
  }

  for (var i in info ) {
    this[ i ] = info[ i ];
  }

  this.content            = this.content.replace( /<[^>]+>/ig, '' );
  this.timesince          = timeSince( this.created_at );
  this.media_attachments  = this.media_attachments.slice(0, 1);

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
  loadFromCache: loadFromCache,
  loadAccessToken: loadAccessToken,
  saveAccessToken: saveAccessToken,
  loadPublicTimeline: loadPublicTimeline,
  loadHomeTimeLine: loadHomeTimeLine,
  loadNotificationsTimeLine: loadNotificationsTimeLine,
  sendPost: sendPost,
  rePost: rePost,
  favouritePost: favouritePost,
  posts: posts,
  msg: msg,
  loading: loading
}
