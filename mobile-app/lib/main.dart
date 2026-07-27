import 'package:flutter/material.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const GoAgriMobileApp());
}

class GoAgriMobileApp extends StatelessWidget {
  const GoAgriMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'GoAgri Field',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF553575)),
        useMaterial3: true,
        fontFamily: 'Plus Jakarta Sans',
      ),
      home: const HomeScreen(),
    );
  }
}
