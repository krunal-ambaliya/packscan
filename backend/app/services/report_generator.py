"""
Statutory Compliance Report Generator for Department of Consumer Affairs (DoCA).
Produces official PDF and DOCX compliance notices under Section 15 of Legal Metrology Act, 2009.
"""

import io
from datetime import datetime
from typing import Any, Dict


def _generate_html_report(inspection_data: Dict[str, Any]) -> str:
    """
    Generates the HTML template for the official report.
    """
    inspection_id = str(inspection_data.get("id", "N/A"))
    date_str = datetime.utcnow().strftime("%d-%b-%Y %H:%M UTC")
    officer_name = str(inspection_data.get("officer_email", "Authorized Legal Metrology Officer"))
    image_url = str(inspection_data.get("image_url", ""))
    
    # Render Violations Table
    violations = inspection_data.get("violations", [])
    violations_html = ""
    if violations:
        violations_html += """
        <table class="data-table">
            <thead>
                <tr>
                    <th>Severity</th>
                    <th>Rule Clause</th>
                    <th>Field</th>
                    <th>Statutory Failure</th>
                    <th>Required Standard</th>
                </tr>
            </thead>
            <tbody>
        """
        # Group by severity conceptually, or just sort them
        sorted_violations = sorted(violations, key=lambda v: v.get("severity", ""), reverse=False)
        for v in sorted_violations:
            severity = v.get("severity", "")
            color = "#ef4444" if severity == "CRITICAL" else "#f97316" if severity == "MAJOR" else "#eab308"
            violations_html += f"""
                <tr>
                    <td style="color: {color}; font-weight: bold;">{severity}</td>
                    <td>{v.get('rule_clause', '')}</td>
                    <td>{v.get('field', '')}</td>
                    <td>{v.get('message', '')}</td>
                    <td>{v.get('expected', '')}</td>
                </tr>
            """
        violations_html += "</tbody></table>"
    else:
        violations_html = "<p><strong>No statutory violations detected. Package complies with LMPC Rules, 2011.</strong></p>"

    # Render Extracted Fields Table
    fields = inspection_data.get("extracted_fields", [])
    fields_html = ""
    if fields:
        fields_html += """
        <table class="data-table">
            <thead>
                <tr>
                    <th>Field Name</th>
                    <th>Value</th>
                    <th>Confidence</th>
                </tr>
            </thead>
            <tbody>
        """
        for f in fields:
            conf = f.get('confidence', 0.0)
            fields_html += f"""
                <tr>
                    <td>{f.get('field_name', '')}</td>
                    <td>{f.get('value', '')}</td>
                    <td>{conf:.1%}</td>
                </tr>
            """
        fields_html += "</tbody></table>"
    else:
        fields_html = "<p>No data extracted.</p>"

    # Render Annotated Image
    image_html = ""
    if image_url:
        image_html = f"""
        <div class="image-container">
            <h3>Annotated Package Image</h3>
            <img src="{image_url}" alt="Package Image" style="max-width: 100%; max-height: 400px; border: 1px solid #ccc;"/>
        </div>
        """

    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Inspection Report {inspection_id}</title>
        <style>
            @page {{
                size: A4;
                margin: 20mm;
                @bottom-center {{
                    content: "Page " counter(page) " of " counter(pages);
                    font-size: 10pt;
                    color: #666;
                }}
            }}
            body {{
                font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
                color: #333;
                font-size: 12pt;
                line-height: 1.5;
            }}
            .header {{
                text-align: center;
                border-bottom: 2px solid #1e3a8a;
                padding-bottom: 10px;
                margin-bottom: 20px;
            }}
            .header img {{
                height: 60px;
            }}
            .header h1 {{
                color: #1e3a8a;
                margin: 10px 0 5px 0;
                font-size: 20pt;
            }}
            .header h2 {{
                color: #b91c1c;
                margin: 0;
                font-size: 14pt;
            }}
            .metadata {{
                display: flex;
                flex-wrap: wrap;
                margin-bottom: 20px;
                background-color: #f8fafc;
                padding: 10px;
                border: 1px solid #cbd5e1;
            }}
            .metadata div {{
                width: 50%;
                margin-bottom: 5px;
            }}
            .section-title {{
                border-bottom: 1px solid #ccc;
                padding-bottom: 5px;
                color: #1e3a8a;
            }}
            .data-table {{
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
                font-size: 10pt;
            }}
            .data-table th, .data-table td {{
                border: 1px solid #94a3b8;
                padding: 8px;
                text-align: left;
            }}
            .data-table th {{
                background-color: #1e293b;
                color: white;
            }}
            .footer {{
                margin-top: 40px;
                font-size: 10pt;
                color: #444;
            }}
            .signature-block {{
                margin-top: 50px;
                text-align: right;
            }}
            .signature-block p {{
                margin: 0;
            }}
            .signature-line {{
                border-bottom: 1px solid #000;
                width: 250px;
                display: inline-block;
                margin-bottom: 5px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <!-- DoCA Logo Placeholder -->
            <div style="font-size: 24pt; color: #1e3a8a;"><strong>GOVERNMENT OF INDIA</strong></div>
            <p style="margin:0;">DEPARTMENT OF CONSUMER AFFAIRS<br/>LEGAL METROLOGY ENFORCEMENT DIVISION</p>
            <h2>STATUTORY PACKAGING INSPECTION REPORT & NOTICE (FORM VI)</h2>
        </div>

        <div class="metadata">
            <div><strong>Inspection ID:</strong> {inspection_id}</div>
            <div><strong>Date of Scan:</strong> {date_str}</div>
            <div><strong>Commodity:</strong> {str(inspection_data.get("product_name", "Packaged Commodity"))}</div>
            <div><strong>Status:</strong> {str(inspection_data.get("compliance_status", "NON_COMPLIANT"))}</div>
            <div><strong>Enforcing State:</strong> {str(inspection_data.get("state", "National Capital Territory of Delhi"))}</div>
            <div><strong>Officer:</strong> {officer_name}</div>
        </div>

        {image_html}

        <h3 class="section-title">Extracted Package Data</h3>
        {fields_html}

        <h3 class="section-title">Statutory Violations Detected</h3>
        {violations_html}

        <div class="footer">
            <p><strong>Citations:</strong> This computer-generated statutory inspection notice is issued under Section 15 of the Legal Metrology Act, 2009. Violations observed pertain to the Legal Metrology (Packaged Commodities) Rules, 2011.</p>
        </div>

        <div class="signature-block">
            <div class="signature-line"></div>
            <p><strong>{officer_name}</strong></p>
            <p>Authorized Legal Metrology Officer</p>
        </div>
    </body>
    </html>
    """
    return html_content


def generate_compliance_pdf(inspection_data: Dict[str, Any]) -> bytes:
    """
    Generates an official Government of India DoCA Inspection Report in PDF format using WeasyPrint.
    Falls back to synthetic PDF if WeasyPrint is not installed.
    """
    html_str = _generate_html_report(inspection_data)
    
    try:
        from weasyprint import HTML
        pdf_bytes = HTML(string=html_str).write_pdf()
        return pdf_bytes
    except ImportError:
        # Generate clean synthetic PDF header fallback
        pdf_content = f"""%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >> endobj
4 0 obj << /Length 200 >> stream
BT
/F1 16 Tf
50 720 Td
(DEPARTMENT OF CONSUMER AFFAIRS - LEGAL METROLOGY REPORT) Tj
/F1 12 Tf
50 680 Td
(Inspection ID: {inspection_data.get('id', 'N/A')}) Tj
50 650 Td
(Status: {inspection_data.get('compliance_status', 'NON_COMPLIANT')}) Tj
50 620 Td
(WEASYPRINT NOT INSTALLED - STUB PDF) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000010 00000 n
0000000060 00000 n
0000000115 00000 n
0000000210 00000 n
trailer << /Root 1 0 R /Size 5 >>
startxref
450
%%EOF"""
        return pdf_content.encode("latin-1")


def generate_compliance_docx(inspection_data: Dict[str, Any]) -> bytes:
    """
    Generates an editable Microsoft Word (.docx) inspection report.
    """
    buffer = io.BytesIO()
    try:
        from docx import Document
        from docx.shared import Pt, Inches

        doc = Document()
        doc.add_heading("GOVERNMENT OF INDIA", level=1)
        doc.add_heading("DEPARTMENT OF CONSUMER AFFAIRS", level=2)
        doc.add_heading("STATUTORY PACKAGING INSPECTION REPORT & NOTICE (FORM VI)", level=3)
        
        inspection_id = str(inspection_data.get('id', 'N/A'))
        date_str = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')
        officer_name = str(inspection_data.get("officer_email", "Authorized Legal Metrology Officer"))
        
        doc.add_paragraph(f"Inspection ID: {inspection_id}")
        doc.add_paragraph(f"Date: {date_str}")
        doc.add_paragraph(f"Compliance Status: {inspection_data.get('compliance_status', 'NON_COMPLIANT')}")
        doc.add_paragraph(f"Officer: {officer_name}")
        
        fields = inspection_data.get("extracted_fields", [])
        if fields:
            doc.add_heading("Extracted Package Data", level=3)
            table = doc.add_table(rows=1, cols=3)
            table.style = 'Table Grid'
            hdr_cells = table.rows[0].cells
            hdr_cells[0].text = 'Field Name'
            hdr_cells[1].text = 'Value'
            hdr_cells[2].text = 'Confidence'
            
            for f in fields:
                row_cells = table.add_row().cells
                row_cells[0].text = f.get('field_name', '')
                row_cells[1].text = str(f.get('value', ''))
                row_cells[2].text = f"{f.get('confidence', 0.0):.1%}"

        violations = inspection_data.get("violations", [])
        doc.add_heading("Statutory Violations Detected", level=3)
        if violations:
            for v in sorted(violations, key=lambda x: x.get("severity", "")):
                doc.add_paragraph(
                    f"• [{v.get('severity')}] {v.get('rule_clause')} - {v.get('field')}: {v.get('message')}\n  Expected: {v.get('expected')}"
                )
        else:
            doc.add_paragraph("No statutory violations detected. Package complies with LMPC Rules, 2011.")
            
        doc.add_heading("Citations", level=3)
        doc.add_paragraph("This computer-generated statutory inspection notice is issued under Section 15 of the Legal Metrology Act, 2009. Violations observed pertain to the Legal Metrology (Packaged Commodities) Rules, 2011.")
        
        doc.add_paragraph("\n\n___________________________")
        doc.add_paragraph(f"{officer_name}")
        doc.add_paragraph("Authorized Legal Metrology Officer")

        doc.save(buffer)
        buffer.seek(0)
        return buffer.getvalue()
    except ImportError:
        # Fallback binary text representation of Word XML
        doc_text = f"Department of Consumer Affairs - Legal Metrology Compliance Notice\nInspection ID: {inspection_data.get('id')}\nCompliance: {inspection_data.get('compliance_status')}\n[STUB DOCX - python-docx NOT INSTALLED]"
        return doc_text.encode("utf-8")
