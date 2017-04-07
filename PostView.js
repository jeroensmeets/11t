var api = require( 'assets/js/api' );

var post = this.Parameter.map( function( param ) {
  return param.post;
});

post.onValueChanged( module, function( newValue ) {

	if ( 'undefined' != typeof newValue ) {
		api.loadPostContext( newValue );
	}

});

module.exports = {
	// posts: posts,
	posts: api.posts.postcontext,
	loading: api.loading
};
