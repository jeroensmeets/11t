var helper			= require( 'assets/js/helper.js' );
var HtmlEnt         = require( 'assets/js/he/he.js' );
var Observable      = require("FuseJS/Observable");

function cleanContent( postdata ) {

	if ( 'follow' == postdata.type ) {
		return '';
	}

	var _source = ( 'notifications' == postdata.type ) ? postdata.status : postdata;

	if ( 'undefined' == typeof _source.content || '' == _source.content ) {
		return '';
	}

	var _text = HtmlEnt.decode( _source.content );

	// remove links to media attachments
	if ( _source.media_attachments.length ) {

		var _uris = helper.getUrisFromText( _text );

		if ( _uris && ( _uris.length > 0 ) ) {
			for ( var i in _uris ) {
				var _cleanupuri = _uris[ i ].match( /https?:([^"']+)/ig );
				if ( _source.media_attachments.some( function (obj) { return ( _cleanupuri.indexOf( obj.text_url ) > -1 ); } ) ) {
					_text = _text.replace( _uris[ i ], '' );
				}
			}
		}
	}

	// remove empty paragraphs
	_text = _text.replace( '<p></p>', '' );

	if ( '' == _text.toLowerCase() ) {

		return [];

	}

	// get paragraphs, ignore last empty one
	var paragraphs = _text.split( '</p>' );
	paragraphs.splice( -1, 1 );

	var result = Observable();
	for ( var i in paragraphs ) {
		var paragraph = paragraphs[ i ].replace( "<p>", "" );
		paragraph = paragraph.trim();
		paragraph = paragraph.replace( /<[^>]+>/ig, '' );
		result.add( { paragraph: paragraph } );
	}

	// in case content has no paragraphs
	if ( 0 == result.length ) {
		result.add( { paragraph: _text.replace( /<[^>]+>/ig, '' ) } );
	}

	return result;

}

function clickableBio( bio ) {

	// replace HTML codes like &amp; and &gt;
	bio = HtmlEnt.decode( bio );

	// temporary replace urls to prevent splitting on spaces in linktext
	var uris = helper.getUrisFromText( bio );
	if ( uris && ( uris.length > 0 ) ) {
		for ( var i in uris ) {
			bio = bio.replace( uris[ i ], '[[[[' + i );
		}
	}

	var result = Observable();
	var words = bio.split( /\s/g );

	for ( var i in words ) {

		if ( -1 === words[ i ].indexOf( '[[[[' ) ) {

			// this is not a link, add it as a word
			result.add( { word: words[ i ] } );

		} else {

			var linkId = Number.parseInt( words[ i ].match(/\d/g).join('') );
			if ( ! uris[ linkId ] ) {
				continue;
			}
			var linkTxt = uris[ linkId ].replace( /<[^>]+>/ig, '' );

			var linkstart = uris[ linkId ].indexOf( 'href="' ) + 6;
			var linkend = uris[ linkId ].indexOf( '"', linkstart );
			var linkUrl = uris[ linkId ].substring( linkstart, linkend );
			result.add( { link: true, word: linkTxt, uri: linkUrl, makeBold: true } );

		}

	}

	return result;
}

// the result of this function is for the view of a single post
// and should NOT be used on a timeline as it generates memory issues
function clickableContent( postdata ) {

	// replace HTML codes like &amp; and &gt;
	var _content = HtmlEnt.decode( postdata.content );

	// paragraphs

	// last closing </p> needs no replacement
	_content = _content.replace(new RegExp('<\/p>$'), '');

	// other closing </p> need some breathing room (for now a placeholder)
	_content = _content.replace( "</p>", " ]]]] " );
	// opening <p> can be removed
	_content = _content.replace( "<p>", "" );

	// temporary replace urls to prevent splitting on spaces in linktext
	var _uris = helper.getUrisFromText( _content );
	if ( _uris && ( _uris.length > 0 ) ) {
		for ( var i in _uris ) {
			_content = _content.replace( _uris[ i ], '[[[[' + i );
		}
	}

	// now remove al HTML tags
	_content = _content.replace( /<[^>]+>/ig, '' );

	var result = Observable();

	var _words = _content.split( /\s/g );

	for ( var i in _words ) {

		if ( _words[ i ].indexOf( ']]]]' ) > -1 ) {

			result.add( { word: '', clear: true } );

		} else if ( -1 === _words[ i ].indexOf( '[[[[' ) ) {

			// this is not a link, add it as a word
			// click event in Part.PostCard can send it to the post detail screen
			result.add( { word: _words[ i ] } );

		} else {

			// link found! but: what kind of link?
			// bug fix: if e.g. a mention links to another server, it's a link with a @ before it
			var _charBeforeLink = ( '[[[[' == _words[ i ].substring( 1, 5 ) ) ? _words[ i ].substring( 0, 1 ) : '';
			var _linkId = Number.parseInt( _words[ i ].match(/\d/g).join('') );
			if ( !_uris[ _linkId ] ) {
				continue;
			}
			var _linkTxt = _uris[ _linkId ].replace( /<[^>]+>/ig, '' );

			// first: mentions
			var _mentioner = postdata.mentions.filter( function (obj) { return ( 0 ==  _linkTxt.indexOf( '@' + obj.acct ) ); } );
			if ( _mentioner.length > 0 ) {
				// console.log( '%%%%%%%%%%%%%%%%%%%%%% -- mention' );
				result.add( { mention: true, word: _linkTxt, makeBold: true, userid: _mentioner[0].id } );
			} else {

				// not a mention. maybe a hashtag?
				var _tag = postdata.tags.filter( function (obj) { return '#' + obj.name === _linkTxt; } );
				if ( _tag.length > 0 ) {

					// hashtags are added below post content

				} else if ( postdata.media_attachments.some( function (obj) { return _linkTxt == obj.text_url; } ) ) {

					// do not show the urls for media_attachments in the content
					// console.log( '%%%%%%%%%%%%%%%%%%%%%% -- media attachment: ' + _linkTxt );

				} else if ( ( '@' == _charBeforeLink ) || ( '#' == _charBeforeLink ) ) {

					// mentions on some (older Statusnet installations, says https://community.highlandarrow.com/notice/469679 )
					// are a link with an @ before it. TODO One little thing: no user id from the mentions array
					result.add( { word: _charBeforeLink + _linkTxt } );

				} else {

					// everything else not true. probably just a link
					// click event sends it to the system browser
					var _linkstart = _uris[ _linkId ].indexOf( 'href="' ) + 6;
					var _linkend = _uris[ _linkId ].indexOf( '"', _linkstart );
					var _linkUrl = _uris[ _linkId ].substring( _linkstart, _linkend );
					result.add( { link: true, word: _linkTxt, uri: _linkUrl, makeBold: true } );

				}
			}
		}
	}

	return result;

}

module.exports = {
	cleanContent: cleanContent,
	clickableContent: clickableContent,
	clickableBio: clickableBio
}