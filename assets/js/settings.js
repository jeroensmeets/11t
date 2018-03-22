var Storage = require("FuseJS/Storage");
var STORAGEFILE = 'user.settings.json';

var settings = {
	showTranslationsButton: false,
	darkTheme: false
}

function loadSettings( ) {
	var json = Storage.readSync( STORAGEFILE );
	settings = JSON.parse( json );
}

function saveSettings() {
	Storage.writeSync( STORAGEFILE, JSON.stringify( settings ) );
}

function loadSetting( settingName ) {
	loadSettings();
	return settings[ settingName ];
}

function saveSetting( settingName, settingValue ) {
	settings[ settingName ] = settingValue;
	saveSettings();
}

module.exports = {
	settings: settings,
	loadSettings: loadSettings,
	loadSetting: loadSetting,
	saveSetting: saveSetting
}