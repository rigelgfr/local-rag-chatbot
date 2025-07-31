-- Create the schema for your app if it doesn't exist
CREATE SCHEMA IF NOT EXISTS app;

-- Enable extension (just once per DB)
CREATE EXTENSION IF NOT EXISTS app.vector;

-- Set the search path to the 'app' schema
ALTER ROLE postgres SET search_path TO app, public;
