var nav = require("assets/js/navigation");
nav.menuVisible.value = 'Collapsed';
nav.showBackButton.value = true;

var Observable = require("FuseJS/Observable");

var account = this.Parameter.map( function( param ) {
  // console.log( JSON.stringify( param.userprofile ) );
  return param.userprofile;
});

var data = require( 'assets/js/data' );
account.addSubscriber( function() {
  data.loadUserTimeLine( account.getAt( 'id' ) );
})

function goBack() {
	router.goBack();
}

module.exports = {
  account: account,
  posts: data.posts.user,
  goBack: goBack
}
