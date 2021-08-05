import 'package:flutter/material.dart';

import '../ActivityPubApi.dart';

class LoginPage extends StatefulWidget {
  LoginPage({Key? key}) : super(key: key);

  @override
  _LoginPageState createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  bool error = false;
  String url = '';
  ActivityPubApi api = ActivityPubApi();

  void prepareLogin() {
    api.setBaseUrl(url);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('11t'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
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
            ),
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
      ),
    );
  }
}
