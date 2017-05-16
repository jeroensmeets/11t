var api = require("Assets/js/api");
var Observable = require( 'FuseJS/Observable' );

var posts = Observable();
var max_id = false;
var since_id = false;

var tl = this.timeline;
var pt = this.pagetitle;

// prevent pagetitle when page not active
var tlshown = Observable( '' );

var loadingNewer = Observable( false );
var loadingOlder = Observable( false );

function refreshTimeline() {

	loadingNewer.value = true;

	api.loadTimeline( tl.value, since_id )
	.then( function( APIresponse ) {

		loadingNewer.value = false;

		if ( APIresponse.since_id ) {

			since_id = APIresponse.since_id;

			if ( !max_id ) {
				max_id = APIresponse.max_id;
			}

			if ( posts.value ) {
				// merge current timeline
				// TODO speaking of which: why doesn't Observable.refreshAll keep the current entries???
				APIresponse.posts = APIresponse.posts.concat( posts.value );
			}

			posts.refreshAll(
				APIresponse.posts,
				function( oldItem, newItem ) { return oldItem.id == newItem.id; },
				function( oldItem, newItem ) {
					var mp = new api.MastodonPost( newItem );
					for ( var i in oldItem ) {
						oldItem[ i ] = mp[ i ];
					}
				},
				function( newItem ) { return new api.MastodonPost( newItem ); }
			);

			var forCache = {
				max_id: max_id,
				since_id: since_id,
				posts: posts.value
			}

			api.saveTimelineToCache( tl.value, forCache );

		}

	} )
	.catch( function( err ) {
		console.log( err.message );
	} );

}

function getOlderPosts() {

	if ( loadingNewer.value || loadingOlder.value ) {
		return;
	}

	loadingOlder.value = true;

	// console.log( 'refresh and get older posts' );

	api.loadTimeline( tl.value, max_id, true )
	.then( function( APIresponse ) {

		if ( APIresponse.max_id ) {

			max_id = APIresponse.max_id;

			if ( !since_id ) {
				since_id = APIresponse.since_id;
			}

			for( var i in APIresponse.posts ) {
				posts.add( new api.MastodonPost( APIresponse.posts[ i ] ) );
			}

			var forCache = {
				max_id: max_id,
				since_id: since_id,
				posts: posts.value
			}

			api.saveTimelineToCache( tl.value, forCache );

		}

		loadingOlder.value = false;

	} )
	.catch( function( err ) {
		console.log( err.message );
	} );

	loadingOlder.value = false;

}

function loadTimeline() {

	tlshown.value = pt.value;

	if ( posts.length > 0 ) {
		return;
	}

	api.loadTimelineFromCache( tl.value )
	.then( function( json ) {

		// console.log( JSON.stringify( json ) );

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
	tlshown: tlshown,
	loadTimeline: loadTimeline,
	refreshTimeline: refreshTimeline,
	getOlderPosts: getOlderPosts,
	loading: api.loading,
	loadingOlder: loadingOlder
}