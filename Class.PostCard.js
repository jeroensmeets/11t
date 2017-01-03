var _this = this;

var data = require( 'assets/js/data' );

var Observable = require("FuseJS/Observable");
var favouriting = Observable( false );
var reposting = Observable( false );

var userid = 0; this.userid.onValueChanged( function( newValue ) { userid = newValue; })
var acct = 0; this.acct.onValueChanged( function( newValue ) { acct = newValue; })
var postid = 0; this.postid.onValueChanged( function( newValue ) { postid = newValue; })
var mentions = 0; this.mentions.onValueChanged( function( newValue ) { mentions = newValue; })

var favourited = false; this.favourited.onValueChanged( function( newValue ) { favourited = newValue; })
var reposted = false; this.reposted.onValueChanged( function( newValue ) { reposted = newValue; })

function replyToPost( args ) {
  // console.log( JSON.stringify( mentions ) );
  router.push( "write", { postid: postid, firstup: acct, mentions: mentions } );
}

function rePost( args ) {
  reposting.value = true;
  data.rePost( postid, reposted ).then( function() {
    _this.reposted.value = !_this.reposted.value;
    reposting.value = false;
  }).catch( function( err ) {
    console.log( 'error in rePost' );
    console.log( JSON.stringify( err ) );
    reposting.value = false;
  });
}

function favouritePost( args ) {
  favouriting.value = true;
  data.favouritePost( postid, favourited ).then( function() {
    _this.favourited.value = !_this.favourited.value;
    favouriting.value = false;
  }).catch( function( err ) {
    console.log( 'error in favouritePost' );
    console.log( JSON.stringify( err ) );
    favouriting.value = false;
  });
}

function gotoPost() {
  if ( postid > 0 ) {
    router.push( "postcontext", { postid: postid } );
  }
}

function gotoUser() {
  if ( userid > 0 ) {
    router.push( "userprofile", { userid: userid } );
  }
}

module.exports = {
  replyToPost: replyToPost,
  rePost: rePost,
  reposting: reposting,
  favouritePost: favouritePost,
  favouriting: favouriting,
  gotoUser: gotoUser,
  gotoPost: gotoPost
};
