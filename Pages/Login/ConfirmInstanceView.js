var api = require( 'Assets/js/api' );
var HtmlEnt = require( 'Assets/js/he/he.js' );
var Observable = require( 'FuseJS/Observable' );

var instanceContactEmail = Observable();
var instanceDescription = Observable();

var loadingInfo = Observable( false );
var instanceError = Observable( false );

var instance = this.Parameter.map( function( param ) {
	return param.instance;
});

var instanceName = Observable( 'this instance' );

function getInstanceInfo() {

	loadingInfo.value = true;
	api.getInstanceInfo( newValue )
	.then( function( result ) {

		// console.log( JSON.stringify( result ) );

		instanceContactEmail.value = result.email;
		instanceDescription.value =  
			// '<style>* { font-size: 100% !important; line-height: 1.3em; }</style>'
			''
			+ result.description;
		loadingInfo.value = false;

	} )
	.catch( function( err ) {

		instanceError.value = true;
		loadingInfo.value = false;

	} );
}

instance.onValueChanged( module, function( newValue ) {

	if ( newValue ) {
		instanceName.value = newValue;
	}

} );

function confirmInstance() {
	router.goto( 'splash', {}, 'showTerms', {} );
}

function tryAgain() {
	api.logOut();
	router.goto( 'splash', {}, 'setinstance' );
}

module.exports = {
	instance: instance,
	instanceContactEmail: instanceContactEmail,
	instanceDescription: instanceDescription,
	instanceError: instanceError,
	instanceName: instanceName,
	confirmInstance: confirmInstance,
	loadingInfo: loadingInfo,
	tryAgain: tryAgain
}

// instanceInfo = {
// 	"uri":"mastodon.cloud",
// 	"title":"Mastodon.cloud",
// 	"description":"<a href =\"https://www.patreon.com/ValentinOuvrard\"><img src=\"https://s3.amazonaws.com/patreon_public_assets/toolbox/patreon_white.png\" style='width:50%; border:\"0\";'></img></a>\n<br>\n<!-- Piwik -->\n<script type=\"text/javascript\">\n  var _paq = _paq || [];\n  // tracker methods like \"setCustomDimension\" should be called before \"trackPageView\"\n  _paq.push([\"setCookieDomain\", \"*.mastodon.cloud\"]);\n  _paq.push(['trackPageView']);\n  _paq.push(['enableLinkTracking']);\n  (function() {\n    var u=\"//stats.opsnotice.xyz/\";\n    _paq.push(['setTrackerUrl', u+'piwik.php']);\n    _paq.push(['setSiteId', '5']);\n    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];\n    g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'piwik.js'; s.parentNode.insertBefore(g,s);\n  })();\n</script>\n<!-- End Piwik Code -->",
// 	"email":"contact@mastodon.cloud"
// }