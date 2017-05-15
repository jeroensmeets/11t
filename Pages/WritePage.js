var Observable			= require("FuseJS/Observable");
var cameraRoll			= require("FuseJS/CameraRoll");

var api					= require( 'Assets/js/api' );
var media_attachments	= Observable();

var errorInSending		= Observable( false );
var errorTooManyImages	= Observable( false );

// get arguments passed by router
var inReplyToPostId = this.Parameter.map( function( param ) {
	return param.postid;
});

var tootVisibility = this.Parameter.map( function( param ) {
	return ( param.visibility && ( '' != param.visibility ) ) ? param.visibility : 'unlisted';
});

var isSensitive = this.Parameter.map( function( param ) {
	return ( true === param.sensitive );
});

var spoilerText = this.Parameter.map( function( param ) {
	return param.contentwarning;
});

var showSpoilerText = this.Parameter.map( function( param ) {
	return ( ( 'undefined' != typeof param.contentwarning ) && ( '' != param.contentwarning ) );
});

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

	console.log( 2 );

	var _spoiler = '';
	if ( showSpoilerText.value && ( '' != spoilerText.value.replace(/\s+/g, '') ) ) {
		_spoiler = spoilerText.value;
	}

	console.log( 3 );

	var _media_ids = [];
	// console.log( 'media_attachments has length ' + media_attachments.length );
	media_attachments.forEach( function( item ) {
		// console.log( 'item in media array: ' + JSON.stringify( item ) );
		_media_ids.push( item.id );
	});

	console.log( 4 );

	return;

	api.sendPost(

		txtToToot.value, inReplyToPostId.value, _media_ids, tootVisibility.value, isSensitive.value, _spoiler

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

function changeContentWarning() {
	showSpoilerText.value = !showSpoilerText.value;
}

function makePublic() {
	tootVisibility.value = 'public';
}

function makeUnlisted() {
	tootVisibility.value = 'unlisted';
}

function makePrivate() {
	tootVisibility.value = 'private';
}

function makeDirect() {
	tootVisibility.value = 'direct';
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
	errorInSending: errorInSending,
	errorTooManyImages: errorTooManyImages,
	selectImage: selectImage,
	tootVisibility: tootVisibility,
	makeDirect: makeDirect,
	makePrivate: makePrivate,
	makeUnlisted: makeUnlisted,
	makePublic: makePublic,
	isSensitive: isSensitive,
	showSpoilerText: showSpoilerText,
	spoilerText: spoilerText,
	changeContentWarning: changeContentWarning
}
