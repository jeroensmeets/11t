var api			= require("assets/js/api");

function setActiveTimeline() {
	api.setActiveTimeline( 'publictimeline' );
}

module.exports = {
	setActiveTimeline: setActiveTimeline,
	posts: api.posts.publictimeline
}