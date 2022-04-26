import '../../model/status.dart';
import '../../utils/constants.dart';
import '../../utils/helper.dart';
import '../../utils/httpclient.dart';

class ApiActivityPub {
  final HttpClient httpClient = HttpClient();
  final helper = Helper.get();

  // TODO add paging.
  Future<List<Status>> getStatusList() async {
    var result;

    var baseurl = await helper.getPrefString('baseUrl');
    var endpoint = baseurl! + API_BASE + API_TIMELINES_HOME;

    try {
      dynamic response = await httpClient.get(endpoint);
      if (response.data is List) {
        response.data.forEach((v) {
          try {
            result.add(Status.fromJson(v));
          } catch (_, __) {
            // do not rethrow, status isn't added
          }
        });
      }
    } catch (error, stack) {
      print(error);
      print(stack);
      rethrow;
    }

    return result;
  }
}
