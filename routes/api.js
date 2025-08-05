// routes/api.js - API endpoints for AutomateAce
const express = require('express');
const router = express.Router();
const { pool } = require('../database');

// Submit Get Started form
router.post('/submit-inquiry', async (req, res) => {
    const { name, email, service, message, company } = req.body;
    
    // Validation
    if (!name || !email || !service) {
        return res.status(400).json({ 
            success: false, 
            error: 'Name, email, and service are required fields' 
        });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ 
            success: false, 
            error: 'Please enter a valid email address' 
        });
    }
    
    try {
        const client = await pool.connect();
        
        // Insert or update contact
        const contactResult = await client.query(`
            INSERT INTO contacts (name, email, company, updated_at) 
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
            ON CONFLICT (email) 
            DO UPDATE SET 
                name = EXCLUDED.name,
                company = EXCLUDED.company,
                updated_at = CURRENT_TIMESTAMP
            RETURNING id
        `, [name, email, company || null]);
        
        const contactId = contactResult.rows[0].id;
        
        // Insert service inquiry
        await client.query(`
            INSERT INTO service_inquiries (contact_id, service_type, message) 
            VALUES ($1, $2, $3)
        `, [contactId, service, message || '']);
        
        client.release();
        
        res.json({ 
            success: true, 
            message: 'Thank you! Your inquiry has been submitted successfully.' 
        });
        
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to submit inquiry. Please try again.' 
        });
    }
});

// Get portfolio projects for work page
router.get('/portfolio', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, title, description, video_url, outcomes, client_name, featured
            FROM portfolio_projects 
            WHERE featured = true 
            ORDER BY created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch portfolio' });
    }
});

// Get services for services page
router.get('/services', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, name, description, features, category
            FROM services 
            WHERE is_active = true 
            ORDER BY id
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

// Admin endpoint to view submissions
router.get('/submissions', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                c.name, 
                c.email, 
                c.company,
                s.service_type,
                s.message,
                s.created_at
            FROM contacts c
            LEFT JOIN service_inquiries s ON c.id = s.contact_id
            ORDER BY s.created_at DESC
            LIMIT 50
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
});

module.exports = router;
