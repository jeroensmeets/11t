import 'package:json_annotation/json_annotation.dart';

part 'card.g.dart';

@JsonSerializable(explicitToJson: true)
class Card {
  Card({
    required this.url,
    required this.title,
    required this.description,
    required this.type,
    required this.authorName,
    required this.authorUrl,
    required this.providerName,
    required this.providerUrl,
    required this.html,
    required this.width,
    required this.height,
    this.image,
    required this.embedUrl,
  });
  late final String url;
  late final String title;
  late final String description;
  late final String type;
  late final String authorName;
  late final String authorUrl;
  late final String providerName;
  late final String providerUrl;
  late final String html;
  late final int width;
  late final int height;
  late final Null image;
  late final String embedUrl;

  factory Card.fromJson(Map<String, dynamic> json) => _$CardFromJson(json);
}
