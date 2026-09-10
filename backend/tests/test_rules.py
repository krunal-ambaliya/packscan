"""
Unit Tests for Legal Metrology (Packaged Commodities) Rules, 2011 Rule Engine.
Department of Consumer Affairs, Government of India.
Tests 100% deterministic rule enforcement with statutory clause checks.
"""

import pytest
import sys
import os

# Ensure backend path is available
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.rules.engine import LMPCRuleEngine, Severity


@pytest.fixture
def engine():
    return LMPCRuleEngine()


def test_compliant_label_passes_all_rules(engine):
    """Scenario 1: Fully compliant package label must produce 0 violations."""
    sample = {
        "commodity_name": "Whole Wheat Atta",
        "manufacturer_info": "Patanjali Foods Ltd, Plot 14 Industrial Area Haridwar UK 249401",
        "net_quantity": "5 kg",
        "mrp": "Rs. 240.00",
        "mrp_full_text": "MRP Rs. 240.00 (incl. of all taxes)",
        "manufacturing_date": "04/2024",
        "consumer_care": "Customer Care: 1800-180-4180, Email: feedback@patanjali.com",
        "language": "en",
        "is_imported": False,
    }
    font_metrics = {"mrp": 6.5, "net_quantity": 6.2}
    panel_info = {"on_pdp": True}

    result = engine.evaluate(sample, font_metrics=font_metrics, panel_info=panel_info)
    assert result.compliant is True
    assert result.total_violations == 0
    assert len(result.violations) == 0


def test_missing_mrp_is_critical_violation_rule_6_1_e(engine):
    """Scenario 2: Missing MRP declaration must trigger CRITICAL violation Rule 6(1)(e)."""
    sample = {
        "commodity_name": "Crispy Potato Wafers",
        "manufacturer_info": "Haldiram Snacks Pvt Ltd, Sector 62, Noida UP 201301",
        "net_quantity": "100 g",
        "mrp": None,  # Missing MRP
        "manufacturing_date": "06/2024",
        "consumer_care": "Care: 1800-102-5555, care@haldiram.com",
        "language": "en",
        "is_imported": False,
    }
    result = engine.evaluate(sample)
    assert result.compliant is False
    assert result.critical_count >= 1

    violation_clauses = [v.rule_clause for v in result.violations]
    assert "Rule 6(1)(e)" in violation_clauses

    mrp_violation = next(v for v in result.violations if v.rule_clause == "Rule 6(1)(e)")
    assert mrp_violation.severity == Severity.CRITICAL
    assert mrp_violation.field == "mrp"


def test_font_size_below_statutory_height_rule_8(engine):
    """Scenario 3: Font 1.5mm on a 750g pack (requires ≥4.0mm) triggers MAJOR violation Rule 8."""
    sample = {
        "commodity_name": "Premium Basmati Rice",
        "manufacturer_info": "India Gate Foods, GT Road Karnal Haryana 132001",
        "net_quantity": "750 g",  # 750g pack requires ≥4.0mm font
        "mrp": "Rs. 140.00",
        "mrp_full_text": "MRP Rs. 140.00 (incl. of all taxes)",
        "manufacturing_date": "05/2024",
        "consumer_care": "1800-111-222, care@indiagate.com",
        "language": "en",
        "is_imported": False,
    }
    # Measured font is only 1.5mm
    font_metrics = {"mrp": 1.5, "net_quantity": 1.5}

    result = engine.evaluate(sample, font_metrics=font_metrics)
    assert result.compliant is False

    rule_8_violations = [v for v in result.violations if v.rule_clause == "Rule 8"]
    assert len(rule_8_violations) >= 1
    assert rule_8_violations[0].severity == Severity.MAJOR
    assert rule_8_violations[0].field == "font_size"
    assert "4.0" in rule_8_violations[0].expected
    assert "1.5" in rule_8_violations[0].actual


def test_net_quantity_unit_notation_rule_22(engine):
    """Scenario 4: Net quantity '500 grams' (instead of '500 g') triggers MINOR violation Rule 22."""
    sample = {
        "commodity_name": "Pure Desi Cow Ghee",
        "manufacturer_info": "Amul Dairy, Anand, Gujarat 388001",
        "net_quantity": "500 grams",  # Violation: 'grams' instead of standard SI 'g'
        "mrp": "Rs. 320.00",
        "mrp_full_text": "MRP Rs. 320.00 (incl. of all taxes)",
        "manufacturing_date": "03/2024",
        "consumer_care": "1800-258-3333, amul@amul.coop",
        "language": "en",
        "is_imported": False,
    }
    result = engine.evaluate(sample)
    assert result.compliant is False

    rule_22_violations = [v for v in result.violations if v.rule_clause == "Rule 22"]
    assert len(rule_22_violations) >= 1
    assert rule_22_violations[0].severity == Severity.MINOR
    assert rule_22_violations[0].field == "net_quantity"
    assert "500 grams" in rule_22_violations[0].actual


def test_import_missing_country_of_origin_rule_27(engine):
    """Scenario 5: Imported package without country of origin triggers CRITICAL violation Rule 27."""
    sample = {
        "commodity_name": "Extra Virgin Olive Oil",
        "manufacturer_info": "Imported by Mediterranean Imports LLP, Nariman Point Mumbai 400021",
        "net_quantity": "1 l",
        "mrp": "Rs. 1250.00",
        "mrp_full_text": "MRP Rs. 1250.00 (incl. of all taxes)",
        "manufacturing_date": "01/2024",
        "consumer_care": "022-22880000, care@medimports.in",
        "is_imported": True,
        "country_of_origin": None,  # Absent!
        "language": "en",
    }
    result = engine.evaluate(sample)
    assert result.compliant is False

    rule_27_violations = [v for v in result.violations if v.rule_clause == "Rule 27"]
    assert len(rule_27_violations) >= 1
    assert rule_27_violations[0].severity == Severity.CRITICAL
    assert rule_27_violations[0].field == "country_of_origin"


def test_mrp_without_inclusive_of_taxes_clause_rule_18(engine):
    """Scenario 6: MRP stated as 'Rs 100' without '(incl. of all taxes)' triggers MAJOR violation Rule 18."""
    sample = {
        "commodity_name": "Almond Butter Cookies",
        "manufacturer_info": "Britannia Industries Ltd, Whitefield Bangalore 560066",
        "net_quantity": "200 g",
        "mrp": "Rs 100",  # Omits 'incl. of all taxes'
        "mrp_full_text": "Rs 100",
        "manufacturing_date": "06/2024",
        "consumer_care": "1800-425-4449, feedback@britindia.com",
        "language": "en",
        "is_imported": False,
    }
    result = engine.evaluate(sample)
    assert result.compliant is False

    rule_18_violations = [v for v in result.violations if v.rule_clause == "Rule 18"]
    assert len(rule_18_violations) >= 1
    assert rule_18_violations[0].severity == Severity.MAJOR
    assert rule_18_violations[0].field == "mrp"
