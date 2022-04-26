import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_web_browser/flutter_web_browser.dart';
import 'package:uni_links/uni_links.dart';

import 'state/objects/ApiOAuth.dart';
import 'AppTheme.dart';
import 'pages/homepage.dart';
import 'pages/loginpage.dart';

void main() {
  runApp(ProviderScope(child: EleventApp()));
}

class EleventApp extends StatefulWidget {
  @override
  _EleventAppState createState() => _EleventAppState();
}

class _EleventAppState extends State<EleventApp> {
  StreamSubscription? _sub;
  bool _initialUriIsHandled = false;
  bool _userIsLoggedIn = false;

  @override
  void initState() {
    super.initState();
    _handleIncomingLinks();
    _handleInitialUri();
  }

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }

  String? extractCodeFromUri(Uri uri) {
    var parameters = Uri.splitQueryString(uri.query);
    return parameters.keys.contains('code') ? parameters['code'] : null;
  }

  Future<void> loadTokens(Uri? uri) async {
    if (uri == null) return;
    print(uri.toString());
    var code = extractCodeFromUri(uri);
    if (code != null) {
      var api = ApiOAuth();
      await api.exchangeCodeForTokens(code);
    }
    // Close browser
    await FlutterWebBrowser.close();
    setState(() {
      _userIsLoggedIn = true;
    });
  }

  // Handle incoming links while the app is already started.
  void _handleIncomingLinks() {
    _sub = uriLinkStream.listen((Uri? uri) {
      if (!mounted) return;
      loadTokens(uri);
    }, onError: (Object err) {
      if (!mounted) return;
      print('got err: $err');
      // TODO handle error
    });
  }

  // Handle the initial Uri - the one the app was started with.
  Future<void> _handleInitialUri() async {
    if (!_initialUriIsHandled) {
      _initialUriIsHandled = true;
      try {
        final uri = await getInitialUri();
        if (!mounted) return;
        await loadTokens(uri);
      } on FormatException catch (err) {
        if (!mounted) return;
        print('malformed initial uri');
        print(err.message);
        // TODO handle error.
      } catch (err) {
        // Platform messages may fail but we ignore the exception
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        title: '11t',
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        // home: HomePage());
        home: _userIsLoggedIn ? HomePage() : LoginPage());
  }
}
