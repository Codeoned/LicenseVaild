const express = require('express');
const fetch = require('node-fetch'); // Required for Node.js < 18
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json()); // Middleware for JSON requests

app.post('/verify', async (req, res) => {
  try {
    const requestBody = new URLSearchParams();
    requestBody.append('product_id', process.env.PRODUCT_ID);
    requestBody.append('license_key', process.env.LICENSE_KEY);
    requestBody.append('increment_uses_count', 'true'); // Ensure it's a string

    const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      body: requestBody,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const data = await response.json();

    if (data.purchase?.test) {
      return res.status(200).json({ success: false, message: 'Skipping verification for test purchase' });
    }

    const verificationLimit = Number(process.env.VERIFICATION_LIMIT) || 5; // Default limit
    if (data.uses >= verificationLimit + 1) {
      return res.status(403).json({ success: false, message: 'Verification limit exceeded' });
    }

    if (!data.success) {
      return res.status(400).json({ success: false, message: data.message });
    }

    return res.status(200).json({ success: true, message: 'License verified successfully', data });
  } catch (error) {
    console.error('Verifying license key failed', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Root route to check if the server is running
app.get('/', (req, res) => {
  res.send('Gumroad License Verification API is running!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
