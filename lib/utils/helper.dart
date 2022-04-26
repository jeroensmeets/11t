import 'package:shared_preferences/shared_preferences.dart';

class Helper {
  static final Helper _this = Helper();

  Helper();

  factory Helper.get() {
    return _this;
  }

  Future<String?> getAccessToken() async {
    return getPrefString('accessToken');
  }

  Future<String?> getPrefString(String key) async {
    var prefs = await SharedPreferences.getInstance();
    return prefs.getString(key);
  }

  Future<bool> setPrefString(String key, String value) async {
    var prefs = await SharedPreferences.getInstance();
    return prefs.setString(key, value);
  }

  Future<int?> getPrefInt(String key) async {
    var prefs = await SharedPreferences.getInstance();
    return prefs.getInt(key);
  }

  Future<bool> setPrefInt(String key, int value) async {
    var prefs = await SharedPreferences.getInstance();
    return prefs.setInt(key, value);
  }
}
