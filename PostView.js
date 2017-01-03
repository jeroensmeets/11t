var data = require( 'assets/js/data' );

var postid = this.Parameter.map( function( param ) {
  return param.postid;
});

postid.addSubscriber( function() {
  data.loadPostContext( postid.value );
});

module.exports = {
  posts: data.posts.postcontext
};
