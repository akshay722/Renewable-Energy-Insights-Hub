import os
import sys
import logging
from sqlalchemy.sql import text
from database import engine, SessionLocal, Base
from models.user import User
from models.energy_data import EnergyConsumption, EnergyGeneration
from datetime import datetime, timedelta
import random
from werkzeug.security import generate_password_hash

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_users():
    """Seed demo users to the database"""
    logger.info("Seeding users...")
    
    db = SessionLocal()
    try:
        # Check if users already exist
        if db.query(User).count() > 0:
            logger.info("Users already exist, skipping seeding.")
            return
        
        # Create demo user
        demo_user = User(
            email="demo@example.com",
            username="demo",
            hashed_password=generate_password_hash("password123"),
            is_active=True
        )
        
        # Create additional test users
        test_user = User(
            email="test@example.com",
            username="test",
            hashed_password=generate_password_hash("password123"),
            is_active=True
        )
        
        admin_user = User(
            email="admin@example.com",
            username="admin",
            hashed_password=generate_password_hash("admin123"),
            is_active=True,
            is_admin=True
        )
        
        db.add_all([demo_user, test_user, admin_user])
        db.commit()
        logger.info(f"Added {3} users")
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding users: {e}")
    finally:
        db.close()

def seed_energy_data():
    """Seed energy consumption and generation data"""
    logger.info("Seeding energy data...")
    
    db = SessionLocal()
    try:
        # Check if data already exists
        if db.query(EnergyConsumption).count() > 0 or db.query(EnergyGeneration).count() > 0:
            logger.info("Energy data already exists, skipping seeding.")
            return
        
        # Get demo user
        demo_user = db.query(User).filter_by(username="demo").first()
        if not demo_user:
            logger.error("Demo user not found. Please seed users first.")
            return
        
        # Create energy data for the last 30 days
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
        current_date = start_date
        
        consumption_data = []
        generation_data = []
        
        energy_sources = ['solar', 'wind', 'grid']
        
        while current_date <= end_date:
            # For each day, create hourly data
            for hour in range(24):
                timestamp = current_date.replace(hour=hour)
                
                # Consumption tends to be higher in morning and evening
                consumption_factor = 1.5 if 7 <= hour <= 9 or 18 <= hour <= 22 else 1.0
                # Generation is higher during daylight hours for solar
                solar_factor = 1.8 if 9 <= hour <= 16 else 0.5
                
                # For each energy source
                for source in energy_sources:
                    # Create consumption record
                    consumption_value = random.uniform(0.5, 2.5) * consumption_factor
                    consumption = EnergyConsumption(
                        user_id=demo_user.id,
                        timestamp=timestamp,
                        value_kwh=consumption_value,
                        source_type=source
                    )
                    consumption_data.append(consumption)
                    
                    # Create generation record (solar generates more during day)
                    source_factor = solar_factor if source == 'solar' else 1.0
                    generation_value = random.uniform(0.3, 2.0) * source_factor
                    generation = EnergyGeneration(
                        timestamp=timestamp,
                        value_kwh=generation_value,
                        source_type=source,
                        efficiency=random.uniform(0.7, 0.95)
                    )
                    generation_data.append(generation)
            
            current_date += timedelta(days=1)
        
        # Add to database in batches
        db.bulk_save_objects(consumption_data)
        db.bulk_save_objects(generation_data)
        db.commit()
        
        logger.info(f"Added {len(consumption_data)} consumption records")
        logger.info(f"Added {len(generation_data)} generation records")
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding energy data: {e}")
    finally:
        db.close()

def main():
    """Main seeding function"""
    logger.info("Starting database seeding...")
    try:
        # Create tables if they don't exist
        Base.metadata.create_all(bind=engine)
        
        # Seed data
        seed_users()
        seed_energy_data()
        
        logger.info("Database seeding completed successfully")
    except Exception as e:
        logger.error(f"Error during database seeding: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 