var api = require( 'assets/js/api' );

var postid = this.Parameter.map( function( param ) {
  return param.postid;
});

var postlength = api.posts.postcontext.length;
var posts = api.posts.postcontext.map( function( item, index ) {
    item.last = ( index == postlength - 1 );
    return item;
});

postid.addSubscriber( function() {
	api.loadPostContext( postid.value );
});

module.exports = {
	posts: posts,
	loading: api.loading
};
