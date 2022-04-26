import 'package:elevent/model/status.dart';
import 'package:elevent/parts/status.dart';
import 'package:flutter/material.dart';

class StatusGrid extends StatelessWidget {
  final List<Status> statuses;

  const StatusGrid({
    required this.statuses,
  });

  @override
  Widget build(BuildContext context) {
    var delegate =
        SliverChildBuilderDelegate((BuildContext context, int index) {
      return GestureDetector(
          onTap: () {
            // Navigator.push(
            //     context,
            //     MaterialPageRoute(
            //         builder: (context) => PostDetails(posts[index])));
          },
          child: StatusWidget(status: statuses[index]));
    }, childCount: statuses.length);

    return SliverGrid(
      delegate: delegate,
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 1, crossAxisSpacing: 16.0),
    );
  }
}
