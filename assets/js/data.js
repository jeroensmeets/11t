var EventEmitter    = require("FuseJS/EventEmitter");
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
  postcontext   : Observable(),
  user          : Observable(),
  favourites    : Observable()
}

var currentTimeline = false;

// for showing a userprofile on UserProfileView.ux
var userprofile = Observable();

var loading         = Observable( false );
var loadingError    = Observable( false );
var msg             = Observable( '' );
function resetErrorMsg() {
  console.log( 'resetting error data' );
  loadingError.value = false;
  msg.value = '';
}

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
  return Storage.writeSync( at_file, JSON.stringify( token ) );
}

function loadAccessToken( ) {

  if ( false != AccessToken.value ) {
    return true;
  }

  try {
    var token = Storage.readSync( at_file );
    // console.log( 'token from file: ' + token );
  }
  catch( e ) {
    return false;
  }

  if ( '' == token ) {
    return false;
  } else {
    token = JSON.parse( token );
    // for ( var i in token ) {
    //   console.log( i + ': ' + token[i] );
    // }
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

function loadPostContext( postid ) {
  posts[ 'postcontext' ].clear();
  loadTimeline( 'postcontext', postid );
}

function loadUserFavourites() {

}

function loadUserProfile( _userid ) {

  // console.log( 'getting user profile for user id ' + _userid.value );

  loadAccessToken();

  api.loadUserProfile( _userid, AccessToken.value ).then(

    function( result ) {

      if ( result.err ) {
        // TODO show this has gone wrong
        console.log( 'error in loading user profile: ' + JSON.stringify( result ) );
      } else {
        // console.log( 'loaded user profile: ' + JSON.stringify( result ) );
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

function refreshCurrentTimeline() {

  if ( false != currentTimeline ) {
    loadTimeline( currentTimeline );
  }

}

function loadTimeline( _type, _id ) {

  if ( loading.value ) {
    return;
  }

  loading.value = true;
  loadAccessToken();

  // clearPosts( _type );

  if ( 'postcontext' != _type ) {
    currentTimeline = _type;
  }

  var endpoint = '';
  switch ( _type ) {
    case 'home':
      endpoint = 'api/v1/timelines/home';
      break;
    case 'notifications':
      endpoint = 'api/v1/notifications';
      break;
    case 'user':
      endpoint = 'api/v1/accounts/' + _id + '/statuses';
      break;
    case 'postcontext':
      endpoint = '/api/v1/statuses/' + _id + '/context';
      break;
    case 'public':
    default:
      endpoint = 'api/v1/timelines/public';
      break;
  }

  // console.log( 'calling API endpoint ' + endpoint + ' with access token ' + AccessToken.value );

  fetch( 'https://mastodon.social/' + endpoint, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
      'Authorization': 'Bearer ' + AccessToken.value
    }
  })
  .then( function( resp ) {
    if ( 200 == resp.status ) {
      return resp.json();
    } else {
      console.log( 'data.loadPosts returned status ' + resp.status );
      loading.value = false;
    }
  })
  .then( function( json ) {
    if ( 'postcontext' != _type ) {
      console.log( "writing to storage for type " + _type );
      Storage.write( _type + '.' + FILE_DATACACHE, JSON.stringify( json ) );
      console.log( "finished writing to storage for type " + _type );
      refreshPosts( _type, json );
    } else {
      // for postcontext, we receive an array with ancestors and descendants
      // console.log( JSON.stringify( json.ancestors.concat( json.descendants ) ) );
      refreshPosts( _type, json.ancestors.concat( json.descendants ) );
    }
    loading.value = false;
  })
  .catch( function( err ) {
    console.log( 'data.loadPosts caused error' );
    console.log( JSON.stringify( err ) );
    loading.value = false;
  });

}

function refreshPosts( _type, _data ) {

  try {
    posts[ _type ].refreshAll(
      _data,
      // same item?
      function( _old, _new ) {
        return _old.id == _new.id;
      },
      // update if found
      function( _old, _new ) {
        _old = MastodonPost( _new, _type );
      },
      // not found, add new one
      function( _new ) {
        return MastodonPost( _new, _type );
      }
    );
  } catch( e ) {
    console.log( JSON.stringify( e ) );
  }

  // console.log( 'finished refresh' );

}

// clear posts in memory
// if argument is passed, do not clear that one
function clearPosts( _keep ) {


  for ( var i in posts ) {
    if ( i != _keep ) {
      posts[ i ].clear();
    }
  }
}

function doImageUpload( b64 ) {

  try {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load",function(e){ uploadDone(e); }, false);
    xhr.addEventListener("error",function(e){ uploadError(e); }, false);
    xhr.open("POST","https://mastodon.social/api/v1/media",true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + AccessToken.value );
    // var parametros = {'image':image,'id': ElCliente.value.IDCliente};
    xhr.send( b64 );
  } catch( err ) {
    console.log( JSON.stringify( err ) );
  }
}

function uploadDone(e) {
  console.log( "result: " + JSON.stringify( e.target ) );
  if ( e.target.status === 200) {
    console.log("successfull return");
  }
}

function uploadError( e ) {
    console.log("error: " + JSON.stringify( e.target ) );
}

function sendImage( _imgObj ) {

  var Uploader = require("Uploader");
  return Uploader.send(
    _imgObj.path,
    'https://mastodon.social/api/v1/media',
    AccessToken.value
  );

}

function sendPost( _txt, _inreplyto, _media ) {

  loading.value = true;

  if ( arguments.length < 2 ) {
    _inreplyto = 0;
  }

  if ( arguments.length < 3 ) {
    _media = [];
  }

  return new Promise( function( resolve, reject ) {

    var _resolve = resolve;
    var _reject = reject;

    api.sendPost( _txt, _inreplyto, _media, AccessToken.value ).then(

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

  var _apiAction = ( _currentstatus ) ? 'unreblog' : 'reblog';

  // create promise
  var repostEmitter = new EventEmitter( 'rePostEnded' );

  fetch( 'https://mastodon.social/api/v1/statuses/' + _postid + '/' + _apiAction, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': 'Bearer ' + AccessToken.value
    }
  })
  .then( function( resp ) {
    if ( 200 == resp.status ) {
      return resp.json();
    } else {
      repostEmitter.emit( 'rePostEnded', { err: true } );
    }
  })
  .then( function( json ) {
    repostEmitter.emit( 'rePostEnded', { err: false, post: json } );
  })
  .catch( function( err ) {
    repostEmitter.emit( 'rePostEnded', { err: true } );
  });

  return repostEmitter.promiseOf( 'rePostEnded' );

}

function favouritePost( _postid, _currentstatus ) {

  // create promise
  var favEmitter = new EventEmitter( 'favouritePostEnded' );
  var _apiAction = ( _currentstatus ) ? 'unfavourite' : 'favourite';

  // console.log( 'favourite: ' + _postid + '/' + _apiAction );

  fetch( 'https://mastodon.social/api/v1/statuses/' + _postid + '/' + _apiAction, {
      method: 'POST',
      headers: {
          'Content-type': 'application/json',
          'Authorization': 'Bearer ' + AccessToken.value
      }
  })
  .then( function( resp ) {
      // console.log( 'favourite json response status: ' + resp.status );
      if ( 200 == resp.status ) {
          return resp.json();
      } else {
          favEmitter.emit( 'favouritePostEnded', { err: true } );
      }
  })
  .then( function( json ) {
    favEmitter.emit( 'favouritePostEnded', { err: false, post: json } );
  })
  .catch( function( err ) {
    favEmitter.emit( 'favouritePostEnded', { err: true } );
  });

  return favEmitter.promiseOf( 'favouritePostEnded' );

}

function MastodonPost( _info, _type ) {

  var _this = {};

  _this.isNotification    = ( 'notifications' == _type );
  _this.isReblog          = ( ( 'reblog' == _info.type )  || ( null != _info.reblog ) );
  _this.isMention         = ( 'mention' == _info.type );
  _this.isFavourite       = ( 'favourite' == _info.type );
  _this.isFollow          = ( 'follow' == _info.type );

  if ( _this.isNotification ) {
    _this.whodidthis = _info.account.acct;
  }

  if ( _this.isFollow ) {

    _this.avatar = _info.account.avatar;
    _this.note   = HtmlEnt.decode( _info.account.note );

  } else if ( _this.isNotification ) {

    _info = _info.status;

  } else if ( _this.isReblog ) {

    _this.whodidthis = _info.account.acct;
    _info = _info.reblog;

  }

  if ( !_this.isFollow ) {

    for (var i in _info ) {
      _this[ i ]            = _info[ i ];
    }

    // for timelines, remove HTML entities and HTML tags
    _this.content           = cleanupContent( _info );

    // for post context screen, get words apart
    _this.prepcontent       = preparePostContent( _info );

    _this.timesince         = timeSince( _info.created_at );

    // avatar a gif? animated or not, FuseTools cannot handle it
    var _avatar = _info.account.avatar.split( '?' );
    _avatar = ( _avatar.length > 1 ) ? _avatar[ _avatar.length - 2 ] : _avatar[ _avatar.length - 1 ];
    _this.isGifAvatar       = ( 'gif' == _avatar.slice( -3 ).toLowerCase() );

  }

  return _this;
}

function getUrisFromText( _text ) {

  // temporary replace urls to prevent splitting on spaces in linktext
  var regex = /<[aA].*?\s+href=["']([^"']*)["'][^>]*>(?:<.*?>)*(.*?)(?:<.*?>)?<\/[aA]>/igm ;
  return _text.match( regex );

}

function cleanupContent( postdata ) {

  var _text = HtmlEnt.decode( postdata.content );

  // paragraphs, but not last one (is empty element)
  var _paragraphs = _text.split( '</p>' );
  _paragraphs.splice( -1, 1 );

  var result = Observable();
  for ( var i in _paragraphs ) {
    var _paragraph = _paragraphs[ i ].replace( "<p>", "" );
    result.add( { paragraph: _paragraph.replace( /<[^>]+>/ig, '' ) } );
  }

  console.log( JSON.stringify( result.value ) );

  return result;

}

// the result of this function is for the view of a single post
// and should NOT be used on a timeline as it generates memory issues
function preparePostContent( postdata ) {

  // console.log( JSON.stringify( postdata ) );

  // @<a href=\"http://sn.gunmonkeynet.net/index.php/user/1\">nybill</a> eek, well glad it was finally noticed.

  // replace HTML codes like &amp; and &gt;
  var _content = HtmlEnt.decode( postdata.content );

  // paragraphs

  // last closing </p> needs no replacement
  _content = _content.replace(new RegExp('<\/p>$'), '');

  // other closing </p> need some breathing room (for now a placeholder)
  _content = _content.replace( "</p>", " ]]]] " );
  // opening <p> can be removed
  _content = _content.replace( "<p>", "" );

  // temporary replace urls to prevent splitting on spaces in linktext
  var _uris = getUrisFromText( _content );
  if ( _uris && ( _uris.length > 0 ) ) {
    for ( var i in _uris ) {
      _content = _content.replace( _uris[ i ], '[[[[' + i );
    }
  }

  // now remove al HTML tags
  _content = _content.replace( /<[^>]+>/ig, '' );

  // console.log( ' >>>>>>>>>>>>>>> replaced uris in content with [[[[x' );
  // console.log( _content );
  // console.log( ' <<<<<<<<<<<<<<<' );

  var result = Observable();

  var _words = _content.split( /\s/g );

  for ( var i in _words ) {
    if ( -1 === _words[ i ].indexOf( '[[[[' ) ) {

      // this is not a link, add it as a word
      // click event in Part.PostCard can send it to the post detail screen
      result.add( { word: _words[ i ], makeBold: false } );

    } else {

      // link found! but: what kind of link?
      // bug fix: if e.g. a mention links to another server, it's a link with a @ before it
      var _charBeforeLink = ( '[[[[' == _words[ i ].substring( 1, 5 ) ) ? _words[ i ].substring( 0, 1 ) : '';
      var _linkId = Number.parseInt( _words[ i ].match(/\d/g).join('') );
      if ( !_uris[ _linkId ] ) {
        continue;
      }
      var _linkTxt = _uris[ _linkId ].replace( /<[^>]+>/ig, '' );

      // console.log( _uris[ _linkId ] );
      // console.log( 'link text: ' + _linkTxt );
      // console.log( 'start char: ' + _charBeforeLink );

      // first: mentions
      var _mentioner = postdata.mentions.filter( function (obj) { return ( 0 ==  _linkTxt.indexOf( '@' + obj.acct ) ); } );
      if ( _mentioner.length > 0 ) {
        result.add( { mention: true, word: _linkTxt, makeBold: true, userid: _mentioner[0].id } );
      } else {

        // not a mention. maybe a hashtag?
        var _tag = postdata.tags.filter( function (obj) { return '#' + obj.name === _linkTxt; } );
        if ( _tag.length > 0 ) {

          // TODO add hashtags
          result.add( { word: _linkTxt, makeBold: false } );

        } else if ( postdata.media_attachments.some( function (obj) { return ( _linkTxt.indexOf( obj.id ) > -1 ); } ) ) {

          // do not show the urls for media_attachments in the content

        } else if ( ( '@' == _charBeforeLink ) || ( '#' == _charBeforeLink ) ) {
          // mentions on some (older Statusnet installations, says https://community.highlandarrow.com/notice/469679 )
          // are a link with an @ before it. TODO One little thing: no user id from the mentions array
          result.add( { word: _charBeforeLink + _linkTxt, makeBold: false } );

        } else {

          // everything else not true. probably just a link
          // click event sends it to the system browser
          var _linkstart = _uris[ _linkId ].indexOf( 'href="' ) + 6;
          var _linkend = _uris[ _linkId ].indexOf( '"', _linkstart );
          var _linkUrl = _uris[ _linkId ].substring( _linkstart, _linkend );
          result.add( { link: true, word: _linkTxt, uri: _linkUrl, makeBold: true } );

        }
      }
    }
  }

  // console.log( JSON.stringify( result ) );

  return result;

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
  loadPostContext: loadPostContext,
  loadUserTimeLine: loadUserTimeLine,
  loadUserProfile: loadUserProfile,
  loadUserFavourites: loadUserFavourites,
  sendPost: sendPost,
  sendImage: sendImage,
  rePost: rePost,
  favouritePost: favouritePost,
  posts: posts,
  loading: loading,
  loadingError: loadingError,
  msg: msg,
  resetErrorMsg: resetErrorMsg,
  userprofile: userprofile,
  refreshCurrentTimeline: refreshCurrentTimeline
}
