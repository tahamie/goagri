import 'package:flutter/material.dart';
import '../models/application_model.dart';
import '../services/api_service.dart';

class WorkflowScreen extends StatefulWidget {
  final ApplicationModel app;
  final String userRole;

  const WorkflowScreen({
    super.key,
    required this.app,
    this.userRole = 'ops_officer',
  });

  @override
  State<WorkflowScreen> createState() => _WorkflowScreenState();
}

class _WorkflowScreenState extends State<WorkflowScreen> {
  late int currentStep;
  bool kycSkipToggle = true;

  // Dynamic GPS state
  final TextEditingController _latController = TextEditingController();
  final TextEditingController _lngController = TextEditingController();

  // Dropdown values
  String selectedCrop = 'Wheat';
  String selectedBank = 'Bank A';
  String selectedOwnership = 'Owned';
  String selectedMortgage = 'Clear';
  String selectedEncumbrance = 'No Encumbrance Found';

  @override
  void initState() {
    super.initState();
    currentStep = widget.app.step;
    selectedCrop = widget.app.cropType.isNotEmpty ? widget.app.cropType : 'Wheat';
    selectedBank = widget.app.bankName.isNotEmpty ? widget.app.bankName : 'Bank A';
  }

  final List<String> stepTitles = [
    'Registration',
    'KYC Verification',
    'Land Verification',
    'Collateral Verification',
    'Historical Yields',
    'Financing Crop',
    'Financing Eligibility',
    'Credit Scoring',
    'Financing Selection',
    'Submit to Bank'
  ];

  void _fetchGpsLocation() {
    setState(() {
      _latController.text = '32.0836';
      _lngController.text = '72.6711';
    });
  }

