import 'package:elevent/utils/helper.dart';

import '../../utils/httpclient.dart';

// TDO store values more safely.

class ApiOAuth {
  final HttpClient httpClient = HttpClient();
  final helper = Helper.get();

  final String _clientName = '11t';
  final String _clientWebsite = 'https://11t.nl/';
  final String _redirectUri = 'elevent://11t.nl/';
  final String _scope = 'read write follow push';

  Future<void> storeTokens(dynamic tokens) async {
    if (tokens.keys.contains('access_token')) {
      await helper.setPrefString('accessToken', tokens['access_token']!);
    } else {
      return;
    }
    if (tokens.keys.contains('expires_in')) {
      await helper.setPrefInt('expiresIn', tokens['expires_in']!);
    }
    if (tokens.keys.contains('refresh_token')) {
      await helper.setPrefString('refreshToken', tokens['refresh_token']!);
    }
  }

  Future<void> setBaseUrl(String baseUrl) async {
    baseUrl = baseUrl.toLowerCase();
    // TODO be more helpful by adding the protocol and/or a slash at the end
    // maybe just check if the url is a working base url and then activating the button?
    if ('https://' != baseUrl.substring(0, 8) || ('' == baseUrl)) {
      throw Exception('Base url not valid');
    }
    await helper.setPrefString('baseUrl', baseUrl);
  }

  Future<String> getRedirectUrl() async {
    final clientId = await helper.getPrefString('clientId');
    final baseUrl = await helper.getPrefString('baseUrl');
    final redirect =
        '${baseUrl}oauth/authorize?client_id=$clientId&redirect_uri=$_redirectUri&response_type=code&scope=$_scope';
    return Uri.encodeFull(redirect);
  }

  // obtain client_id and client_secret
  Future<void> fetchClientIdSecret() async {
    final baseUrl = await helper.getPrefString('baseUrl');
    final response = await httpClient.post('${baseUrl}api/v1/apps', {
      'client_name': _clientName,
      'redirect_uris': _redirectUri,
      'scopes': _scope,
      'website': _clientWebsite,
    });

    if (200 == response.statusCode) {
      // If the server did return a 200 OK response,
      // then parse the JSON.
      final result = response.data;
      await helper.setPrefString('clientId', result['client_id'].toString());
      await helper.setPrefString('clientSecret', result['client_secret']);
    } else {
      // If the server did not return a 200 OK response,
      // then throw an exception.
      throw Exception('Failed to load client id and secret');
    }
  }

  // Exchange oauth code for tokens.
  Future<void> exchangeCodeForTokens(String code) async {
    final baseUrl = await helper.getPrefString('baseUrl');
    final clientId = await helper.getPrefString('clientId');
    final clientSecret = await helper.getPrefString('clientSecret');

    final response = await httpClient.post('${baseUrl}oauth/token', {
      'grant_type': 'authorization_code',
      'redirect_uri': _redirectUri,
      'code': code,
      'client_id': clientId,
      'client_secret': clientSecret,
    });

    if (200 == response.statusCode) {
      // Tokens received.
      await storeTokens(response.data);
    } else {
      // TODO handle error
    }
  }

  Future<bool> refreshAccessToken() async {
    final baseUrl = await helper.getPrefString('baseUrl');
    final refreshToken = await helper.getPrefString('refreshToken');
    final clientId = await helper.getPrefString('clientId');
    final clientSecret = await helper.getPrefString('clientSecret');

    final response = await httpClient.post('${baseUrl}oauth/token', {
      'grant_type': 'refresh_token',
      'refresh_token': refreshToken,
      'client_id': clientId,
      'client_secret': clientSecret,
    });

    if (200 == response.statusCode) {
      // Tokens received.
      await storeTokens(response.data);
      return true;
    }
    return false;
  }

  Future<String?> maybeRefreshAccessToken() async {
    var accessToken = await helper.getPrefString('accessToken');
    var expiresIn = await helper.getPrefInt('expiresIn');
    if (accessToken == null || expiresIn == null) {
      return null;
    }
    var now = DateTime.now();
    if (now.millisecondsSinceEpoch < expiresIn) {
      // access token is still valid.
      return accessToken;
    }
    // access token expired, try to refresh it.
    await refreshAccessToken();
    return await helper.getPrefString('accessToken');
  }
}
