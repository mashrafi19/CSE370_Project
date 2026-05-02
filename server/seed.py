#!/usr/bin/env python3
"""
CLI command to seed random data into the database.
Usage: python seed.py [options]
"""

import random
import json
import argparse
from datetime import datetime
from database import create_tables, get_db, User, Company, Job
from auth import get_password_hash


def seed_users(count: int = 10, password: str = "password123"):
    """Seed random users into the database"""
    first_names = [
        "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Quinn", "Avery",
        "Peyton", "Dakota", "Reese", "Rowan", "Sawyer", "Hayden", "Emerson", "Finley",
        "Jessica", "Michael", "Sarah", "David", "Emily", "James", "Emma", "Daniel",
        "Olivia", "William", "Sophia", "Benjamin", "Isabella", "Lucas"
    ]
    
    last_names = [
        "Chen", "Park", "Kim", "Singh", "Patel", "Gupta", "Kumar", "Shah",
        "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
        "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson"
    ]
    
    roles = [
        "Software Engineer", "Product Manager", "Designer", "Data Scientist",
        "Business Developer", "Marketing Lead", "CTO", "CEO", "Founder",
        "Technical Lead", "Full-stack Developer", "UX Researcher", "Looking for Cofounder"
    ]
    
    locations = [
        "San Francisco, CA", "New York, NY", "Los Angeles, CA", "Seattle, WA",
        "Austin, TX", "Boston, MA", "Chicago, IL", "Denver, CO", "Remote",
        "Miami, FL", "Portland, OR", "Atlanta, GA", "Toronto, ON", "London, UK"
    ]
    
    skills_pool = [
        "React", "Node.js", "Python", "TypeScript", "AWS", "Docker", "Kubernetes",
        "Machine Learning", "Data Analysis", "Product Strategy", "UI/UX", "Figma",
        "PostgreSQL", "MongoDB", "GraphQL", "REST API", "Go", "Rust", "Swift",
        "Mobile Development", "iOS", "Android", "Flutter", "Blockchain", "AI/ML"
    ]
    
    db = next(get_db())
    created_users = []
    
    for i in range(count):
        first_name = random.choice(first_names)
        last_name = random.choice(last_names)
        full_name = f"{first_name} {last_name}"
        email = f"{first_name.lower()}.{last_name.lower()}{random.randint(1, 999)}@example.com"
        
        # Select random skills (3-6 skills per user)
        num_skills = random.randint(3, 6)
        user_skills = random.sample(skills_pool, num_skills)
        
        user = User(
            email=email,
            hashed_password=get_password_hash(password),
            full_name=full_name,
            bio=f"Experienced professional with expertise in {', '.join(user_skills[:3])}. Looking to build something great!",
            location=random.choice(locations),
            role=random.choice(roles),
            skills=json.dumps(user_skills),
            achievements=json.dumps([f"Achievement {j}" for j in range(random.randint(1, 4))]),
        )
        
        db.add(user)
        created_users.append(user)
        print(f"  Created user: {full_name} ({email})")
    
    db.commit()
    print(f"\n✅ Seeded {count} users successfully")
    return created_users


