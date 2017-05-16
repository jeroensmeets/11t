var api = require("Assets/js/api");
var Observable = require( 'FuseJS/Observable' );

var posts = Observable();
var max_id = false;
var since_id = false;

var timeline = 'notifications';

function refreshTimeline() {

	api.loadNotifications( since_id )
	.then( function( APIresponse ) {

		if ( APIresponse.max_id && APIresponse.since_id ) {

			max_id = APIresponse.max_id;
			since_id = APIresponse.since_id;

			posts.refreshAll(
				APIresponse.posts,
				function( oldItem, newItem ) { return oldItem.id == newItem.id; },
				function( oldItem, newItem ) { oldItem = new api.MastodonPost( newItem ); },
				function( newItem ) { return new api.MastodonPost( newItem ); }
			);

			var forCache = {
				max_id: max_id,
				since_id: since_id,
				posts: posts.value
			}

			api.saveTimelineToCache( timeline, forCache );

		}

	} )
	.catch( function( err ) {
		console.log( err.message );
	} );

}

function loadTimeline() {

	if ( posts.length > 0 ) {
		return;
	}

	api.loadTimelineFromCache( timeline )
	.then( function( json ) {

		// nothing in cache? then get timeline from API
		if ( json && json.posts && ( json.posts.length > 0 ) ) {

			posts.value = json.posts;

		} else {

			refreshTimeline();

		}

	} )
	.catch( function( err ) {
		// console.log( 'error in loadTimeline: ' + err.message );
		refreshTimeline();
	} );

}


module.exports = {
	posts: posts,
	loadTimeline: loadTimeline,
	refreshTimeline: refreshTimeline,
	loading: api.loading
}