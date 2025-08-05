// server.js - AutomateAce Express Server
const express = require('express');
const cors = require('cors');
const path = require('path');
const { testConnection } = require('./database');
const apiRoutes = require('./routes/api');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (your HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api', apiRoutes);

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/services', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'services.html'));
});

app.get('/work', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'workdone.html'));
});

// Admin page to view submissions
app.get('/admin', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>AutomateAce Admin</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; background: #000; color: #fff; }
                table { width: 100%; border-collapse: collapse; background: #111; }
                th, td { border: 1px solid #333; padding: 12px; text-align: left; }
                th { background-color: #FFEB3B; color: #000; }
                h1 { color: #FFEB3B; }
            </style>
        </head>
        <body>
            <h1>AutomateAce Form Submissions</h1>
            <div id="submissions">Loading...</div>
            <script>
                fetch('/api/submissions')
                    .then(res => res.json())
                    .then(data => {
                        let html = '<table><tr><th>Date</th><th>Name</th><th>Email</th><th>Company</th><th>Service</th><th>Message</th></tr>';
                        data.forEach(submission => {
                            html += \`<tr>
                                <td>\${new Date(submission.created_at).toLocaleDateString()}</td>
                                <td>\${submission.name}</td>
                                <td>\${submission.email}</td>
                                <td>\${submission.company || 'N/A'}</td>
                                <td>\${submission.service_type}</td>
                                <td>\${submission.message || 'None'}</td>
                            </tr>\`;
                        });
                        html += '</table>';
                        document.getElementById('submissions').innerHTML = html;
                    })
                    .catch(error => {
                        document.getElementById('submissions').innerHTML = 'Error loading submissions: ' + error;
                    });
            </script>
        </body>
        </html>
    `);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Page not found' });
});

// Start server
async function startServer() {
    // Test database connection first
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
        console.error('❌ Failed to connect to database. Server not started.');
        process.exit(1);
    }
    
    app.listen(PORT, () => {
        console.log(`🚀 AutomateAce server running on http://localhost:${PORT}`);
        console.log(`📊 Admin panel: http://localhost:${PORT}/admin`);
    });
}

startServer();
