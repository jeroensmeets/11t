import 'package:elevent/pages/homepage.dart';
import 'package:flutter/material.dart';
import 'package:flutter_web_browser/flutter_web_browser.dart';

import '../state/objects/ApiOAuth.dart';

class LoginPage extends StatefulWidget {
  LoginPage({Key? key}) : super(key: key);

  @override
  _LoginPageState createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  bool showLoginFields = false;
  bool error = false;
  String url = '';
  ApiOAuth api = ApiOAuth();

  void checkLoginStatus() async {
    var access_token = await api.maybeRefreshAccessToken();
    if (access_token == null) {
      setState(() {
        showLoginFields = true;
      });
    } else {
      navigateToTimeline();
    }
  }

  void prepareLogin() async {
    await api.setBaseUrl(url);
    await api.fetchClientIdSecret();
    var redirectUrl = await api.getRedirectUrl();
    openOAuthScreen(redirectUrl);
  }

  void openOAuthScreen(String url) {
    FlutterWebBrowser.openWebPage(
      url: url,
      customTabsOptions: CustomTabsOptions(
        addDefaultShareMenuItem: false,
        instantAppsEnabled: true,
        showTitle: true,
        urlBarHidingEnabled: true,
      ),
      safariVCOptions: SafariViewControllerOptions(
        barCollapsingEnabled: true,
        dismissButtonStyle: SafariViewControllerDismissButtonStyle.close,
        modalPresentationCapturesStatusBarAppearance: true,
      ),
    );
  }

  void navigateToTimeline() {
    Navigator.push(
      context,
      MaterialPageRoute<void>(
        builder: (BuildContext context) => HomePage(),
      ),
    );
  }

  @override
  void initState() {
    checkLoginStatus();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('11t'),
      ),
      body: showLoginFields
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  LogoLoading(),
                  SizedBox(height: 16),
                  Container(
                    margin: EdgeInsets.only(left: 50.0, right: 50.0),
                    child: TextField(
                      onChanged: (value) {
                        url = value;
                      },
                      textInputAction: TextInputAction.go,
                      autocorrect: false,
                      textCapitalization: TextCapitalization.none,
                      decoration: InputDecoration(
                        labelText: 'URL of Pixelfed server',
                      ),
                    ),
                  ),
                  SizedBox(height: 32),
                  ElevatedButton(
                      onPressed: () {
                        prepareLogin();
                      },
                      child: Text('Connect to server'))
                ],
              ),
            )
          : Center(child: LogoLoading()),
    );
  }
}

class LogoLoading extends StatelessWidget {
  const LogoLoading({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xff7c94b6),
        image: const DecorationImage(
          image: AssetImage('assets/images/logo-11t.jpg'),
          fit: BoxFit.fill,
        ),
        border: Border.all(
          color: Colors.white,
          width: 2,
        ),
        borderRadius: BorderRadius.circular(75.0),
      ),
      height: 150.0,
      width: 150.0,
    );
  }
}
