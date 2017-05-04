var api = require( 'assets/js/api' );
var Observable = require( 'FuseJS/Observable' );

var blockedUsers = Observable();

function loadBlockedUsers() {

	api.loadBlockedUsers()
	.then( function( result ) {
		console.log( JSON.stringify( result ) );
		blockedUsers.refreshAll( result );
	})
	.catch( function( err ) {
		console.log( err.message );
	})

}

module.exports = {
	loadBlockedUsers: loadBlockedUsers,
	blockedUsers: blockedUsers
}