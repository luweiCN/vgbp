# Database Setup Scripts

This directory contains SQL scripts for setting up the Vainglory BP Assistant database.

## Usage

1. **Schema Setup**: Run `supabase-schema.sql` first to create all database tables
2. **RLS Policies**: Run `supabase-rls.sql` after schema to enable row level security

## Files

- `supabase-schema.sql` - Database table definitions
- `supabase-rls.sql` - Row Level Security policies