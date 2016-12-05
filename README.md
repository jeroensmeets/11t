# README #

Matodor is an iOS and Android app for [Mastodon](https://mastodon.social), written in FuseTools. In beta for both Android and iOS.

### What are your plans for Matodor? ###

I try to keep everything on [the Issues list on Github](https://github.com/jeroensmeets/mastodon-app/issues).

### I hear there's a beta test? ###

You are absolutely right! I'm building this app from scratch, so please have some patience.

## iOS ##
If you use an Apple device, send me an e-mail at jeroen at jeroensmeets dot net. Important: I need you AppleID, i.e. the address that you use for logging into the App Store.

As long there are spots open for the iOS test group, I'll add you to the beta group.

## Android ##
For Android, you can [visit this link](https://play.google.com/apps/testing/com.jeroensmeets.mastodon) on your mobile.

### What's up with this name? ###

Every mastodon needs a matodor to tame it. I liked the idea of following the vowels a-o-o. Sounds like a monkey in a fruit basket.

### Build it yourself ###

All code is in this repository, minus one file. The app needs client credentials to connect to Mastodon. Place them in assets/js/auth.js like this:

```
#!javascript

module.exports = {
  redirect_uri   : "http://mastodon.jeroensmeets.net/",
  client_id      : CLIENT_ID,
  client_secret  : CLIENT_SECRET
}
```

For obtaining an client_id and client_secret see [this page](https://github.com/Gargron/mastodon/wiki/API#oauth-apps). As the WebView in FuseTools needs an existing redirect_uri, I have configured the subdomain above. Feel free to use it, but be aware that it could go away at any time.

### Contact ###

I'm [@jeroensmeets](https://mastodon.social/web/accounts/8779) on Mastodon. And also on that dinosaur called Twitter.
