import 'package:flutter/material.dart';
import '../models/application_model.dart';
import '../services/api_service.dart';
import 'workflow_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<ApplicationModel> apps = [];
  bool loading = true;

  @override
  void initState() {
    super.initState();
    loadApps();
  }

  void loadApps() async {
    final list = await ApiService.getApplications();
    setState(() {
      apps = list;
      loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    const plumColor = Color(0xFF553575);
    const plumDark = Color(0xFF2B1840);
    const goldColor = Color(0xFFD39A2A);

    return Scaffold(
      backgroundColor: const Color(0xFFF6F3FB),
      body: SafeArea(
        child: Column(
          children: [
            // HERO HEADER
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF5B3A7E), Color(0xFF6A438C), Color(0xFF7E51A0)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(30),
                  bottomRight: Radius.circular(30),
                ),
              ),
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 38, height: 38,
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(colors: [Color(0xFFF3E1B4), goldColor]),
                              borderRadius: BorderRadius.circular(11),
                            ),
                            child: const Center(
                              child: Text('GA', style: TextStyle(color: plumDark, fontWeight: FontWeight.bold, fontSize: 15)),
                            ),
                          ),
                          const SizedBox(width: 10),
                          const Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('GoAgri Field', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                              Text('Officer Portal', style: TextStyle(color: Colors.white70, fontSize: 10)),
                            ],
                          ),
                        ],
                      ),
                      const CircleAvatar(
                        radius: 20,
                        backgroundColor: Colors.white24,
                        child: Text('AR', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Text('Assalam-o-alaikum, Ali', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  const Text('Tuesday, 21 July · 4 farmers assigned', style: TextStyle(color: Colors.white70, fontSize: 12)),
                  const SizedBox(height: 18),
                  Row(
                    children: [
                      _buildChip('6', 'In progress'),
                      const SizedBox(width: 8),
                      _buildChip('8', 'KYC pending'),
                      const SizedBox(width: 8),
                      _buildChip('2', 'Sent back'),
                    ],
                  ),
                ],
              ),
            ),

            // REGISTER NEW FARMER BUTTON & LIST
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: plumColor,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          elevation: 4,
                        ),
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => WorkflowScreen(
                                app: ApplicationModel(
                                  id: 0, appCode: 'NEW', farmerName: 'New Farmer',
                                  farmerCnic: '', farmerMobile: '', cropType: 'Wheat',
                                  bankName: 'Bank A', status: 'KYC Pending', step: 1,
                                  cultivatedArea: 10.0, initialRequirement: 800000.0,
                                ),
                              ),
                            ),
                          );
                        },
                        child: const Text('＋ Register new farmer', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
                      ),
                    ),
                    const SizedBox(height: 14),
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: [Color(0xFFFBF2DC), Color(0xFFF5E4B6)]),
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: const Color(0xFFF3E1B4)),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.auto_awesome, color: goldColor, size: 24),
                          SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('New here? Take a quick tour', style: TextStyle(color: Color(0xFF5A4413), fontWeight: FontWeight.bold, fontSize: 13.5)),
                                Text('See how onboarding works · 60 sec', style: TextStyle(color: Color(0xFF8A6A1F), fontSize: 11)),
                              ],
                            ),
                          ),
                          Icon(Icons.chevron_right, color: goldColor),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Text('Continue onboarding', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 10),
                    Expanded(
                      child: loading
                          ? const Center(child: CircularProgressIndicator())
                          : ListView.builder(
                              itemCount: apps.length,
                              itemBuilder: (ctx, i) {
                                final app = apps[i];
                                final pct = (app.step / 11.0);
                                return Container(
                                  margin: const EdgeInsets.only(bottom: 12),
                                  padding: const EdgeInsets.all(14),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(18),
                                    border: Border.all(color: const Color(0xFFECE7F3)),
                                    boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 4, offset: Offset(0, 2))],
                                  ),
                                  child: Column(
                                    children: [
                                      Row(
                                        children: [
                                          CircleAvatar(
                                            backgroundColor: const Color(0xFFF3EEF9),
                                            child: Text(
                                              app.farmerName.split(' ').map((e) => e[0]).join().substring(0, 2),
                                              style: const TextStyle(color: plumColor, fontWeight: FontWeight.bold),
                                            ),
                                          ),
                                          const SizedBox(width: 12),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(app.farmerName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                                                Text('${app.appCode} · ${app.cropType} · ${app.bankName}', style: const TextStyle(color: Colors.grey, fontSize: 11.5)),
                                              ],
                                            ),
                                          ),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                            decoration: BoxDecoration(
                                              color: app.status.contains('Sent Back') ? const Color(0xFFFBEBE9) : const Color(0xFFF3EEF9),
                                              borderRadius: BorderRadius.circular(12),
                                            ),
                                            child: Text(
                                              app.status,
                                              style: TextStyle(
                                                color: app.status.contains('Sent Back') ? const Color(0xFFC0483F) : plumColor,
                                                fontSize: 11,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 12),
                                      Row(
                                        children: [
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                ClipRRect(
                                                  borderRadius: BorderRadius.circular(4),
                                                  child: LinearProgressIndicator(
                                                    value: pct,
                                                    minHeight: 6,
                                                    backgroundColor: const Color(0xFFF3EEF9),
                                                    color: plumColor,
                                                  ),
                                                ),
                                                const SizedBox(height: 4),
                                                Text('Step ${app.step} of 11', style: const TextStyle(color: Colors.grey, fontSize: 11)),
                                              ],
                                            ),
                                          ),
                                          const SizedBox(width: 12),
                                          OutlinedButton(
                                            style: OutlinedButton.styleFrom(
                                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                            ),
                                            onPressed: () {
                                              Navigator.push(
                                                context,
                                                MaterialPageRoute(builder: (_) => WorkflowScreen(app: app)),
                                              );
                                            },
                                            child: const Text('Resume →', style: TextStyle(color: plumColor, fontWeight: FontWeight.bold)),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                );
                              },
                            ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildChip(String num, String label) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.13),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withValues(alpha: 0.16)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(num, style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
            Text(label, style: const TextStyle(color: Colors.white70, fontSize: 10)),
          ],
        ),
      ),
    );
  }
}
