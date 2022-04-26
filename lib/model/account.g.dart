part of 'account.dart';

Account _$AccountFromJson(Map<String, dynamic> json) {
  return Account(
    id: json['id'],
    username: json['username'],
    acct: json['acct'],
    displayName: json['display_name'],
    locked: json['locked'],
    bot: json['bot'],
    discoverable: json['discoverable'],
    group: json['group'],
    createdAt: json['created_at'],
    note: json['note'],
    url: json['url'],
    avatar: json['avatar'],
    avatarStatic: json['avatar_static'],
    header: json['header'],
    headerStatic: json['header_static'],
    followersCount: json['followers_count'],
    followingCount: json['following_count'],
    statusesCount: json['statuses_count'],
    lastStatusAt: json['last_status_at'],
    emojis: List.castFrom<dynamic, dynamic>(json['emojis']),
    fields: List.from(json['fields']).map((e) => Fields.fromJson(e)).toList(),
  );
}
