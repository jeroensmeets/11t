// https://app.quicktype.io/

// To parse this JSON data, do
//
//     final appCredentials = appCredentialsFromJson(jsonString);
import 'dart:convert';

class AppCredentials {
  String? id;
  String? name;
  String? website;
  String? redirectUri;
  String? clientId;
  String? clientSecret;
  String? vapidKey;

  AppCredentials({
    this.id,
    this.name,
    this.website,
    this.redirectUri,
    this.clientId,
    this.clientSecret,
    this.vapidKey,
  });

  factory AppCredentials.fromRawJson(String str) =>
      AppCredentials.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory AppCredentials.fromJson(Map<String, dynamic> json) => AppCredentials(
        id: json['id'],
        name: json['name'],
        website: json['website'],
        redirectUri: json['redirect_uri'],
        clientId: json['client_id'],
        clientSecret: json['client_secret'],
        vapidKey: json['vapid_key'],
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'website': website,
        'redirect_uri': redirectUri,
        'client_id': clientId,
        'client_secret': clientSecret,
        'vapid_key': vapidKey,
      };
}
