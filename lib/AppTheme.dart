import 'package:flutter/material.dart';

class AppTheme {
  AppTheme._();

  static final Color? primaryColorLight = Colors.blue[800];
  static final Color? accentColorLight = Colors.blueGrey[700];
  static const Color? iconColorLight = Colors.white54;
  static final Color? inputFieldFillColorLight = Color(0xffF8F9FF);

  static final Color? primaryColorDark = Colors.blue[800];
  static final Color? accentColorDark = Colors.blueGrey[700];
  static const Color? iconColorDark = Colors.white54;
  static final Color? inputFieldFillColorDark = Color(0xffF8F9FF);

  static final ThemeData lightTheme = ThemeData(
    scaffoldBackgroundColor: Colors.white,
    primaryColor: primaryColorLight,
    appBarTheme: AppBarTheme(
      color: Colors.blue,
      iconTheme: IconThemeData(
        color: Colors.white,
      ),
    ),
    cardTheme: CardTheme(
      color: Colors.blue,
    ),
    iconTheme: IconThemeData(
      color: iconColorLight,
    ),
    buttonTheme: ButtonThemeData(
      buttonColor: accentColorLight,
      textTheme: ButtonTextTheme.primary,
    ),
    colorScheme: ColorScheme.fromSwatch().copyWith(secondary: accentColorLight),
  );

  static final ThemeData darkTheme = ThemeData(
    scaffoldBackgroundColor: Colors.black,
    primaryColor: primaryColorDark,
    appBarTheme: AppBarTheme(
      color: Colors.grey[800],
      iconTheme: IconThemeData(
        color: Colors.white,
      ),
    ),
    cardTheme: CardTheme(
      color: Colors.black,
    ),
    iconTheme: IconThemeData(
      color: iconColorDark,
    ),
    buttonTheme: ButtonThemeData(
      buttonColor: accentColorDark,
      textTheme: ButtonTextTheme.primary,
    ),
    colorScheme: ColorScheme.fromSwatch().copyWith(secondary: accentColorDark),
  );
}
