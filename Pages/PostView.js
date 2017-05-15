var api = require( 'Assets/js/api' );
var Observable = require("FuseJS/Observable");

var posts = Observable();
var post = this.Parameter.map( function( param ) {
  return param.post;
});

post.onValueChanged( module, function( newValue ) {

	if ( 'undefined' != typeof newValue ) {

		posts.clear();

		posts.add( new api.MastodonPost( newValue ) );

		api.loadPostcontext( newValue.id )
		.then( function( APIresponse ) {

			var np = APIresponse.ancestors.concat( newValue, APIresponse.descendants );

			posts.refreshAll(
				np,
				function( oldItem, newItem ) { return oldItem.id == newItem.id; },
				function( oldItem, newItem ) { oldItem = new api.MastodonPost( newItem ); },
				function( newItem ) { return new api.MastodonPost( newItem ); }
			);

		} );

	}

});

module.exports = {
	posts: posts,
	loading: api.loading
};
