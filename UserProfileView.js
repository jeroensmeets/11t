var data = require( 'assets/js/data' );

var userid = this.Parameter.map( function( param ) {
  return param.userid;
});

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
