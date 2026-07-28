import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/application_model.dart';

class ApiService {
  // Live Vercel API production URL with local fallback
  static const String liveBaseUrl = 'https://goagri-platform.vercel.app/api';
  static const String localBaseUrl = 'http://localhost:5001/api';

  static Future<List<ApplicationModel>> getApplications() async {
    // Try live Vercel endpoint first
    try {
      final response = await http.get(Uri.parse('$liveBaseUrl/applications'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          final List list = data['applications'];
          return list.map((json) => ApplicationModel.fromJson(json)).toList();
        }
      }
    } catch (_) {
      // Try local endpoint
      try {
        final response = await http.get(Uri.parse('$localBaseUrl/applications'));
        if (response.statusCode == 200) {
          final data = json.decode(response.body);
          if (data['success'] == true) {
            final List list = data['applications'];
            return list.map((json) => ApplicationModel.fromJson(json)).toList();
          }
        }
      } catch (_) {}
    }
    return [];
  }

  static Future<bool> transitionStep(int appId, int step, String action, String remarks) async {
    try {
      final response = await http.post(
        Uri.parse('$liveBaseUrl/applications/$appId/transition'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'step': step,
          'action': action,
          'remarks': remarks,
          'actor_id': 1
        }),
      );
      if (response.statusCode == 200) return true;
    } catch (_) {}

    try {
      final response = await http.post(
        Uri.parse('$localBaseUrl/applications/$appId/transition'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'step': step,
          'action': action,
          'remarks': remarks,
          'actor_id': 1
        }),
      );
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}
