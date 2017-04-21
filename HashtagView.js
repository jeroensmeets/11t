var api			= require("assets/js/api");
var Observable = require("FuseJS/Observable");

var pageTitle = Observable( '' );

var tag = this.Parameter.map( function( param ) {
  return param.tag;
});

tag.onValueChanged( module, function( newValue ) {

	if ( 'undefined' != typeof newValue ) {
		pageTitle.value = '#' + newValue;
		api.loadTimeline( 'hashtag', newValue );
	}

});

module.exports = {
	posts: api.posts.hashtag,
	pageTitle: pageTitle
}