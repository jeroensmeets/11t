var api = require( 'assets/js/api' );
var Observable = require( 'FuseJS/Observable' );

var mutedUsers = Observable();

function loadMutedUsers() {

	api.loadMutedUsers()
	.then( function( result ) {
		mutedUsers.refreshAll( result );
	})
	.catch( function( err ) {
		console.log( err.message );
	})

}

module.exports = {
	loadMutedUsers: loadMutedUsers,
	mutedUsers: mutedUsers
}