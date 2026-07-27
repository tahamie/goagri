class ApplicationModel {
  final int id;
  final String appCode;
  final String farmerName;
  final String farmerCnic;
  final String farmerMobile;
  final String cropType;
  final String bankName;
  final String status;
  final int step;
  final double cultivatedArea;
  final double initialRequirement;

  ApplicationModel({
    required this.id,
    required this.appCode,
    required this.farmerName,
    required this.farmerCnic,
    required this.farmerMobile,
    required this.cropType,
    required this.bankName,
    required this.status,
    required this.step,
    required this.cultivatedArea,
    required this.initialRequirement,
  });

  factory ApplicationModel.fromJson(Map<String, dynamic> json) {
    int stepNum = 2;
    final s = json['status'] ?? 'KYC Pending';
    if (s == 'KYC Pending') stepNum = 2;
    else if (s == 'Farmer Active' || s == 'KYC Verified') stepNum = 3;
    else if (s == 'Land Verified') stepNum = 5;
    else if (s == 'Collateral Verified') stepNum = 6;
    else if (s == 'Yield Calculated') stepNum = 8;
    else if (s == 'Eligibility Calculated') stepNum = 9;
    else if (s == 'Credit Score Generated') stepNum = 10;
    else if (s == 'Submitted to Bank') stepNum = 11;

    return ApplicationModel(
      id: json['id'] ?? 0,
      appCode: json['app_code'] ?? 'APP-0000',
      farmerName: json['farmer_name'] ?? 'Farmer Name',
      farmerCnic: json['farmer_cnic'] ?? '35201-0000000-0',
      farmerMobile: json['farmer_mobile'] ?? '03000000000',
      cropType: json['crop_type'] ?? 'Wheat',
      bankName: json['bank_name'] ?? 'Bank A',
      status: json['status'] ?? 'KYC Pending',
      step: stepNum,
      cultivatedArea: double.parse((json['cultivated_area'] ?? 10.0).toString()),
      initialRequirement: double.parse((json['initial_financing_requirement'] ?? 500000.0).toString()),
    );
  }
}
