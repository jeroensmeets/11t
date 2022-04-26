import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../state/apistate.dart';
import '../parts/loadingindicator.dart';
import '../parts/statusgrid.dart';

class HomePage extends ConsumerWidget {
  final ScrollController _scrollController = ScrollController();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    var statuses = ref.watch(statusesProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text('11t'),
        leading: Container(),
      ),
      body: CustomScrollView(controller: _scrollController, slivers: [
        statuses.when(
            data: (statuses) => StatusGrid(statuses: statuses),
            loading: () => LoadingIndicator(),
            error: (_, __) => SliverToBoxAdapter(
                  child: Container(),
                )),
      ]),
    );
  }
}
