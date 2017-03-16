var api			= require("assets/js/api");
var Observable	= require("FuseJS/Observable");
var pagetitle	= Observable( 'Timeline' );

function setActiveTimeline() {
	api.setActiveTimeline( 'home' );
}

module.exports = {
	pagetitle: pagetitle,
	posts: api.posts.home,
	setActiveTimeline: setActiveTimeline
}