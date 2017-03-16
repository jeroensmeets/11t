var api			= require("assets/js/api");

function setActiveTimeline() {
	api.setActiveTimeline( 'notifications' );
}

module.exports = {
	setActiveTimeline: setActiveTimeline,
	posts: api.posts.notifications
}