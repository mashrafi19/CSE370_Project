# Fumble

Fumble is a dating-app-style platform for startup matchmaking. Connect with potential co-founders to build startups together, or find your dream role at exciting new companies.

## Features

### For Co-Founders
- **Swipe to Match**: Browse through potential co-founder profiles and swipe right to connect
- **Equal Admin Privileges**: All matched co-founders have equal control over startup pages
- **Startup Creation**: Form and manage your startup page once matched (up to 5 co-founders)
- **Expand Your Team**: Existing co-founders can swipe to invite additional co-founders (max 5 total)
- **Find Talent**: Swipe through job seekers to find the perfect team members

### For Job Seekers
- **Swipe for Startups**: Browse available positions at newly formed startups
- **Group Chat**: Communicate with all co-founders in a unified chat space
- **Discover Opportunities**: Find early-stage companies that match your skills and interests

## How It Works

1. **Sign Up**: Create an account as either a Co-Founder or Job Seeker
2. **Complete Your Profile**: Add your skills, experience, and what you're looking for
3. **Start Swiping**: 
   - Co-Founders swipe to find other co-founders
   - Job Seekers swipe through available startup positions
4. **Match & Connect**: When both parties swipe right, a match is created
5. **Chat & Collaborate**: Use the built-in messaging to discuss opportunities
6. **Form Your Startup** (Co-Founders): Create your company page with your initial co-founder(s)
7. **Grow Your Team** (Co-Founders): Swipe to invite additional co-founders (maximum 5 total)
8. **Start Hiring** (Co-Founders): Once your founding team is complete, swipe to find job seekers

## Tech Stack

- **Backend**: FastAPI (Python)
- **Frontend**: Vite + React + shadcn/ui
- **Database**: See `Normalized_Schema_Fumble.drawio.png` and `ER_EER_Diagram_project.drawio.png` for schema design

## Database Schema

Refer to the ER and EER diagrams included in this repository for the complete database schema design.

## Getting Started

*[Installation and setup instructions to be added]*

## Database Seeding

The project includes a seeding script to populate the database with test data.

### Basic Usage

```bash
cd server
python seed.py
```

This will create:
- 10 users
- 5 companies
- 10 jobs

All users will have the password: `password123`

### Custom Options

```bash
# Seed specific numbers
python seed.py --users 5 --companies 3 --jobs 5

# Use custom password for all users
python seed.py --password "yourpassword"

# Force seed without confirmation
python seed.py --users 5 --companies 5 --force

# Bulk seed (150 users, 75 companies, 150 jobs)
python seed.py --bulk

# Initialize tables before seeding
python seed.py --init --users 5 --companies 5
```

### Available Options

- `--users N`: Number of users to seed (default: 10)
- `--companies N`: Number of companies to seed (default: 5)
- `--jobs N`: Number of jobs to seed (default: 10)
- `--password PASSWORD`: Set a custom password for all seeded users (default: password123)
- `--force`: Skip confirmation prompt
- `--init`: Initialize database tables before seeding
- `--bulk`: Seed large dataset (150 users, 75 companies, 150 jobs)
- `--update-passwords`: Update all existing users with the same password

## Contributing

*[Contributing guidelines to be added]*

## License

*[License information to be added]*
