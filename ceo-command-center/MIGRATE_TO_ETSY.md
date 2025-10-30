# Database Migration to Etsy Schema

## What This Does

Replaces the CEO Command Center database schema with the Etsy Organizer schema.

**Removes:**
- Task, Project, Goal, Habit, HabitLog, EnergyLog, WeeklyReview, Meeting models

**Adds:**
- EtsyShop, Product, Order, OrderItem, StockAlert models

## Run This Migration in PowerShell

```powershell
cd C:\Users\pmeth\Projects\Scott-Davies\ceo-command-center

# Reset database (this will delete ALL data)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name etsy_organizer_schema

# Generate Prisma Client
npx prisma generate

# Push to production database
npx prisma db push
```

## ⚠️ Warning

This will **delete all existing data** including:
- Your test user account
- Sample tasks, projects, goals, habits

Since you have no real users, this is safe!

After migration, you'll need to:
1. Create a new test account
2. Connect an Etsy shop (once API is approved)
3. Sync products and orders

##Status

Ready to run!
