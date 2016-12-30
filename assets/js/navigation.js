var Observable = require('FuseJS/Observable');

var menuVisible = Observable( 'Collapsed' );
var showBackButton = Observable( false );

module.exports = {
	menuVisible: menuVisible,
	showBackButton: showBackButton
};
