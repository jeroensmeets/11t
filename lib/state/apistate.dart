import 'package:elevent/model/status.dart';
import 'package:elevent/state/objects/ApiOAuth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'objects/ApiActivityPub.dart';

final statusesProvider =
    StateNotifierProvider<StatusNotifier, AsyncValue<List<Status>>>((ref) {
  return StatusNotifier(ref.read);
});

class StatusNotifier extends StateNotifier<AsyncValue<List<Status>>> {
  final Reader read;
  final ApiActivityPub api = ApiActivityPub();
  final ApiOAuth oauth = ApiOAuth();
  List<Status> statuslist = [];

  int currentPage = 1;
  bool isLoading = false;

  StatusNotifier(this.read) : super(const AsyncValue.loading()) {
    loadStatuses();
  }

  Future<void> loadStatuses() async {
    return await _retrieveStatuses(loadmore: false);
  }

  Future<void> loadNextStatuses() async {
    return await _retrieveStatuses(loadmore: true);
  }

  Future<void> _retrieveStatuses({bool loadmore = false}) async {
    if (isLoading) {
      return;
    }
    if (loadmore) {
      currentPage++;
    } else {
      // we' reprobably refreshing if currentPage > 1
      // reset to 1 to make sure more recent posts are loaded.
      currentPage = 1;
    }
    var access_token = await oauth.maybeRefreshAccessToken();
    if (access_token == null) {
      state = AsyncValue.error('Login not valid');
    }
    isLoading = true;
    try {
      final newStatuses = await api.getStatusList();
      isLoading = false;
      if (currentPage == 1) {
        statuslist = newStatuses;
      } else {
        statuslist = [...statuslist, ...newStatuses];
      }
      state = AsyncValue.data(statuslist);
    } catch (error, _) {
      isLoading = false;
      state = AsyncValue.error(error);
      if (loadmore) currentPage--;
    }
  }
}
