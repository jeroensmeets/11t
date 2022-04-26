import 'package:elevent/model/status.dart';
import 'package:flutter/material.dart';

class StatusWidget extends StatelessWidget {
  final Status status;

  const StatusWidget({Key? key, required this.status}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 12.0),
      child: Text(status.content),
    );
  }
}