def seed_companies(count: int = 5, users: list = None):
    """Seed random companies into the database, returns list of company IDs"""
    company_names = [
        "TechStart", "DataFlow", "CloudNine", "AI Innovations", "GreenTech Solutions",
        "NextGen Labs", "Quantum Leap", "Synergy Systems", "Future Foundry", "Digital Forge",
        "CodeCraft", "ByteBuilders", "Pixel Perfect", "Innovate Inc", "Spark Studios"
    ]
    
    industries = [
        "SaaS", "AI/ML", "Fintech", "Health Tech", "EdTech", "CleanTech",
        "E-commerce", "Gaming", "Cybersecurity", "IoT", "Blockchain", "AgriTech"
    ]
    
    stages = ["Pre-seed", "Seed", "Series A", "Series B", "Series C", "Growth"]
    
    locations = [
        "San Francisco, CA", "New York, NY", "Los Angeles, CA", "Seattle, WA",
        "Austin, TX", "Boston, MA", "Chicago, IL", "Denver, CO", "Remote",
        "Miami, FL", "Portland, OR", "Atlanta, GA"
    ]
    
    db = next(get_db())
    created_company_ids = []
    
    # If no users provided, get some from database
    if not users:
        users = db.query(User).limit(count * 2).all()
    
    if len(users) < count:
        print("⚠️  Not enough users to assign as founders. Creating more users first...")
        users = seed_users(count * 2)
    
    for i in range(count):
        name = f"{random.choice(company_names)} {random.choice(['Inc', 'Labs', 'Co', 'Tech', 'AI'])}"
        industry = random.choice(industries)
        stage = random.choice(stages)
        
        company = Company(
            name=name,
            tagline=f"Revolutionary {industry} platform for the future",
            description=f"We are building the next generation of {industry.lower()} solutions. "
                       f"Our {stage.lower()} stage startup is looking for talented individuals to join our mission.",
            website=f"https://{name.lower().replace(' ', '').replace('.', '')}.com",
            location=random.choice(locations),
            industry=industry,
            stage=stage,
            founded_year=str(random.randint(2019, 2024)),
            size=random.choice(["1-10", "11-50", "51-200"]),
            funding_amount=random.choice(["$100K", "$500K", "$1M", "$5M", "$10M", "$20M"]),
            funding_round=stage,
        )
        
        db.add(company)
        db.flush()  # Flush to get the company ID
        
        # Assign 1-3 random founders
        num_founders = random.randint(1, min(3, len(users)))
        founders = random.sample(users, num_founders)
        company.founders = founders
        
        created_company_ids.append(company.id)
        print(f"  Created company: {name} (Founders: {', '.join([f.full_name for f in founders])})")
    
    db.commit()
    print(f"\n✅ Seeded {count} companies successfully")
    return created_company_ids


def seed_jobs(count: int = 10, company_ids: list = None):
    """Seed random job listings into the database"""
    job_titles = [
        "Software Engineer", "Frontend Developer", "Backend Developer", "Full-stack Developer",
        "Product Manager", "UI/UX Designer", "Data Scientist", "DevOps Engineer",
        "Mobile Developer", "Machine Learning Engineer", "Technical Lead", "CTO",
        "Growth Marketer", "Sales Lead", "Customer Success Manager"
    ]
    
    departments = ["Engineering", "Product", "Design", "Data", "Sales", "Marketing", "Operations"]
    job_types = ["Full-time", "Part-time", "Contract", "Internship"]
    locations = ["Remote", "Hybrid", "On-site"]
    
    requirements_pool = [
        "3+ years of experience",
        "Strong problem-solving skills",
        "Experience with React/Vue/Angular",
        "Python or JavaScript proficiency",
        "Bachelor's degree in CS or related field",
        "Excellent communication skills",
        "Experience with cloud platforms (AWS/GCP/Azure)",
        "Knowledge of SQL and NoSQL databases",
        "Agile development experience",
        "Startup experience preferred",
        "Passion for innovation",
        "Team player mentality"
    ]
    
    db = next(get_db())
    
    # If no company IDs provided, get some from database
    if not company_ids:
        companies = db.query(Company).limit(count).all()
        company_ids = [c.id for c in companies]
    
    if len(company_ids) == 0:
        print("⚠️  No companies found. Creating companies first...")
        company_ids = seed_companies(5)
    
    # Get company objects from database
    companies = db.query(Company).filter(Company.id.in_(company_ids)).all()
    company_map = {c.id: c for c in companies}
    
    for i in range(count):
        company_id = random.choice(company_ids)
        company = company_map[company_id]
        
        # Select random requirements (3-5 per job)
        num_requirements = random.randint(3, 5)
        job_requirements = random.sample(requirements_pool, num_requirements)
        
        job = Job(
            company_id=company_id,
            title=random.choice(job_titles),
            department=random.choice(departments),
            type=random.choice(job_types),
            location=random.choice(locations),
            description=f"Join {company.name} as a key member of our team! "
                       f"We're looking for talented individuals who are passionate about {company.industry.lower()}. "
                       f"You'll work on challenging problems and help shape the future of our product.",
            requirements=json.dumps(job_requirements),
            salary_range=random.choice(["$50K-$80K", "$80K-$120K", "$120K-$160K", "$160K-$200K", "Competitive"]),
            status="open",
        )
        
        db.add(job)
        print(f"  Created job: {job.title} at {company.name}")
    
    db.commit()
    print(f"\n✅ Seeded {count} jobs successfully")


