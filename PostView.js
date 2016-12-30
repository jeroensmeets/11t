var InterApp = require("FuseJS/InterApp");

var nav = require("assets/js/navigation");
nav.menuVisible.value = 'Visible';
nav.showBackButton.value = true;

var postid = this.Parameter.map( function( param ) {
  return param.postid;
});

var data = require( 'assets/js/data' );
postid.addSubscriber( function() {
  data.loadPostContext( postid.value );
});

module.exports = {
  posts: data.posts.postcontext,
  menuVisible: nav.menuVisible
};
