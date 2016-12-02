var Observable      = require("FuseJS/Observable");
var Storage         = require("FuseJS/Storage");
var FILE_DATACACHE  = 'data.cache.json';
var FILE_FAVOCACHE  = 'favourites.data.cache.json';

var HtmlEnt         = require( 'assets/js/he/he.js' );

// api credentials
var api = require( 'assets/js/api' );

var posts = {
  public        : Observable(),
  home          : Observable(),
  notifications : Observable(),
  user          : Observable(),
  favourites    : Observable()
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

function loadUserTimeLine( userid ) {
  // console.log( JSON.stringify( userid ) );
  loadTimeline( 'user', userid );
}

function loadUserFavourites() {

}

function refreshAllTimelines() {
  for ( var i in posts ) {
    loadTimeline( i );
  }
}

function loadTimeline( _type, _id ) {

  loading.value = true;

  if ( 'user' != _type ) {
    loadFromCache( _type );
  } else {
    if ( 1 == arguments.length ) {
      return false;
    }
  }

  if ( !loadAccessToken() ) {
    console.log( 'error loading access token' );
    loading.value = false;
    return false;
  }

  // console.log( 'loading public timeline with code ' + AccessToken.value );

  api.loadPosts( _type, AccessToken.value, _id ).then(

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

  return new Promise( function( resolve, reject ) {

    var _resolve = resolve;
    var _reject = reject;

    api.sendPost( _txt, _inreplyto, AccessToken.value ).then(

      function( data ) {

        loading.value = false;
        _resolve();
      }

    ).catch(

      function( error ) {
        console.log( JSON.parse( error ) );
        loading.value = false;
        _reject();
      }

    );

  });

}

function rePost( _postid, _currentstatus ) {

  api.rePost( _postid, AccessToken.value, _currentstatus ).then(

    function( result ) {

      if ( result.err ) {
        // TODO show this has gone wrong
      } else {
        updateAllOccurences( result.post, 'reblogged', !_currentstatus );
      }

    }

  ).catch(

    function( error ) {
      console.log( JSON.parse( error ) );
    }

  );

}

function favouritePost( _postid, _currentstatus ) {

  api.favouritePost( _postid, AccessToken.value, _currentstatus ).then(

    function( result ) {

      if ( result.err ) {
        // TODO show this has gone wrong
      } else {
        updateAllOccurences( result.post, 'favourited', !_currentstatus );
      }

    }
  ).catch(

    function( error ) {
      console.log( 'favourited returned in catch()' );
      console.log( JSON.stringify( error ) );
    }

  );


}

function updateAllOccurences( _post, _parameter, _value ) {

  for ( var i in posts ) {

    // todo: both solutions below are not perfect and both do not update the screen (which is the only purpose of this function)

    // posts[ i ].refreshAll(
    //   [ _post ],
    //   // compare on ID
    //   function(oldItem, newItem){
    //     return oldItem.id == newItem.id;
    //   },
    //   // update value
    //   function(oldItem, newItem){
    //     oldItem[ _parameter ] = _value;
    //   }
    //
    // );

    // // TODO two for loops, really?
    // posts[ i ].forEach(
    //   function( p ) {
    //     // notification?
    //     if ( 'boolean' == typeof p.isMention ) {
    //
    //       // wait! if this is a follow notification, we have no data about a post
    //       if ( true !== p.isFollow ) {
    //         if ( _postid == p.status.id ) {
    //           console.log( ' >>> notification! setting ' + _parameter + ' for post ' + _postid + ' to ' + _value.toString() );
    //           p.status[ _parameter ] = _value;
    //         }
    //       }
    //
    //     } else {
    //       if ( _postid == p.id ) {
    //         console.log( ' >>> regular post! setting ' + _parameter + ' for post ' + _postid + ' to ' + _value.toString() );
    //         p[ _parameter ] = _value;
    //       }
    //     }
    //   }
    // );

  }

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
    this.content            = HtmlEnt.decode( this.content );
    this.timesince          = timeSince( this.status.created_at );
    this.media_attachments  = this.status.media_attachments.slice(0, 1);

  }

}

function MastodonPost( info ) {

  this.isReblog     = ( null !== info.reblog );

  if ( this.isReblog ) {
    this.reblogname =  info.account.display_name;
    info            = info.reblog;
  }

  for (var i in info ) {
    this[ i ] = info[ i ];
  }

  this.content            = this.content.replace( /<[^>]+>/ig, '' );
  this.content            = HtmlEnt.decode( this.content );
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
  loadUserTimeLine: loadUserTimeLine,
  loadUserFavourites: loadUserFavourites,
  refreshAllTimelines: refreshAllTimelines,
  sendPost: sendPost,
  rePost: rePost,
  favouritePost: favouritePost,
  posts: posts,
  msg: msg,
  loading: loading
}
