var api = require( 'Assets/js/api' );
var Observable = require("FuseJS/Observable");
var contentparser = require( 'Assets/js/parse.content.js' );

var posts = Observable();

var paramUserData = this.Parameter.map( function( param ) {
	return param.userdata;
} );

var clickableBio = Observable( '' );

var u = this.Parameter.map( function( param ) {
	return param.user;
});

u.onValueChanged( module, function( newValue  ) {

	// console.dir( newValue );

	posts.clear();

	clickableBio = contentparser.clickableBio( newValue.note );

	api.loadUserTimeline( newValue.id )
	.then( function( APIresponse ) {

		posts.refreshAll(
			APIresponse.posts,
			function( oldItem, newItem ) { return oldItem.id == newItem.id; },
			function( oldItem, newItem ) { oldItem = new api.MastodonPost( newItem ); },
			function( newItem ) { return new api.MastodonPost( newItem ); }
		);

	} )
	.catch( function( err ) {
		console.log( err.message );
	} );

} );

module.exports = {
	userprofile: u,
	clickableBio: clickableBio,
	posts: posts
}
