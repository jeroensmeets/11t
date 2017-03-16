var Observable			= require("FuseJS/Observable");
var cameraRoll			= require("FuseJS/CameraRoll");

var api					= require( 'assets/js/api' );
var media_attachments	= Observable();

var isPrivate			= Observable( false );
var hidePublic			= Observable( false );
var isSensitive			= Observable( false );
var useSpoilerText		= Observable( false );
var spoilerText			= Observable( '' );

var errorInSending		= Observable( false );
var errorTooManyImages	= Observable( false );

// get arguments passed by router
var inReplyToPostId = this.Parameter.map( function( param ) {
	return param.postid;
});

var txtToToot = Observable();
var txtToToot = this.Parameter.map( function( param ) {

	var _prefillPost = '';
	if ( param.firstup ) {
		var _prefillPost = '@' + param.firstup + ' ';
	}

	for ( var i in param.mentions ) {
		if ( param.firstup != param.mentions[ i ].acct ) {
			_prefillPost += '@' + param.mentions[ i ].acct + ' ';
		}
	}

	console.log( 'prefill post: ' + _prefillPost );
	return _prefillPost;
});


function doToot() {

	// TODO why can this be undefined? I've mapped from parameter aboven
	if ( 'undefined' == typeof txtToToot.value ) {
		return;
	}

	if ( '' == txtToToot.value.replace(/\s+/g, '') ) {
		console.log( 'Please, give me something to work with (will not send empty post)' );
		return;
	}

	var _spoiler = '';
	if ( useSpoilerText.value && ( '' != spoilerText.value.replace(/\s+/g, '') ) ) {
		_spoiler = spoilerText.value;
	}

	var _media_ids = [];
	// console.log( 'media_attachments has length ' + media_attachments.length );
	media_attachments.forEach( function( item ) {
		// console.log( 'item in media array: ' + JSON.stringify( item ) );
		_media_ids.push( item.id );
	});

	api.sendPost(

		txtToToot.value, inReplyToPostId.value, _media_ids, isPrivate.value, hidePublic.value, isSensitive.value, _spoiler

	).then( function( result ) {

		clearScreen();

		var _goBack = ( inReplyToPostId > 0 );
		if ( _goBack ) {
			router.goBack();
		} else {
			router.goto( "home" );
		}

	} ).catch( function( error ) {

		errorInSending.value = true;

	} );

}

function clearScreen() {

	txtToToot.value = '';
	media_attachments.clear();
	inReplyToPostId.value = 0;
	isPrivate.value = false;
	hidePublic.value = false;

	errorInSending.value = false;
	errorTooManyImages.value = false;

}

function selectImage() {

	if ( media_attachments.length > 3 ) {
		errorTooManyImages.value = true;
		return false;
	}

	// catch error when selecting tif file
	// https://www.fusetools.com/community/forums/bug_reports/camerarollgetimage_throws_error_when_selecting_tif
	try {

		console.log( 'select image from cameraroll' );

		cameraRoll.getImage().then( function( image ) {

			api.sendImage( image ).then( function( result ) {

				console.log( result );
				media_attachments.add( JSON.parse( result ) );

			}, function( err ) {

				console.log( err );

			});

		}, function(error) {

			console.log( error );

		});

	} catch( e ) {
		// TODO let user know image was not used
		console.log( JSON.stringify( e ) );
	}
}

module.exports = {
	inReplyToPostId: inReplyToPostId,
	txtToToot: txtToToot,
	attachments: media_attachments,
	doToot: doToot,
	clearScreen: clearScreen,
	errorInSending: errorInSending,
	errorTooManyImages: errorTooManyImages,
	selectImage: selectImage,
	isPrivate: isPrivate,
	hidePublic: hidePublic,
	isSensitive: isSensitive,
	useSpoilerText: useSpoilerText,
	spoilerText: spoilerText
}