  @override
  Widget build(BuildContext context) {
    const plumColor = Color(0xFF553575);
    final isSupervisorOrAdmin = widget.userRole == 'supervisor' || widget.userRole == 'admin';

    return Scaffold(
      backgroundColor: const Color(0xFFF6F3FB),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 1,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: plumColor),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(widget.app.farmerName, style: const TextStyle(color: Colors.black, fontSize: 16, fontWeight: FontWeight.bold)),
            Text('${widget.app.appCode} · $selectedCrop · $selectedBank', style: const TextStyle(color: Colors.grey, fontSize: 11)),
          ],
        ),
      ),
      body: Column(
        children: [
          // STEP PROGRESS INDICATOR
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Column(
              children: [
                Row(
                  children: List.generate(10, (idx) {
                    final isDone = idx + 1 < currentStep;
                    final isCur = idx + 1 == currentStep;
                    return Expanded(
                      child: Container(
                        height: 6,
                        margin: const EdgeInsets.symmetric(horizontal: 1.5),
                        decoration: BoxDecoration(
                          color: isDone ? plumColor : isCur ? const Color(0xFFD39A2A) : const Color(0xFFF3EEF9),
                          borderRadius: BorderRadius.circular(3),
                        ),
                      ),
                    );
                  }),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Step $currentStep of 10', style: const TextStyle(color: plumColor, fontWeight: FontWeight.bold, fontSize: 12.5)),
                    Text(stepTitles[currentStep - 1], style: const TextStyle(color: Colors.grey, fontSize: 12.5, fontWeight: FontWeight.w600)),
                  ],
                ),
              ],
            ),
          ),

          // STEP CONTENT BODY
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: _buildStepContent(currentStep),
            ),
          ),

          // PINNED FOOTER ACTIONS
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: Colors.white,
              boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, -2))],
            ),
            child: Row(
              children: [
                if (currentStep > 1)
                  Expanded(
                    flex: 1,
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size(double.infinity, 50),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: () => setState(() => currentStep--),
                      child: const Text('Back', style: TextStyle(color: plumColor, fontWeight: FontWeight.bold)),
                    ),
                  ),
                if (currentStep > 1) const SizedBox(width: 10),
                Expanded(
                  flex: 2,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size(double.infinity, 50),
                      backgroundColor: plumColor,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    onPressed: () async {
                      if (currentStep < 9) {
                        await ApiService.transitionStep(widget.app.id, currentStep, 'proceed', 'Step updated');
                        setState(() => currentStep++);
                      } else if (currentStep == 9) {
                        await ApiService.transitionStep(widget.app.id, 9, 'select', 'Submitted for Supervisor Approval');
                        if (!isSupervisorOrAdmin) {
                          _showOfficerCompletionDialog();
                        } else {
                          setState(() => currentStep = 10);
                        }
                      } else {
                        await ApiService.transitionStep(widget.app.id, 10, 'submit', 'Submitted to Bank');
                        _showBankSubmissionDialog();
                      }
                    },
                    child: Text(
                      currentStep == 9 && !isSupervisorOrAdmin
                          ? 'Submit for Approval →'
                          : currentStep == 10
                              ? 'Authorize & Submit to Bank →'
                              : 'Save & Continue →',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepContent(int step) {
    switch (step) {
      case 1:
        return _buildCard([
          const Text('Farmer Registration', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          _buildTextField('Full Name', widget.app.farmerName),
          _buildTextField('CNIC', widget.app.farmerCnic),
          _buildTextField('Mobile Number', widget.app.farmerMobile),
        ]);

      case 2:
        return Column(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFE4D9F0)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Portal Pre-Verified KYC', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  Switch(
                    value: kycSkipToggle,
                    activeColor: const Color(0xFF553575),
                    onChanged: (val) => setState(() => kycSkipToggle = val),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
            _buildCard([
              const Text('KYC Verification', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              const Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('CNIC Match', style: TextStyle(color: Colors.grey)),
                  Text('Verified ✓', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                ],
              ),
              const Divider(height: 20),
              const Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('eCIB Status', style: TextStyle(color: Colors.grey)),
                  Text('Clear ✓', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                ],
              ),
            ]),
          ],
        );

      case 3:
        return _buildCard([
          const Text('Land Verification', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          _buildTextField('Cultivated Area (acres)', '${widget.app.cultivatedArea}'),
          _buildDropdown('Ownership Status', selectedOwnership, ['Owned', 'Leased', 'Jointly Owned'], (val) {
            if (val != null) setState(() => selectedOwnership = val);
          }),
          const SizedBox(height: 8),
          const Text('GPS Coordinates', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
          const SizedBox(height: 6),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _latController,
                  decoration: InputDecoration(
                    hintText: 'Latitude (32.0836)',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: TextField(
                  controller: _lngController,
                  decoration: InputDecoration(
                    hintText: 'Longitude (72.6711)',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFF3EEF9),
              minimumSize: const Size(double.infinity, 44),
            ),
            onPressed: _fetchGpsLocation,
            icon: const Icon(Icons.my_location, color: Color(0xFF553575), size: 18),
            label: const Text('📍 Fetch Current Location', style: TextStyle(color: Color(0xFF553575), fontWeight: FontWeight.bold)),
          ),
        ]);

      case 4:
        return _buildCard([
          const Text('Collateral Verification', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          _buildDropdown('Mortgage Status', selectedMortgage, ['Clear', 'Mortgaged', 'Under Verification'], (val) {
            if (val != null) setState(() => selectedMortgage = val);
          }),
          const SizedBox(height: 12),
          _buildDropdown('Encumbrance Status', selectedEncumbrance, ['No Encumbrance Found', 'Encumbrance Found', 'Under Verification'], (val) {
            if (val != null) setState(() => selectedEncumbrance = val);
          }),
        ]);

      case 6:
        final maunds = widget.app.cultivatedArea * 45;
        final cropVal = maunds * 3900;
        return Column(
          children: [
            _buildCard([
              const Text('Financing Crop', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              _buildDropdown('Target Crop Type', selectedCrop, ['Wheat', 'Cotton', 'Maize', 'Rice', 'Sugarcane'], (val) {
                if (val != null) setState(() => selectedCrop = val);
              }),
              const SizedBox(height: 12),
              _buildTextField('Cultivated Area (acres)', '${widget.app.cultivatedArea}'),
            ]),
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Color(0xFF553575), Color(0xFF6A438C)]),
                borderRadius: BorderRadius.circular(18),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Estimated Crop Value ($maunds maund × PKR 3,900)', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                  const SizedBox(height: 6),
                  Text('PKR ${cropVal.toStringAsFixed(0)}', style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          ],
        );

      case 8:
        return _buildCard([
          const Text('Credit Scoring', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFE7F5EE),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Computed Credit Score', style: TextStyle(fontWeight: FontWeight.bold)),
                Text('726 / 900 (Approve Band)', style: TextStyle(color: Color(0xFF2E9E6B), fontWeight: FontWeight.bold)),
              ],
            ),
          ),
          const SizedBox(height: 12),
          const Text('✓ Credit score calculated automatically. No intermediate approval required.', style: TextStyle(color: Colors.grey, fontSize: 12)),
        ]);

      case 9:
        return _buildCard([
          const Text('Financing Selection', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          _buildDropdown('Target Bank', selectedBank, ['Bank A', 'Bank B', 'Bank C', 'HBL', 'UBL', 'Meezan Bank'], (val) {
            if (val != null) setState(() => selectedBank = val);
          }),
          const SizedBox(height: 12),
          _buildTextField('Final Requested Amount (PKR)', '${widget.app.initialRequirement}'),
        ]);

      default:
        return _buildCard([
          Text('Step $step · ${stepTitles[step - 1]}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          const Text('Field verification and data entry for this step is ready.', style: TextStyle(color: Colors.grey)),
        ]);
    }
  }

  Widget _buildCard(List<Widget> children) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFECE7F3)),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: children),
    );
  }

  Widget _buildTextField(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextField(
        controller: TextEditingController(text: value),
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
    );
  }

  Widget _buildDropdown(String label, String currentVal, List<String> items, ValueChanged<String?> onChanged) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: DropdownButtonFormField<String>(
        value: currentVal,
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        ),
        items: items.map((item) => DropdownMenuItem(value: item, child: Text(item))).toList(),
        onChanged: onChanged,
      ),
    );
  }

  void _showOfficerCompletionDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const CircleAvatar(
              radius: 32,
              backgroundColor: Color(0xFFE7F5EE),
              child: Icon(Icons.check, color: Color(0xFF2E9E6B), size: 36),
            ),
            const SizedBox(height: 16),
            const Text('Submitted for Approval!', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('Application ${widget.app.appCode} has been submitted to the Supervisor queue for review.', textAlign: TextAlign.center, style: const TextStyle(color: Colors.grey, fontSize: 13)),
            const SizedBox(height: 20),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF553575)),
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.pop(context);
              },
              child: const Text('Back to Home', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }

  void _showBankSubmissionDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const CircleAvatar(
              radius: 36,
              backgroundColor: Color(0xFFE7F5EE),
              child: Icon(Icons.account_balance, color: Color(0xFF2E9E6B), size: 40),
            ),
            const SizedBox(height: 16),
            Text('Authorized & Submitted to $selectedBank', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('Application ${widget.app.appCode} has been authorized and submitted to the bank.', textAlign: TextAlign.center, style: const TextStyle(color: Colors.grey, fontSize: 13)),
            const SizedBox(height: 20),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF553575)),
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.pop(context);
              },
              child: const Text('Back to Home', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }
}