def update_all_users_password(password: str = "password123"):
    """Update all existing users to have the same password"""
    db = next(get_db())
    users = db.query(User).all()
    hashed_password = get_password_hash(password)
    
    for user in users:
        user.hashed_password = hashed_password
    
    db.commit()
    print(f"\n🔐 Updated {len(users)} existing users with password: {password}")


def main():
    parser = argparse.ArgumentParser(
        description="Seed random data into the Fumble database",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python seed.py                    # Seed default amounts (10 users, 5 companies, 10 jobs)
  python seed.py --users 20         # Seed 20 users only
  python seed.py --all --force      # Force seed all data types
  python seed.py --companies 3 --jobs 5  # Seed 3 companies and 5 jobs
  python seed.py --bulk             # Seed 150 users, 75 companies, 150 jobs
  python seed.py --update-passwords --password "mypassword"  # Update all users to same password
        """
    )
    
    parser.add_argument(
        "--users",
        type=int,
        default=10,
        help="Number of users to seed (default: 10)"
    )
    parser.add_argument(
        "--companies",
        type=int,
        default=5,
        help="Number of companies to seed (default: 5)"
    )
    parser.add_argument(
        "--jobs",
        type=int,
        default=10,
        help="Number of jobs to seed (default: 10)"
    )
    parser.add_argument(
        "--bulk",
        action="store_true",
        help="Seed bulk data (150 users, 75 companies, 150 jobs)"
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Seed all data types"
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Skip confirmation prompt"
    )
    parser.add_argument(
        "--init",
        action="store_true",
        help="Initialize database tables before seeding"
    )
    parser.add_argument(
        "--password",
        type=str,
        default="password123",
        help="Password for all users (default: password123)"
    )
    parser.add_argument(
        "--update-passwords",
        action="store_true",
        help="Update all existing users to use the same password"
    )
    
    args = parser.parse_args()
    
    # Handle bulk flag
    if args.bulk:
        args.users = 150
        args.companies = 75
        args.jobs = 150
    
    # Initialize tables if requested
    if args.init:
        print("🗄️  Initializing database tables...")
        create_tables()
        print("✅ Database tables created\n")
    
    # Confirmation prompt
    if not args.force:
        print(f"This will seed the database with:")
        print(f"  - {args.users} users")
        print(f"  - {args.companies} companies")
        print(f"  - {args.jobs} jobs")
        response = input("\nProceed? [y/N]: ").strip().lower()
        if response not in ['y', 'yes']:
            print("❌ Seeding cancelled")
            return
    
    print("\n🌱 Starting database seeding...\n")
    
    try:
        # Update existing user passwords if requested
        if args.update_passwords:
            update_all_users_password(args.password)
        
        # Seed users first
        users = seed_users(args.users, args.password)
        print()
        
        # Seed companies
        company_ids = seed_companies(args.companies, users)
        print()
        
        # Seed jobs
        seed_jobs(args.jobs, company_ids)
        
        print("\n🎉 Database seeding completed successfully!")
        print(f"\nSummary:")
        print(f"  ✅ {args.users} users created")
        print(f"  ✅ {args.companies} companies created")
        print(f"  ✅ {args.jobs} jobs created")
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
