part of 'status.dart';

Status _$StatusFromJson(Map<String, dynamic> json) {
  return Status(
    id: json['id'],
    createdAt: json['created_at'],
    inReplyToId: null,
    inReplyToAccountId: null,
    sensitive: json['sensitive'],
    spoilerText: json['spoiler_text'],
    visibility: json['visibility'],
    language: json['language'],
    uri: json['uri'],
    url: json['url'],
    repliesCount: json['replies_count'],
    reblogsCount: json['reblogs_count'],
    favouritesCount: json['favourites_count'],
    favourited: json['favourited'],
    reblogged: json['reblogged'],
    muted: json['muted'],
    bookmarked: json['bookmarked'],
    content: json['content'],
    reblog: null,
    application: Application.fromJson(json['application']),
    account: Account.fromJson(json['account']),
    mediaAttachments:
        List.castFrom<dynamic, dynamic>(json['media_attachments']),
    mentions: List.castFrom<dynamic, dynamic>(json['mentions']),
    tags: List.castFrom<dynamic, dynamic>(json['tags']),
    emojis: List.castFrom<dynamic, dynamic>(json['emojis']),
    card: Card.fromJson(json['card']),
    poll: null,
  );
}
