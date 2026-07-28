import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/application_model.dart';
import '../services/api_service.dart';
import 'workflow_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({
    super.key,
    required this.userEmail,
    required this.userRole,
    required this.onLogout,
  });

  final String userEmail;
  final String userRole;
  final VoidCallback onLogout;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<ApplicationModel> _applications = [];
  bool _isLoading = true;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadApplications();
  }

  void _loadApplications() async {
    final list = await ApiService.getApplications();
    setState(() {
      _applications = list;
      _isLoading = false;
    });
  }

  List<ApplicationModel> get _filteredApplications {
    if (_searchQuery.isEmpty) return _applications;
    final q = _searchQuery.toLowerCase();
    return _applications.where((a) {
      return a.farmerName.toLowerCase().contains(q) ||
          a.appCode.toLowerCase().contains(q) ||
          a.cropType.toLowerCase().contains(q);
    }).toList();
  }

  void _openWorkflow(ApplicationModel app) async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => WorkflowScreen(
          app: app,
          userRole: widget.userRole,
        ),
      ),
    );
    _loadApplications();
  }

  void _startNewRegistration() {
    final newApp = ApplicationModel(
      id: 0,
      appCode: 'NEW',
      farmerName: 'New Farmer',
      farmerCnic: '',
      farmerMobile: '',
      cropType: 'Wheat',
      bankName: 'Bank A',
      status: 'Registration',
      step: 1,
      cultivatedArea: 10.0,
      initialRequirement: 500000.0,
    );
    _openWorkflow(newApp);
  }

  @override
  Widget build(BuildContext context) {
    final userName = widget.userEmail.contains('bilal') ? 'Bilal Ahmed' : 'Ali Raza';

    return Scaffold(
      backgroundColor: const Color(0xFFF5F2FA),
      body: CustomScrollView(
        slivers: [
          // RICH HERO HEADER
          SliverToBoxAdapter(
            child: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Color(0xFF4B2E68),
                    Color(0xFF553575),
                    Color(0xFF7E51A0),
                  ],
                ),
                borderRadius: BorderRadius.vertical(bottom: Radius.circular(28)),
              ),
              padding: const EdgeInsets.fromLTRB(20, 48, 20, 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // BRAND TOP ROW
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 38,
                            height: 38,
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFFF3E1B4), Color(0xFFD39A2A)],
                              ),
                              borderRadius: BorderRadius.circular(11),
                            ),
                            child: Center(
                              child: Text(
                                'GA',
                                style: GoogleFonts.plusJakartaSans(
                                  fontWeight: FontWeight.w800,
                                  fontSize: 16,
                                  color: const Color(0xFF3A2352),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'GoAgri Field',
                                style: GoogleFonts.plusJakartaSans(
                                  fontWeight: FontWeight.w800,
                                  fontSize: 15,
                                  color: Colors.white,
                                ),
                              ),
                              Text(
                                widget.userRole == 'supervisor'
                                    ? 'Supervisor Portal'
                                    : 'Officer Portal',
                                style: GoogleFonts.plusJakartaSans(
                                  fontSize: 10,
                                  color: Colors.white70,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      IconButton(
                        icon: const Icon(Icons.logout, color: Colors.white70, size: 20),
                        onPressed: widget.onLogout,
                        tooltip: 'Logout',
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // GREETING
                  Text(
                    'Assalam-o-alaikum, $userName',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.calendar_today, size: 12, color: Colors.white70),
                      const SizedBox(width: 6),
                      Text(
                        'Tuesday, 28 July · 4 farmers assigned',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 12,
                          color: Colors.white70,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // STAT KPI CHIPS
                  Row(
                    children: [
                      _buildHeaderChip('6', 'In progress'),
                      const SizedBox(width: 10),
                      _buildHeaderChip('8', 'KYC pending'),
                      const SizedBox(width: 10),
                      _buildHeaderChip('2', 'Sent back'),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // CONTENT BODY
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // NEW FARMER BUTTON
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF553575),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        elevation: 4,
                      ),
                      onPressed: _startNewRegistration,
                      icon: const Icon(Icons.add, color: Colors.white, size: 22),
                      label: Text(
                        'Register new farmer',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // QUICK TOUR BANNER
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFFFBF2DC), Color(0xFFF5E4B6)],
                      ),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFF3E1B4)),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFFE0AC3A), Color(0xFFC98A1E)],
                            ),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Center(
                            child: Text('✨', style: TextStyle(fontSize: 18)),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'New here? Take a quick tour',
                                style: GoogleFonts.plusJakartaSans(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: const Color(0xFF5A4413),
                                ),
                              ),
                              Text(
                                'See how 11-step onboarding works · 60 sec',
                                style: GoogleFonts.plusJakartaSans(
                                  fontSize: 11,
                                  color: const Color(0xFF8A6A1F),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const Icon(Icons.arrow_forward_ios, size: 14, color: Color(0xFFD39A2A)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // SEARCH BAR
                  TextField(
                    onChanged: (val) => setState(() => _searchQuery = val),
                    decoration: InputDecoration(
                      hintText: 'Search farmer, cnic or ID...',
                      prefixIcon: const Icon(Icons.search, color: Color(0xFF7C7191)),
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: const BorderSide(color: Color(0xFFEAE4F1)),
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // SECTION HEADER
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Continue onboarding',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                          color: const Color(0xFF221B2E),
                        ),
                      ),
                      Text(
                        '${_filteredApplications.length} Applications',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFF553575),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // APPLICATIONS LIST
                  if (_isLoading)
                    const Center(child: CircularProgressIndicator())
                  else if (_filteredApplications.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Center(
                        child: Text(
                          'No applications found',
                          style: GoogleFonts.plusJakartaSans(color: const Color(0xFF7C7191)),
                        ),
                      ),
                    )
                  else
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _filteredApplications.length,
                      itemBuilder: (context, index) {
                        final app = _filteredApplications[index];
                        return _buildAppCard(app);
                      },
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: const Color(0xFF553575),
        onPressed: _startNewRegistration,
        child: const Icon(Icons.add, color: Colors.white, size: 28),
      ),
    );
  }

  Widget _buildHeaderChip(String count, String label) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.12),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.white.withOpacity(0.18)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              count,
              style: GoogleFonts.spaceGrotesk(
                fontSize: 22,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 10,
                color: Colors.white70,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAppCard(ApplicationModel app) {
    final pct = (app.step / 11.0).clamp(0.0, 1.0);

    return Card(
      elevation: 2,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      color: Colors.white,
      child: InkWell(
        onTap: () => _openWorkflow(app),
        borderRadius: BorderRadius.circular(18),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  CircleAvatar(
                    radius: 20,
                    backgroundColor: const Color(0xFFF1ECF8),
                    child: Text(
                      app.farmerName.isNotEmpty ? app.farmerName.substring(0, 1) : 'F',
                      style: GoogleFonts.plusJakartaSans(
                        fontWeight: FontWeight.w800,
                        color: const Color(0xFF553575),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          app.farmerName,
                          style: GoogleFonts.plusJakartaSans(
                            fontWeight: FontWeight.w800,
                            fontSize: 15,
                            color: const Color(0xFF221B2E),
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${app.appCode} · ${app.cropType} · ${app.bankName}',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 11,
                            color: const Color(0xFF7C7191),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1ECF8),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      app.status,
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF553575),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
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
                            backgroundColor: const Color(0xFFF1ECF8),
                            color: const Color(0xFF553575),
                            minHeight: 6,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Step ${app.step} of 11',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 11,
                            color: const Color(0xFF7C7191),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 14),
                  TextButton(
                    onPressed: () => _openWorkflow(app),
                    style: TextButton.styleFrom(
                      foregroundColor: const Color(0xFF553575),
                    ),
                    child: Text(
                      'Resume →',
                      style: GoogleFonts.plusJakartaSans(
                        fontWeight: FontWeight.w700,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
