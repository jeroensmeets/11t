# README #

Matodor is an iOs and Android app for [Mastodon](https://mastodon.social), written in FuseTools. In beta for Android, waiting for review by Apple for iOS beta test.

### What are your plans for Matodor? ###

My todo list is [on Trello](https://trello.com/b/as4ROroX/mastodon-app).

### I hear there's a beta test? ###

You are absolutely right! I'm building this app from scratch, so please be patient. The current version can show your timeline and your notifications, and you can write a toot without images, you can repost and add a favourite. And that's it.

## iOS ##
If you use an Apple device, send me an e-mail at jeroen at jeroensmeets dot net. Important: I need the address that you use for logging into the App Store.

As long there are spots open for the iOS test group, I'll add you to the beta group. The app is waiting for review by Apple, so it can take a couple of days before you hear from me (writing this on the 28th).

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
