var nav = require("assets/js/navigation");
nav.menuVisible.value = 'Visible';

var Observable = require("FuseJS/Observable");

// get arguments passed by router
var inReplyToPostId = this.Parameter.map( function( param ) {
    return param.postid;
});
var inReplyToAccount = this.Parameter.map( function( param ) {
    return param.postid;
});

var txtToToot = this.Parameter.map( function( param ) {
    return param.account ? '@' + param.account + ' ' : '';
});

var cameraRoll = require("FuseJS/CameraRoll");

function doToot() {

  var data = require( 'assets/js/data' );
  data.sendPost( txtToToot.value, inReplyToPostId.value );

  if ( inReplyToPostId.value > 0 ) {
    router.goBack();
  }
}

function selectImage() {

  cameraRoll.getImage()
      .then(function(image) {
          console.log( JSON.stringify( image ) );

      }, function(error) {
          console.log( error );
      });
}

module.exports = {
  inReplyToPostId: inReplyToPostId,
  txtToToot: txtToToot,
  doToot: doToot,
  selectImage: selectImage
}
