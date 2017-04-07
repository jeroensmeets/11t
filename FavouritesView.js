var api			= require("assets/js/api");

function setActiveTimeline() {
	api.setActiveTimeline( 'favourites' );
}

module.exports = {
	posts: api.posts.favourites,
	setActiveTimeline: setActiveTimeline
}