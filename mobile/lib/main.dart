import 'package:flutter/material.dart';

void main() {
  runApp(const PackScanMobileApp());
}

class PackScanMobileApp extends StatelessWidget {
  const PackScanMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PackScan Field Officer',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1E3A8A),
          primary: const Color(0xFF1E3A8A),
        ),
        useMaterial3: true,
      ),
      home: const FieldInspectionHomeScreen(),
    );
  }
}

class FieldInspectionHomeScreen extends StatefulWidget {
  const FieldInspectionHomeScreen({super.key});

  @override
  State<FieldInspectionHomeScreen> createState() => _FieldInspectionHomeScreenState();
}

class _FieldInspectionHomeScreenState extends State<FieldInspectionHomeScreen> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.amber.shade700,
                borderRadius: BorderRadius.circular(4),
              ),
              child: const Text('DoCA', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
            ),
            const SizedBox(width: 8),
            const Text('PackScan Officer App', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
          ],
        ),
        backgroundColor: const Color(0xFF1E3A8A),
        foregroundColor: Colors.white,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.qr_code_scanner, size: 96, color: Color(0xFF1E3A8A)),
              const SizedBox(height: 24),
              const Text(
                'LMPC On-Site Verification',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              const Text(
                'Capture commodity retail packaging to verify MRP, Font Size (Rule 8), Net Qty, and Mandatory Declarations under Legal Metrology Act, 2009.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey),
              ),
              const SizedBox(height: 36),
              ElevatedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Opening High-Res Camera with Optical Grid & EAN-13 Calibration...')),
                  );
                },
                icon: const Icon(Icons.camera_alt),
                label: const Text('SCAN PACKAGED COMMODITY', style: TextStyle(fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1E3A8A),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (idx) => setState(() => _selectedIndex = idx),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.scanner), label: 'Scan'),
          NavigationDestination(icon: Icon(Icons.history), label: 'Inspections'),
          NavigationDestination(icon: Icon(Icons.assignment), label: 'Notices'),
          NavigationDestination(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}
