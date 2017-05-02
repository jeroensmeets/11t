var api = require( 'assets/js/api' );
var Observable = require( 'FuseJS/Observable' );

var reportlist = Observable();

function loadReports() {

	api.loadReports()
	.then( function( result ) {
		reportlist.refreshAll( result );
	})
	.catch( function( err ) {
		console.log( err.message );
	})

}

module.exports = {
	loadReports: loadReports,
	reportlist: reportlist
}