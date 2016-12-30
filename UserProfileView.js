var nav = require("assets/js/navigation");
nav.menuVisible.value = 'Visible';
nav.showBackButton.value = true;

var userid = this.Parameter.map( function( param ) {
  return param.userid;
});

var data = require( 'assets/js/data' );
userid.addSubscriber( function() {
  data.loadUserProfile( userid.value );
  data.loadUserTimeLine( userid.value );
})

function goBack() {
	router.goBack();
}

module.exports = {
  account: data.userprofile,
  posts: data.posts.user,
  goBack: goBack
}
