import 'package:json_annotation/json_annotation.dart';

import 'fields.dart';

part 'account.g.dart';

@JsonSerializable(explicitToJson: true)
class Account {
  Account({
    required this.id,
    required this.username,
    required this.acct,
    required this.displayName,
    required this.locked,
    required this.bot,
    required this.discoverable,
    required this.group,
    required this.createdAt,
    required this.note,
    required this.url,
    required this.avatar,
    required this.avatarStatic,
    required this.header,
    required this.headerStatic,
    required this.followersCount,
    required this.followingCount,
    required this.statusesCount,
    required this.lastStatusAt,
    required this.emojis,
    required this.fields,
  });
  late final String id;
  late final String username;
  late final String acct;
  late final String displayName;
  late final bool locked;
  late final bool bot;
  late final bool discoverable;
  late final bool group;
  late final String createdAt;
  late final String note;
  late final String url;
  late final String avatar;
  late final String avatarStatic;
  late final String header;
  late final String headerStatic;
  late final int followersCount;
  late final int followingCount;
  late final int statusesCount;
  late final String lastStatusAt;
  late final List<dynamic> emojis;
  late final List<Fields> fields;

  factory Account.fromJson(Map<String, dynamic> json) =>
      _$AccountFromJson(json);
}
