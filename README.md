# README #

Matodor is an iOs and Android app for [Mastodon](https://matodor.social), written in FuseTools. Soon in beta.

### Authentication ###

The app needs client credentials to connect to Mastodon. Place them in assets/js/auth.js like this:

module.exports = {
  id             : 217,
  redirect_uri   : "http://mastodon.jeroensmeets.net/",
  client_id      : CLIENT_ID,
  client_secret  : CLIENT_SECRET
}

For obtaining an client_id and client_secret see [this page](https://github.com/Gargron/mastodon/wiki/API#oauth-apps). As the WebView in FuseTools needs an existing redirect_uri, I have configured the subdomain above. Feel free to use it, but be aware that it could go away at any time.

### Contact ###

I'm [@jeroensmeets](https://mastodon.social/web/accounts/8779) on Mastodon. And also on that dinosaur called Twitter.
