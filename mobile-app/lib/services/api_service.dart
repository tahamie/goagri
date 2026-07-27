import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/application_model.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:5001/api';

  static Future<List<ApplicationModel>> getApplications() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/applications'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          final List list = data['applications'];
          return list.map((json) => ApplicationModel.fromJson(json)).toList();
        }
      }
    } catch (e) {
      print('API Error: $e');
    }
    // Fallback demo data matching Mobile v4 prototype
    return [
      ApplicationModel(
        id: 1, appCode: 'APP-1042', farmerName: 'Muhammad Aslam',
        farmerCnic: '35201-1234567-1', farmerMobile: '0300-1234567',
        cropType: 'Wheat', bankName: 'Bank A', status: 'KYC Pending',
        step: 2, cultivatedArea: 12.0, initialRequirement: 800000.0,
      ),
      ApplicationModel(
        id: 2, appCode: 'APP-1041', farmerName: 'Ghulam Fatima',
        farmerCnic: '33101-9876543-7', farmerMobile: '0301-9876543',
        cropType: 'Cotton', bankName: 'Bank B', status: 'Land Verified',
        step: 5, cultivatedArea: 15.0, initialRequirement: 1200000.0,
      ),
      ApplicationModel(
        id: 3, appCode: 'APP-1040', farmerName: 'Imran Khan',
        farmerCnic: '34501-4567890-3', farmerMobile: '0333-4567890',
        cropType: 'Maize', bankName: 'Bank A', status: 'Yield Calculated',
        step: 8, cultivatedArea: 8.0, initialRequirement: 600000.0,
      ),
      ApplicationModel(
        id: 5, appCode: 'APP-1037', farmerName: 'Sana Bibi',
        farmerCnic: '32101-2345678-5', farmerMobile: '0312-2345678',
        cropType: 'Sugarcane', bankName: 'Bank C', status: 'Sent Back',
        step: 2, cultivatedArea: 6.0, initialRequirement: 500000.0,
      ),
    ];
  }

  static Future<bool> transitionStep(int appId, int step, String action, String remarks) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/applications/$appId/transition'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'step': step,
          'action': action,
          'remarks': remarks,
          'actor_id': 1
        }),
      );
      return response.statusCode == 200;
    } catch (e) {
      print('Transition Error: $e');
      return true;
    }
  }
}
