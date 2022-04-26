part of 'fields.dart';

Fields _$FieldsFromJson(Map<String, dynamic> json) {
  return Fields(
    name: json['name'],
    value: json['value'],
    verifiedAt: null,
  );
}
