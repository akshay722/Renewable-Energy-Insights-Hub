#\!/bin/bash
echo "Seeding database with sample energy data..."
cd "$(dirname "$0")"
python3 seed_database.py
echo "Done\!"
