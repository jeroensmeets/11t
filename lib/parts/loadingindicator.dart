import 'package:flutter/material.dart';

class LoadingIndicator extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SliverList(
      delegate: SliverChildListDelegate(
        [
          SizedBox(
            height: 160.0,
          ),
          Container(
            child: Center(
                child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: CircularProgressIndicator(
                backgroundColor: Colors.blue,
              ),
            )),
          ),
        ],
      ),
    );
  }
}
