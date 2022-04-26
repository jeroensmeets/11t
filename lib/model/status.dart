import 'package:json_annotation/json_annotation.dart';

import 'account.dart';
import 'application.dart';
import 'card.dart';

part 'status.g.dart';

@JsonSerializable(explicitToJson: true)
class Status {
  Status({
    required this.id,
    required this.createdAt,
    this.inReplyToId,
    this.inReplyToAccountId,
    required this.sensitive,
    required this.spoilerText,
    required this.visibility,
    required this.language,
    required this.uri,
    required this.url,
    required this.repliesCount,
    required this.reblogsCount,
    required this.favouritesCount,
    required this.favourited,
    required this.reblogged,
    required this.muted,
    required this.bookmarked,
    required this.content,
    this.reblog,
    required this.application,
    required this.account,
    required this.mediaAttachments,
    required this.mentions,
    required this.tags,
    required this.emojis,
    required this.card,
    this.poll,
  });
  late final String id;
  late final String createdAt;
  late final Null inReplyToId;
  late final Null inReplyToAccountId;
  late final bool sensitive;
  late final String spoilerText;
  late final String visibility;
  late final String language;
  late final String uri;
  late final String url;
  late final int repliesCount;
  late final int reblogsCount;
  late final int favouritesCount;
  late final bool favourited;
  late final bool reblogged;
  late final bool muted;
  late final bool bookmarked;
  late final String content;
  late final Null reblog;
  late final Application application;
  late final Account account;
  late final List<dynamic> mediaAttachments;
  late final List<dynamic> mentions;
  late final List<dynamic> tags;
  late final List<dynamic> emojis;
  late final Card card;
  late final Null poll;

  factory Status.fromJson(Map<String, dynamic> json) => _$StatusFromJson(json);
}
