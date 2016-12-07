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

// for showing a userprofile on UserProfileView.ux
var userprofile = Observable();

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

function loadUserProfile( _userid ) {

  // console.log( 'getting user profile for user id ' + _userid.value );

  api.loadUserProfile( _userid.value, AccessToken.value ).then(

    function( result ) {

      if ( result.err ) {
        // TODO show this has gone wrong
        console.log( 'error in loading user profile: ' + JSON.stringify( result ) );
      } else {
        console.log( 'loaded user profile: ' + JSON.stringify( result ) );
        var _userprofile = result.userprofile;
        _userprofile.note = HtmlEnt.decode( _userprofile.note );
        _userprofile.note = _userprofile.note.replace( /<[^>]+>/ig, '' );
        userprofile.value = _userprofile;
      }

    }
  ).catch(

    function( error ) {
      console.log( 'favourited returned in catch()' );
      console.log( JSON.stringify( error ) );
    }

  );

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

    this.content            = preparePostContent( this.status );
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

  this.content            = preparePostContent( info );
  this.timesince          = timeSince( this.created_at );

  // TODO show all attachments
  this.media_attachments  = this.media_attachments.slice(0, 1);

}

function preparePostContent( postdata ) {

  console.log( JSON.stringify( postdata ) );

  // replace HTML codes like &amp; and &gt;
  var _content = HtmlEnt.decode( postdata.content );

  // temporary replace urls to prevent splitting on spaces in linktext
  var regex = /<[aA].*?\s+href=["']([^"']*)["'][^>]*>(?:<.*?>)*(.*?)(?:<.*?>)?<\/[aA]>/igm ;
  var _uris = _content.match( regex );
  if ( _uris && ( _uris.length > 0 ) ) {
    for ( var i in _uris ) {
      _content = _content.replace( _uris[ i ], '[[[[' + i );
    }
  }

  // now remove al HTML tags
  _content = _content.replace( /<[^>]+>/ig, '' );

  var result = Observable();

  var _words = _content.split( /\s/g );

  // to make this construction as responsive as possible,
  // I string words together until a link is found.
  // var _stringWordsTogether = '';
  for ( var i in _words ) {
    if ( '[[[[' == _words[ i ].substring( 0, 4 ) ) {
      // we hit a link. Anything in plaintext yet?
      // if ( '' != _stringWordsTogether ) {
      //   result.add( { word: _stringWordsTogether } );
      //   _stringWordsTogether = '';
      // }

      // now add the link
      var _linkId = Number.parseInt( _words[ i ].replace( '[[[[', '' ) );
      var _linkTxt = _uris[ _linkId ].replace( /<[^>]+>/ig, '' );
      // console.log( _linkTxt );

      var _mentioner = postdata.mentions.filter( function (obj) { return '@' + obj.acct === _linkTxt; });
      if ( _mentioner.length > 0 ) {
        result.add( { mention: true, word: _linkTxt, makeBold: true, userid: _mentioner[0].id } );
      } else if ( postdata.tags.some( function (obj) { return '@' + obj.hashtag === _linkTxt; }) ) {
        // TODO add hashtags
      } else if ( postdata.media_attachments.some( function (obj) { return ( _linkTxt.indexOf( obj.id ) > -1 ); }) ) {
        // do not show the urls for media_attachments in the content
      } else {
        // TODO add actual link to array
        console.log( _uris[ _linkId ] );
        var _linkstart = _uris[ _linkId ].indexOf( 'href="' ) + 6;
        // console.log( _linkstart );
        var _linkend = _uris[ _linkId ].indexOf( '"', _linkstart );
        // console.log( _linkEnd );
        var _linkUrl = _uris[ _linkId ].substring( _linkstart, _linkend );
        console.log( _linkUrl );
        result.add( { link: true, word: _linkTxt, uri: _linkUrl, makeBold: true } );
      }
    } else {
      //_stringWordsTogether += ' ' + _words[ i ];
      result.add( { word: _words[ i ], makeBold: false } );
    }
  }

  // if ( '' != _stringWordsTogether ) {
  //   result.add( { word: _stringWordsTogether } );
  // }

  return result;

}

// function preparePostContentOld( postdata ) {
//
//   var _placeholder = 'PLCHLDRAEOE';
//
//   // replace HTML codes like &amp; and &gt;
//   var _content = HtmlEnt.decode( postdata.content );
//
//   // temporary replace urls to prevent splitting on spaces in linktext
//   var regex = /<[aA].*?\s+href=["']([^"']*)["'][^>]*>(?:<.*?>)*(.*?)(?:<.*?>)?<\/[aA]>/igm ;
//   var _uris = _content.match( regex );
//   if ( _uris && ( _uris.length > 0 ) ) {
//     for ( var i in _uris ) {
//       _content = _content.replace( _uris[ i ], _placeholder + i );
//     }
//   }
//
//   // now remove al HTML tags
//   _content = _content.replace( /<[^>]+>/ig, '' );
//
//   var result = Observable();
//
//   // _words = _content.split( /\b/g );
//   _words = _content.split( /\s/g );
//   for ( var i in _words ) {
//
//     // So take a look at me now Well there's just an empty space
//     if ( ' ' == _words[ i ] ) {
//       // TODO adjust regex to not report spaces
//     } else if ( 0 == _words[ i ].indexOf( _placeholder ) ) {
//       // we've got a link
//       var _linkId = Number.parseInt( _words[ i ].replace( _placeholder, '' ) );
//       var _linkTxt = _uris[ _linkId ].replace( /<[^>]+>/ig, '' );
//       console.log( _linkTxt );
//       if ( postdata.mentions.some( function (obj) { return '@' + obj.acct === _linkTxt; }) ) {
//         result.add( { word: _linkTxt, makeBold: true, username: _linkTxt } );
//       } else if ( postdata.media_attachments.some( function (obj) { return ( _linkTxt.indexOf( obj.id ) > -1 ); }) ) {
//         // do not show the urls for media_attachments in the content
//       }
//     } else {
//       result.add( { word: _words[ i ], makeBold: false } );
//     }
//     //
//     //
//     //
//     //
//     // if ( postdata.media_attachments.some( function (obj) { return ( _words[ i ].indexOf( obj.id ) > -1 ); }) ) {
//     //   // do not show the urls for media_attachments in the content
//     // } else if ( postdata.mentions.some( function (obj) { return '@' + obj.acct === _words[ i ]; }) ) {
//     //   result.add( { word: _words[ i ], mention: true, username: _words[ i ], tag: false } );
//     // } else if ( postdata.tags.some( function (obj) { return '#' + obj.name === _words[ i ]; }) ) {
//     //   result.add( { word: _words[ i ], mention: false, tag: true, tagname: _words[ i ] } );
//     // } else {
//     //   result.add( { word: _words[ i ], mention: false, tag: false } );
//     // }
//
//   }
//
//   return result;
// }

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
  loadUserProfile: loadUserProfile,
  loadUserFavourites: loadUserFavourites,
  refreshAllTimelines: refreshAllTimelines,
  sendPost: sendPost,
  rePost: rePost,
  favouritePost: favouritePost,
  posts: posts,
  msg: msg,
  loading: loading,
  userprofile: userprofile
}
