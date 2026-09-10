"""
Legal Metrology (Packaged Commodities) Rules, 2011 (LMPC) Rule Engine
Department of Consumer Affairs, Government of India
100% Deterministic, Auditable, Rule-based verification engine.
"""

from enum import Enum
import json
import os
import re
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class Severity(str, Enum):
    CRITICAL = "CRITICAL"
    MAJOR = "MAJOR"
    MINOR = "MINOR"


class Violation(BaseModel):
    rule_clause: str
    field: str
    severity: Severity
    message: str
    expected: str
    actual: str


class RuleEngineResult(BaseModel):
    compliant: bool
    total_violations: int
    critical_count: int
    major_count: int
    minor_count: int
    violations: List[Violation] = Field(default_factory=list)
    inspected_fields: Dict[str, Any] = Field(default_factory=dict)


class LMPCRuleEngine:
    """
    Core Deterministic LMPC Rule Engine.
    Enforces Legal Metrology Act, 2009 & Packaged Commodities Rules, 2011.
    """

    def __init__(self, rules_path: Optional[str] = None):
        if rules_path is None:
            # Look relative to file location or project root
            base_dir = os.path.dirname(os.path.abspath(__file__))
            possible_paths = [
                os.path.join(base_dir, "../../../rules/lmpc_rules.json"),
                os.path.join(base_dir, "lmpc_rules.json"),
                os.path.join(os.getcwd(), "rules/lmpc_rules.json"),
            ]
            for p in possible_paths:
                if os.path.exists(p):
                    rules_path = p
                    break

        if rules_path and os.path.exists(rules_path):
            with open(rules_path, "r", encoding="utf-8") as f:
                self.rules_config = json.load(f)
        else:
            self.rules_config = {"rules": []}

    def evaluate(
        self,
        extracted_fields: Dict[str, Any],
        font_metrics: Optional[Dict[str, float]] = None,
        panel_info: Optional[Dict[str, Any]] = None,
    ) -> RuleEngineResult:
        """
        Execute deterministic evaluation of extracted fields against LMPC rules.
        :param extracted_fields: Key-value dictionary of extracted package labels.
        :param font_metrics: Font heights in mm per field, e.g. {"mrp": 3.2, "net_quantity": 4.1}.
        :param panel_info: Principal Display Panel metadata, e.g. {"on_pdp": True, "pdp_area_sqcm": 120}.
        :return: RuleEngineResult containing compliance boolean and list of violations.
        """
        violations: List[Violation] = []
        fields = extracted_fields or {}
        fonts = font_metrics or {}
        panel = panel_info or {"on_pdp": True}

        # -----------------------------------------------------------------
        # 1. Rule 6(1)(a) - Name and Complete Address of Manufacturer / Packer / Importer
        # -----------------------------------------------------------------
        mfg_info = fields.get("manufacturer_info") or fields.get("manufacturer_name") or fields.get("packer_address")
        if not mfg_info or not str(mfg_info).strip():
            violations.append(
                Violation(
                    rule_clause="Rule 6(1)(a)",
                    field="manufacturer_info",
                    severity=Severity.CRITICAL,
                    message="Manufacturer / Packer / Importer name and address is missing or completely absent.",
                    expected="Name and complete physical address with PIN code as per Rule 6(1)(a)",
                    actual="Not detected or empty",
                )
            )
        else:
            mfg_str = str(mfg_info).lower()
            # Check for physical locality indicator or 6 digit Indian pincode
            has_pin = re.search(r"\b[1-9][0-9]{5}\b", str(mfg_info))
            has_keywords = any(kw in mfg_str for kw in ["mfg", "manufactured", "packed by", "marketed by", "imported by", "regd. off", "address", "road", "street", "plot", "ind.", "industrial", "dist", "nagar", "pvt", "ltd"])
            if not has_pin and not has_keywords:
                violations.append(
                    Violation(
                        rule_clause="Rule 6(1)(a)",
                        field="manufacturer_info",
                        severity=Severity.MAJOR,
                        message="Incomplete manufacturer address: Missing postal PIN code or manufacturing identifier keywords.",
                        expected="Complete address with locality, state and 6-digit postal PIN code",
                        actual=str(mfg_info),
                    )
                )

        # -----------------------------------------------------------------
        # 2. Rule 6(1)(b) - Generic or Common Commodity Name
        # -----------------------------------------------------------------
        commodity = fields.get("commodity_name") or fields.get("product_name")
        if not commodity or len(str(commodity).strip()) < 3:
            violations.append(
                Violation(
                    rule_clause="Rule 6(1)(b)",
                    field="commodity_name",
                    severity=Severity.MAJOR,
                    message="Generic or common name of the commodity is missing from the packaging declaration.",
                    expected="Clear generic identity (e.g. 'Wheat Flour', 'Biscuits', 'Edible Oil')",
                    actual=str(commodity) if commodity else "Absent",
                )
            )

        # -----------------------------------------------------------------
        # 3. Rule 6(1)(c) & Rule 22 - Net Quantity Format & Standard Units
        # -----------------------------------------------------------------
        net_qty_raw = fields.get("net_quantity") or fields.get("net_weight")
        parsed_qty_g = 500.0  # default fallback for font calculation

        if not net_qty_raw or not str(net_qty_raw).strip():
            violations.append(
                Violation(
                    rule_clause="Rule 6(1)(c)",
                    field="net_quantity",
                    severity=Severity.CRITICAL,
                    message="Net quantity declaration is missing on the package.",
                    expected="Plain declaration in standard metric units (e.g., '500 g', '1 kg', '1 l')",
                    actual="Absent",
                )
            )
        else:
            net_qty_str = str(net_qty_raw).strip()
            # Non-standard plural or colloquial formats (Rule 22 / Rule 6(1)(c))
            forbidden_patterns = [
                (r"\bgrams\b|\bgram\b|\bgms\b|\bgm\b", "g"),
                (r"\bkgs\b|\bkilo\b|\bkilos\b", "kg"),
                (r"\blitres\b|\bliter\b|\bliters\b|\bltr\b|\bltrs\b", "l"),
                (r"\bmls\b|\bml\.\b", "ml"),
            ]
            has_forbidden_unit = False
            for pat, correct_unit in forbidden_patterns:
                if re.search(pat, net_qty_str, re.IGNORECASE):
                    has_forbidden_unit = True
                    violations.append(
                        Violation(
                            rule_clause="Rule 22",
                            field="net_quantity",
                            severity=Severity.MINOR,
                            message=f"Improper unit symbol used for net quantity: non-standard notation in '{net_qty_str}'. SI symbol '{correct_unit}' without pluralization is mandatory.",
                            expected=f"Unit notation '{correct_unit}' (e.g. '500 {correct_unit}')",
                            actual=net_qty_str,
                        )
                    )
                    break

            # Parse numeric value for font rule comparison
            num_match = re.search(r"([0-9]+(?:\.[0-9]+)?)\s*([a-zA-Z]+)", net_qty_str)
            if num_match:
                val = float(num_match.group(1))
                unit = num_match.group(2).lower()
                if unit in ["kg", "l"]:
                    parsed_qty_g = val * 1000.0
                elif unit in ["g", "ml"]:
                    parsed_qty_g = val

        # -----------------------------------------------------------------
        # 4. Rule 6(1)(d) - Month and Year of Manufacture / Packing / Import
        # -----------------------------------------------------------------
        mfg_date = fields.get("manufacturing_date") or fields.get("packing_date") or fields.get("mfg_date")
        if not mfg_date or not str(mfg_date).strip():
            violations.append(
                Violation(
                    rule_clause="Rule 6(1)(d)",
                    field="manufacturing_date",
                    severity=Severity.MAJOR,
                    message="Date/Month and Year of manufacture, packaging or import is missing.",
                    expected="Valid date format MM/YYYY or DD/MM/YYYY or 'Pkd Date MM/YYYY'",
                    actual="Absent",
                )
            )
        else:
            date_str = str(mfg_date).strip()
            valid_date = re.search(r"(\b0[1-9]|1[0-2])[\/\-\.](20\d{2}|\d{2})\b|(\b0[1-9]|[12]\d|3[01])[\/\-\.](0[1-9]|1[0-2])[\/\-\.](20\d{2}|\d{2})\b", date_str)
            if not valid_date:
                violations.append(
                    Violation(
                        rule_clause="Rule 6(1)(d)",
                        field="manufacturing_date",
                        severity=Severity.MAJOR,
                        message=f"Invalid date format '{date_str}'. Month and year of packing must be clearly legible in MM/YYYY format.",
                        expected="MM/YYYY or DD/MM/YYYY (e.g. 05/2024)",
                        actual=date_str,
                    )
                )

        # -----------------------------------------------------------------
        # 5. Rule 6(1)(e) - Maximum Retail Price (MRP) Presence
        # -----------------------------------------------------------------
        mrp_val = fields.get("mrp") or fields.get("mrp_price")
        if not mrp_val or not str(mrp_val).strip():
            violations.append(
                Violation(
                    rule_clause="Rule 6(1)(e)",
                    field="mrp",
                    severity=Severity.CRITICAL,
                    message="Maximum Retail Price (MRP) declaration is completely missing.",
                    expected="MRP Rs. XX.XX or ₹ XX.XX (incl. of all taxes) as per Rule 6(1)(e)",
                    actual="Absent",
                )
            )
        else:
            mrp_str = str(mrp_val).strip()

            # -------------------------------------------------------------
            # 6. Rule 18 - "incl. of all taxes" Mandate
            # -------------------------------------------------------------
            # Check if taxes inclusion clause is mentioned
            mrp_clause_full = fields.get("mrp_full_text") or mrp_str
            has_tax_clause = bool(
                re.search(
                    r"(incl\.?\s*of\s*all\s*taxes|inclusive\s*of\s*all\s*taxes|all\s*taxes\s*incl\.?)",
                    str(mrp_clause_full),
                    re.IGNORECASE,
                )
            )
            if not has_tax_clause:
                violations.append(
                    Violation(
                        rule_clause="Rule 18",
                        field="mrp",
                        severity=Severity.MAJOR,
                        message="MRP declaration does not state '(incl. of all taxes)' or 'inclusive of all taxes'.",
                        expected="MRP Rs. X (incl. of all taxes)",
                        actual=mrp_str,
                    )
                )

        # -----------------------------------------------------------------
        # 7. Rule 6(1)(f) - Consumer Care Helpline & Redressal Mechanism
        # -----------------------------------------------------------------
        care = fields.get("consumer_care") or fields.get("customer_care")
        if not care or not str(care).strip():
            violations.append(
                Violation(
                    rule_clause="Rule 6(1)(f)",
                    field="consumer_care",
                    severity=Severity.MAJOR,
                    message="Consumer Care / Grievance redressal contact details are missing on the package.",
                    expected="Contact name/designation, address, telephone/toll-free number, and email ID",
                    actual="Absent",
                )
            )
        else:
            care_str = str(care)
            has_phone = bool(re.search(r"(\+91[\-\s]?)?[0-9]{10,11}|1800[\-\s]?[0-9]{3,4}[\-\s]?[0-9]{3,4}", care_str))
            has_email = bool(re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", care_str))
            if not (has_phone or has_email):
                violations.append(
                    Violation(
                        rule_clause="Rule 6(1)(f)",
                        field="consumer_care",
                        severity=Severity.MAJOR,
                        message="Consumer care declaration is incomplete: Lacks valid telephone/toll-free number or email address.",
                        expected="Consumer Care Toll-free / Phone number and valid grievance Email ID",
                        actual=care_str,
                    )
                )

        # -----------------------------------------------------------------
        # 8. Rule 8 - Minimum Font Size Height in mm (Table 1)
        # -----------------------------------------------------------------
        # Table 1:
        # Net Qty <= 50g -> 1.0mm
        # 50g - 100g -> 1.5mm
        # 100g - 200g -> 2.0mm
        # 200g - 500g -> 2.5mm
        # 500g - 1000g -> 4.0mm
        # > 1000g -> 6.0mm
        min_required_font_mm = 1.0
        if parsed_qty_g <= 50:
            min_required_font_mm = 1.0
        elif parsed_qty_g <= 100:
            min_required_font_mm = 1.5
        elif parsed_qty_g <= 200:
            min_required_font_mm = 2.0
        elif parsed_qty_g <= 500:
            min_required_font_mm = 2.5
        elif parsed_qty_g <= 1000:
            min_required_font_mm = 4.0
        else:
            min_required_font_mm = 6.0

        measured_font_mm = fonts.get("mrp") or fonts.get("net_quantity") or fonts.get("primary_font_mm") or fields.get("font_size_mm")
        if measured_font_mm is not None:
            try:
                measured_val = float(measured_font_mm)
                if measured_val < min_required_font_mm:
                    violations.append(
                        Violation(
                            rule_clause="Rule 8",
                            field="font_size",
                            severity=Severity.MAJOR,
                            message=f"Font height of numerals ({measured_val:.1f} mm) is below the statutory requirement of {min_required_font_mm:.1f} mm for a package of {parsed_qty_g:.0f} g.",
                            expected=f"Minimum font height ≥ {min_required_font_mm:.1f} mm as per Rule 8 Table 1",
                            actual=f"{measured_val:.1f} mm",
                        )
                    )
            except (ValueError, TypeError):
                pass

        # -----------------------------------------------------------------
        # 9. Rule 6 - Language Verification (Hindi or English Mandatory)
        # -----------------------------------------------------------------
        lang = fields.get("language") or fields.get("primary_language")
        if lang:
            lang_code = str(lang).lower().strip()
            if lang_code not in ["en", "hi", "english", "hindi", "hin", "eng"]:
                violations.append(
                    Violation(
                        rule_clause="Rule 6",
                        field="language",
                        severity=Severity.MAJOR,
                        message=f"Mandatory declarations detected in unsupported language '{lang_code}'. Must be in Hindi (Devanagari) or English.",
                        expected="Hindi in Devanagari script or English as per Rule 6",
                        actual=lang_code,
                    )
                )

        # -----------------------------------------------------------------
        # 10. Rule 5 & 7 - Principal Display Panel (PDP) Placement
        # -----------------------------------------------------------------
        on_pdp = panel.get("on_pdp", True)
        if on_pdp is False:
            violations.append(
                Violation(
                    rule_clause="Rule 5, 7",
                    field="principal_display_panel",
                    severity=Severity.MAJOR,
                    message="Mandatory declarations are not located on the Principal Display Panel (PDP).",
                    expected="Placed conspicuously on Principal Display Panel",
                    actual="Found outside primary visible consumer panel",
                )
            )

        # -----------------------------------------------------------------
        # 11. Rule 27 - Country of Origin for Imported Commodities
        # -----------------------------------------------------------------
        is_import = fields.get("is_imported") or fields.get("imported")
        country_origin = fields.get("country_of_origin") or fields.get("origin_country")
        if is_import:
            if not country_origin or not str(country_origin).strip():
                violations.append(
                    Violation(
                        rule_clause="Rule 27",
                        field="country_of_origin",
                        severity=Severity.CRITICAL,
                        message="Imported commodity lacks mandatory 'Country of Origin' declaration under Rule 27.",
                        expected="Explicit declaration e.g. 'Country of Origin: Spain/USA/Germany'",
                        actual="Absent on imported package",
                    )
                )

        # Calculate tally
        crit_count = sum(1 for v in violations if v.severity == Severity.CRITICAL)
        maj_count = sum(1 for v in violations if v.severity == Severity.MAJOR)
        min_count = sum(1 for v in violations if v.severity == Severity.MINOR)

        return RuleEngineResult(
            compliant=(len(violations) == 0),
            total_violations=len(violations),
            critical_count=crit_count,
            major_count=maj_count,
            minor_count=min_count,
            violations=violations,
            inspected_fields=fields,
        )


# -------------------------------------------------------------------------
# 5 Reference Sample Input Dictionaries for Verification & Unit Testing
# -------------------------------------------------------------------------

SAMPLE_TEST_CASES = {
    "case_1_compliant": {
        "fields": {
            "commodity_name": "Whole Wheat Chakki Atta",
            "manufacturer_info": "Patanjali Foods Ltd, Plot 14, Industrial Area Haridwar, Uttarakhand 249401",
            "net_quantity": "5 kg",
            "mrp": "Rs. 240.00",
            "mrp_full_text": "MRP Rs. 240.00 (incl. of all taxes)",
            "manufacturing_date": "04/2024",
            "consumer_care": "Customer Care: 1800-180-4180, Email: feedback@patanjalifoods.com",
            "language": "en",
            "is_imported": False,
        },
        "font_metrics": {"mrp": 6.5, "net_quantity": 6.2},
        "panel_info": {"on_pdp": True},
        "expected_violations_count": 0,
    },
    "case_2_missing_mrp": {
        "fields": {
            "commodity_name": "Crispy Potato Wafers",
            "manufacturer_info": "Haldiram Snacks Pvt Ltd, Sector 62, Noida UP 201301",
            "net_quantity": "100 g",
            "mrp": None,  # Missing MRP
            "manufacturing_date": "06/2024",
            "consumer_care": "Care: 1800-102-5555, care@haldiram.com",
            "language": "en",
            "is_imported": False,
        },
        "font_metrics": {"net_quantity": 2.2},
        "panel_info": {"on_pdp": True},
        "expected_rule": "Rule 6(1)(e)",
        "expected_severity": Severity.CRITICAL,
    },
    "case_3_font_undersized": {
        "fields": {
            "commodity_name": "Premium Basmati Rice",
            "manufacturer_info": "India Gate Foods, GT Road, Karnal Haryana 132001",
            "net_quantity": "750 g",  # 750g requires min 4.0mm font
            "mrp": "Rs. 140.00",
            "mrp_full_text": "MRP Rs. 140.00 (incl. of all taxes)",
            "manufacturing_date": "05/2024",
            "consumer_care": "Tollfree 1800-111-222, rice@indiagate.com",
            "font_size_mm": 1.5,  # Only 1.5mm! (Requires 4.0mm)
            "language": "en",
            "is_imported": False,
        },
        "font_metrics": {"mrp": 1.5, "net_quantity": 1.5},
        "panel_info": {"on_pdp": True},
        "expected_rule": "Rule 8",
        "expected_severity": Severity.MAJOR,
    },
    "case_4_net_qty_unit_format": {
        "fields": {
            "commodity_name": "Pure Desi Cow Ghee",
            "manufacturer_info": "Amul Dairy, Anand, Gujarat 388001",
            "net_quantity": "500 grams",  # Non-standard plural 'grams', should be '500 g'
            "mrp": "Rs. 320.00",
            "mrp_full_text": "MRP Rs. 320.00 (incl. of all taxes)",
            "manufacturing_date": "03/2024",
            "consumer_care": "1800-258-3333, amul@amuldairy.com",
            "language": "en",
            "is_imported": False,
        },
        "font_metrics": {"mrp": 3.0, "net_quantity": 3.0},
        "panel_info": {"on_pdp": True},
        "expected_rule": "Rule 22",
        "expected_severity": Severity.MINOR,
    },
    "case_5_import_without_country_of_origin": {
        "fields": {
            "commodity_name": "Extra Virgin Olive Oil",
            "manufacturer_info": "Imported by Mediterranean Imports LLP, Nariman Point Mumbai 400021",
            "net_quantity": "1 l",
            "mrp": "Rs. 1250.00",
            "mrp_full_text": "MRP Rs. 1250.00 (incl. of all taxes)",
            "manufacturing_date": "01/2024",
            "consumer_care": "022-22880000, care@medimports.in",
            "is_imported": True,
            "country_of_origin": None,  # Missing country of origin!
            "language": "en",
        },
        "font_metrics": {"mrp": 4.5, "net_quantity": 4.5},
        "panel_info": {"on_pdp": True},
        "expected_rule": "Rule 27",
        "expected_severity": Severity.CRITICAL,
    },
    "case_6_mrp_without_tax_clause": {
        "fields": {
            "commodity_name": "Almond Cookies",
            "manufacturer_info": "Britannia Industries Ltd, Whitefield Bangalore 560066",
            "net_quantity": "200 g",
            "mrp": "Rs 100",  # No (incl. of all taxes)
            "mrp_full_text": "Rs 100",
            "manufacturing_date": "06/2024",
            "consumer_care": "1800-425-4449, feedback@britindia.com",
            "language": "en",
            "is_imported": False,
        },
        "font_metrics": {"mrp": 2.5, "net_quantity": 2.5},
        "panel_info": {"on_pdp": True},
        "expected_rule": "Rule 18",
        "expected_severity": Severity.MAJOR,
    },
}
