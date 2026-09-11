import asyncio
import uuid
import datetime
import bcrypt
# Monkeypatch bcrypt to fix passlib compatibility with bcrypt >= 4.0
if not hasattr(bcrypt, '__about__'):
    bcrypt.__about__ = type('about', (object,), {'__version__': bcrypt.__version__})

from sqlalchemy import select, text
from backend.app.core.database import AsyncSessionLocal
from backend.app.models.base import User, Product, Inspection, ExtractedField, Violation

def get_raw_password_hash(password: str) -> str:
    import bcrypt
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

async def seed_data():
    async with AsyncSessionLocal() as session:
        # Check if users already exist
        admin_query = await session.execute(select(User).where(User.email == "admin@doca.gov.in"))
        if admin_query.scalar_one_or_none() is not None:
            print("Database already seeded. Skipping.")
            return

        print("Seeding database...")
        
        # 1. Create Users
        admin_user = User(
            email="admin@doca.gov.in",
            hashed_password=get_raw_password_hash("Admin@123"),
            role="ADMIN",
            state="Central",
            full_name="System Admin"
        )
        officer_user = User(
            email="officer@doca.gov.in",
            hashed_password=get_raw_password_hash("Officer@123"),
            role="STATE_OFFICER",
            state="Delhi",
            full_name="Delhi State Officer"
        )
        session.add_all([admin_user, officer_user])
        await session.commit()
        await session.refresh(admin_user)
        await session.refresh(officer_user)

        # 2. Create Products
        products_data = [
            {"name": "Amul Butter", "brand": "Amul", "category": "Dairy", "barcode": "8901262150117", "manufacturer": "Gujarat Cooperative Milk Marketing Federation Ltd.", "weight": "500g"},
            {"name": "Tata Salt", "brand": "Tata", "category": "Groceries", "barcode": "8904043901015", "manufacturer": "Tata Consumer Products Ltd.", "weight": "1kg"},
            {"name": "Maggi 2-Minute Noodles", "brand": "Nestle", "category": "Packaged Food", "barcode": "8901058814510", "manufacturer": "Nestle India Ltd.", "weight": "70g"},
            {"name": "Dove Intense Repair Shampoo", "brand": "Dove", "category": "Personal Care", "barcode": "8901030704944", "manufacturer": "Hindustan Unilever Ltd.", "weight": "340ml"},
            {"name": "Parle-G Original", "brand": "Parle", "category": "Snacks", "barcode": "8901719100062", "manufacturer": "Parle Products Pvt. Ltd.", "weight": "800g"},
            {"name": "Borges Extra Virgin Olive Oil", "brand": "Borges", "category": "Oils", "barcode": "8410179011116", "manufacturer": "Borges Agricultural & Industrial Edible Oils", "weight": "500ml"},
            {"name": "Kissan Tomato Ketchup", "brand": "Kissan", "category": "Condiments", "barcode": "8901030018591", "manufacturer": "Hindustan Unilever Ltd.", "weight": "950g"},
            {"name": "Haldiram's Bhujia", "brand": "Haldiram's", "category": "Snacks", "barcode": "8904004400035", "manufacturer": "Haldiram Snacks Pvt. Ltd.", "weight": "400g"},
            {"name": "Tropicana 100% Orange Juice", "brand": "Tropicana", "category": "Beverages", "barcode": "8902080300109", "manufacturer": "PepsiCo India Holdings Pvt. Ltd.", "weight": "1L"},
            {"name": "Surf Excel Matic", "brand": "Surf Excel", "category": "Home Care", "barcode": "8901030012345", "manufacturer": "Hindustan Unilever Ltd.", "weight": "2kg"},
            {"name": "Colgate Total", "brand": "Colgate", "category": "Personal Care", "barcode": "8901314012345", "manufacturer": "Colgate-Palmolive (India) Ltd.", "weight": "120g"},
            {"name": "Aashirvaad Whole Wheat Atta", "brand": "Aashirvaad", "category": "Groceries", "barcode": "8901725000015", "manufacturer": "ITC Ltd.", "weight": "5kg"},
            {"name": "Dabur Honey", "brand": "Dabur", "category": "Groceries", "barcode": "8901207000012", "manufacturer": "Dabur India Ltd.", "weight": "250g"},
            {"name": "Lipton Green Tea", "brand": "Lipton", "category": "Beverages", "barcode": "8901030000010", "manufacturer": "Hindustan Unilever Ltd.", "weight": "100g"},
            {"name": "Saffola Gold", "brand": "Saffola", "category": "Oils", "barcode": "8901088000011", "manufacturer": "Marico Ltd.", "weight": "1L"},
            {"name": "Britannia Good Day", "brand": "Britannia", "category": "Snacks", "barcode": "8901063000010", "manufacturer": "Britannia Industries Ltd.", "weight": "200g"},
            {"name": "Bru Instant Coffee", "brand": "Bru", "category": "Beverages", "barcode": "8901030001111", "manufacturer": "Hindustan Unilever Ltd.", "weight": "100g"},
            {"name": "Pears Pure & Gentle Soap", "brand": "Pears", "category": "Personal Care", "barcode": "8901030002222", "manufacturer": "Hindustan Unilever Ltd.", "weight": "125g"},
            {"name": "Himalaya Purifying Neem Face Wash", "brand": "Himalaya", "category": "Personal Care", "barcode": "8901138500013", "manufacturer": "Himalaya Wellness Company", "weight": "150ml"},
            {"name": "Red Label Natural Care", "brand": "Brooke Bond", "category": "Beverages", "barcode": "8901030003333", "manufacturer": "Hindustan Unilever Ltd.", "weight": "250g"}
        ]
        
        products = []
        for p_data in products_data:
            product = Product(
                name=f"{p_data['name']} {p_data['weight']}",
                brand=p_data['brand'],
                category=p_data['category'],
                barcode=p_data['barcode'],
                manufacturer=p_data['manufacturer'],
                created_by=admin_user.id
            )
            products.append(product)
        
        session.add_all(products)
        await session.commit()
        for p in products:
            await session.refresh(p)

        # 3. Create sample images and inspections
        images = [
            "https://images.openfoodfacts.org/images/products/890/105/881/4510/front_en.3.400.jpg",
            "https://images.openfoodfacts.org/images/products/890/404/390/1015/front_en.11.400.jpg",
            "https://images.openfoodfacts.org/images/products/890/126/215/0117/front_en.21.400.jpg"
        ]

        inspections = []
        violations = []
        extracted_fields = []
        
        import random
        
        for i in range(30):
            product = products[i % len(products)]
            image_url = images[i % len(images)]
            
            # Fetch next sequence
            seq_result = await session.execute(text("SELECT nextval('inspection_seq')"))
            seq_val = seq_result.scalar()
            year = datetime.datetime.now().year
            inspection_code = f"INS-{year}-{seq_val:04d}"
            
            status = random.choice(["COMPLETED", "COMPLETED", "COMPLETED", "PENDING", "PROCESSING"])
            compliance_status = random.choice(["COMPLIANT", "NON_COMPLIANT", "NON_COMPLIANT"]) if status == "COMPLETED" else "PENDING"
            overall_severity = "CRITICAL" if compliance_status == "NON_COMPLIANT" and random.random() > 0.5 else ("MAJOR" if compliance_status == "NON_COMPLIANT" else None)
            
            scanned_at = datetime.datetime.now() - datetime.timedelta(days=random.randint(0, 30), hours=random.randint(0, 24))
            completed_at = scanned_at + datetime.timedelta(minutes=random.randint(1, 10)) if status == "COMPLETED" else None
            
            inspection = Inspection(
                inspection_code=inspection_code,
                product_id=product.id,
                image_url=image_url,
                status=status,
                compliance_status=compliance_status,
                scanned_at=scanned_at,
                completed_at=completed_at,
                officer_id=officer_user.id,
                overall_severity=overall_severity,
                state="Delhi"
            )
            session.add(inspection)
            await session.commit()
            await session.refresh(inspection)
            inspections.append(inspection)
            
            if status == "COMPLETED":
                # Add Extracted Fields
                fields_to_add = [
                    {"name": "MRP", "val": f"Rs {random.randint(50, 500)}.00", "rule_min": 4.0},
                    {"name": "Net Quantity", "val": product.name.split()[-1], "rule_min": 6.5},
                    {"name": "Manufacturer", "val": product.manufacturer, "rule_min": 2.0},
                    {"name": "Date of Manufacture", "val": (scanned_at - datetime.timedelta(days=random.randint(30, 300))).strftime("%m/%Y"), "rule_min": 4.0}
                ]
                
                for f in fields_to_add:
                    font_mm = f["rule_min"] + (random.uniform(-1.0, 2.0) if compliance_status == "NON_COMPLIANT" else random.uniform(0.5, 2.0))
                    ex_f = ExtractedField(
                        inspection_id=inspection.id,
                        field_name=f["name"],
                        value=f["val"],
                        bbox_json={"x": random.randint(10, 100), "y": random.randint(10, 100), "w": random.randint(100, 300), "h": random.randint(20, 50)},
                        confidence=random.uniform(0.75, 0.99),
                        font_mm=max(1.0, round(font_mm, 1)),
                        rule_min_mm=f["rule_min"]
                    )
                    extracted_fields.append(ex_f)
                
                # Add Violations if NON_COMPLIANT
                if compliance_status == "NON_COMPLIANT":
                    num_violations = random.randint(1, 3)
                    for v_idx in range(num_violations):
                        clauses = [
                            {"clause": "Rule 6(1)(a)", "field": "Manufacturer", "msg": "Manufacturer address is missing or not readable.", "expected": "Readable manufacturer details.", "actual": "Missing"},
                            {"clause": "Rule 6(1)(b)", "field": "Net Quantity", "msg": "Net quantity is not printed in standard units.", "expected": "Standard metric unit.", "actual": "Non-standard unit"},
                            {"clause": "Rule 6(1)(c)", "field": "Date of Manufacture", "msg": "Date of Manufacture is not visible.", "expected": "Visible MM/YYYY.", "actual": "Not found"},
                            {"clause": "Rule 6(1)(d)", "field": "MRP", "msg": "MRP is missing or obscured.", "expected": "Clear MRP including taxes.", "actual": "Obscured"},
                            {"clause": "Rule 6(1)(e)", "field": "Customer Care", "msg": "Customer care details are incomplete.", "expected": "Phone, email and address.", "actual": "Email missing"},
                            {"clause": "Rule 8", "field": "Net Quantity Font", "msg": f"Font size for Net Quantity is smaller than prescribed.", "expected": "6.5mm", "actual": f"{round(random.uniform(2.0, 5.0), 1)}mm"},
                            {"clause": "Rule 18", "field": "Principal Display Panel", "msg": "Declarations are not grouped together.", "expected": "Grouped declarations.", "actual": "Scattered"},
                        ]
                        v_data = random.choice(clauses)
                        violation = Violation(
                            inspection_id=inspection.id,
                            rule_clause=v_data["clause"],
                            field=v_data["field"],
                            severity=overall_severity if v_idx == 0 else random.choice(["MAJOR", "MINOR"]),
                            message=v_data["msg"],
                            expected=v_data["expected"],
                            actual=v_data["actual"]
                        )
                        violations.append(violation)
        
        session.add_all(extracted_fields)
        session.add_all(violations)
        await session.commit()
        
        print(f"Database seeded successfully with {len(products)} products, {len(inspections)} inspections, and {len(violations)} violations.")

if __name__ == "__main__":
    asyncio.run(seed_data())
