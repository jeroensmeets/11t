var nav = require("assets/js/navigation");
nav.menuVisible.value = 'Visible';
nav.showBackButton.value = true;

var Observable = require("FuseJS/Observable");

var userid = this.Parameter.map( function( param ) {
  return param.userid;
});

var data = require( 'assets/js/data' );
userid.addSubscriber( function() {
  data.loadUserProfile( userid );
  data.loadUserTimeLine( userid );
})

function goBack() {
	router.goBack();
}

module.exports = {
  account: data.userprofile,
  posts: data.posts.user,
  goBack: goBack
}
