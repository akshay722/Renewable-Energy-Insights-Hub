import time
import pymysql
import sys

host = "db"
port = 3306
user = "root"
password = "Qywter@123"
database = "renewable_energy_db_sql"

retries = 10
while retries > 0:
    try:
        print("Trying to connect to MySQL...")
        conn = pymysql.connect(
            host=host,
            user=user,
            password=password,
            database=database,
            port=port,
            connect_timeout=5
        )
        conn.close()
        print("✅ MySQL is available.")
        sys.exit(0)
    except pymysql.err.OperationalError as e:
        print(f"❌ MySQL not ready yet: {e}")
        retries -= 1
        time.sleep(3)

print("🔥 Could not connect to MySQL after several retries.")
sys.exit(1)
