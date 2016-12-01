var Observable = require('FuseJS/Observable');

var menuVisible = Observable( 'Collapsed' );
var showBackButton = Observable( false );

function goBack() {
	router.goBack();
}

module.exports = {
	menuVisible: menuVisible,
	showBackButton: showBackButton,
	goBack: goBack
};
