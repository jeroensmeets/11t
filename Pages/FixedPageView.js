var Observable			= require( 'FuseJS/Observable' );

// get arguments passed by router
var contentId = this.Parameter.map( function( param ) {
	return param.content;
});

var contentPageTitle = this.Parameter.map( function( param ) {
	return capitalizeFirstLetter( param.content );
});

module.exports = {
	contentId: contentId,
	contentPageTitle: contentPageTitle
}

function capitalizeFirstLetter( string ) {
	console.log( string );
    return string[ 0 ].toUpperCase() + string.slice( 1 );
}