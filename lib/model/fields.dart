import 'package:json_annotation/json_annotation.dart';

part 'fields.g.dart';

@JsonSerializable(explicitToJson: true)
class Fields {
  Fields({
    required this.name,
    required this.value,
    this.verifiedAt,
  });
  late final String name;
  late final String value;
  late final String? verifiedAt;

  factory Fields.fromJson(Map<String, dynamic> json) => _$FieldsFromJson(json);
}
