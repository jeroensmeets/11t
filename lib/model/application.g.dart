part of 'application.dart';

Application _$ApplicationFromJson(Map<String, dynamic> json) {
  return Application(
    name: json['name'],
    website: null,
  );
}
