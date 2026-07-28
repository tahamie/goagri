import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const GoAgriMobileApp());
}

class GoAgriMobileApp extends StatefulWidget {
  const GoAgriMobileApp({super.key});

  @override
  State<GoAgriMobileApp> createState() => _GoAgriMobileAppState();
}

class _GoAgriMobileAppState extends State<GoAgriMobileApp> {
  bool _isLoggedIn = false;
  String _userEmail = 'ali@goagri.pk';
  String _userRole = 'ops_officer';

  void _handleLoginSuccess(String email, String role) {
    setState(() {
      _userEmail = email;
      _userRole = role;
      _isLoggedIn = true;
    });
  }

  void _handleLogout() {
    setState(() {
      _isLoggedIn = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'GoAgri Field App',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF553575),
          primary: const Color(0xFF553575),
          secondary: const Color(0xFFD39A2A),
          surface: const Color(0xFFF5F2FA),
        ),
        textTheme: GoogleFonts.plusJakartaSansTextTheme(
          Theme.of(context).textTheme,
        ),
        scaffoldBackgroundColor: const Color(0xFFF5F2FA),
      ),
      home: _isLoggedIn
          ? HomeScreen(
              userEmail: _userEmail,
              userRole: _userRole,
              onLogout: _handleLogout,
            )
          : LoginScreen(onLoginSuccess: _handleLoginSuccess),
    );
  }
}
