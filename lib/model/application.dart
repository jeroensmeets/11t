import 'package:json_annotation/json_annotation.dart';

part 'application.g.dart';

@JsonSerializable(explicitToJson: true)
class Application {
  Application({
    required this.name,
    this.website,
  });
  late final String name;
  late final Null website;

  factory Application.fromJson(Map<String, dynamic> json) =>
      _$ApplicationFromJson(json);
}
