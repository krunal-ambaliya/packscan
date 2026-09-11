import psycopg

DATABASE_URL = "postgresql://postgres.awciydiwxnwpalfvpdoa:[password]}@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres"

try:
    conn = psycopg.connect(DATABASE_URL)
    print("CONNECTED TO SUPABASE")

    cur = conn.cursor()

    # Test database
    cur.execute("SELECT NOW(), current_database(), current_user;")
    print("\nDatabase test:")
    print(cur.fetchone())

    # List tables
    cur.execute("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name;
    """)

    print("\nPublic tables:")
    for table in cur.fetchall():
        print(" -", table[0])

    cur.close()
    conn.close()

    print("\nSUPABASE POSTGRESQL CONNECTION: SUCCESS")

except Exception as e:
    print("\nSUPABASE CONNECTION FAILED")
    print(type(e).__name__ + ":", e)