var api			= require("assets/js/api");

function setActiveTimeline() {
	api.setActiveTimeline( 'notifications' );
}

module.exports = {
	posts: api.posts.notifications,
	setActiveTimeline: setActiveTimeline
}