var api = require( 'assets/js/api' );

var userid = this.Parameter.map( function( param ) {
	return param.userid;
});

userid.addSubscriber( function() {

	api.loadUserProfile( userid.value );
	api.loadTimeline( 'user', userid.value )

});

function mentionUser() {
	router.push( "write", { firstup: api.userprofile.value.acct } );
}

module.exports = {
	account: api.userprofile,
	posts: api.posts.user,
	mentionUser: mentionUser
}
