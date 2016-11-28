var nav = require("assets/js/navigation");
nav.menuVisible.value = 'Visible';

var Observable = require("FuseJS/Observable");
var txtToToot = Observable('');

var cameraRoll = require("FuseJS/CameraRoll");

function doToot() {

  var data = require( 'assets/js/data' );
  data.sendPost( txtToToot.value );

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
  txtToToot: txtToToot,
  doToot: doToot,
  selectImage: selectImage
}
