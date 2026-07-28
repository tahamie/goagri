import 'package:flutter_test/flutter_test.dart';
import 'package:goagri_mobile_app/main.dart';

void main() {
  testWidgets('App renders test', (WidgetTester tester) async {
    await tester.pumpWidget(const GoAgriMobileApp());
    expect(find.byType(GoAgriMobileApp), findsOneWidget);
  });
}
