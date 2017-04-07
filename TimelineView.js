var api			= require("assets/js/api");

function setActiveTimeline() {
	api.setActiveTimeline( 'home' );
}

module.exports = {
	posts: api.posts.home,
	setActiveTimeline: setActiveTimeline
}