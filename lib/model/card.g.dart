part of 'card.dart';

Card _$CardFromJson(Map<String, dynamic> json) {
  return Card(
    url: json['url'],
    title: json['title'],
    description: json['description'],
    type: json['type'],
    authorName: json['author_name'],
    authorUrl: json['author_url'],
    providerName: json['provider_name'],
    providerUrl: json['provider_url'],
    html: json['html'],
    width: json['width'],
    height: json['height'],
    image: null,
    embedUrl: json['embed_url'],
  );
}
