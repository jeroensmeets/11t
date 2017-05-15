var api = require("Assets/js/api");
var Observable = require("FuseJS/Observable");

var posts = Observable();
var pageTitle = Observable( '' );

var tag = this.Parameter.map( function( param ) {
  return param.tag;
});

tag.onValueChanged( module, function( newValue ) {

	posts.clear();

	if ( 'undefined' != typeof newValue ) {

		pageTitle.value = '#' + newValue;
		api.loadTimeline( 'hashtag', newValue )
		.then( function( APIresponse ) {

			posts.refreshAll(
				APIresponse.posts,
				function( oldItem, newItem ) { return oldItem.id == newItem.id; },
				function( oldItem, newItem ) { oldItem = new api.MastodonPost( newItem ); },
				function( newItem ) { return new api.MastodonPost( newItem ); }
			);

		})

	}

});

module.exports = {
	posts: posts,
	pageTitle: pageTitle
}