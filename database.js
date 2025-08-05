// database.js - Supabase PostgreSQL connection for AutomateAce
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // Required by Supabase for secure external connections
    },
});

// Test connection
async function testConnection() {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW(), current_database()');
        console.log('✅ Supabase Database connected successfully!');
        console.log('📅 Current time:', result.rows[0].now);
        console.log('🗄️ Connected to:', result.rows[0].current_database);
        client.release();
        return true;
    } catch (error) {
        console.error('❌ Supabase DB connection error:', error.message);
        return false;
    }
}

module.exports = { pool, testConnection };
