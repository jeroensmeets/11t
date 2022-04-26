import 'package:dio/dio.dart';

import 'helper.dart';

class HttpClient {
  Dio dio = Dio();

  Future<Map<String, dynamic>> getAuthHeader() async {
    var access_token = await Helper.get().getAccessToken();
    print(access_token);
    // TODO where to report missing access token?
    return access_token == null
        ? {}
        : {'Authorization': 'Bearer ' + access_token};
  }

  Future<Response<dynamic>> get(String endpoint) async {
    var bearer = await getAuthHeader();
    return dio.get(endpoint, options: Options(headers: bearer));
  }

  Future<Response<dynamic>> post(String path, dynamic data) async {
    // print("post url " + endpoint);
    var bearer = await getAuthHeader();
    return dio.post(path, data: data, options: Options(headers: bearer));
  }

  Future<Response<dynamic>> put(String path, dynamic data) async {
    // print("put url " + endpoint);
    var bearer = await getAuthHeader();
    return dio.put(path, data: data, options: Options(headers: bearer));
  }
}
