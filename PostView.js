var api = require( 'assets/js/api' );

var postid = this.Parameter.map( function( param ) {
  return param.postid;
});

postid.addSubscriber( function() {
	api.loadPostContext( postid.value );
});

module.exports = {
	posts: api.posts.postcontext,
	loading: api.loading
};
