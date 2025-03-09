import express from 'express';
import fetch from 'node-fetch'; // Only needed for Node.js < 18

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/verify-license', async (req, res) => {
  try {
    const { license_key } = req.body;
    if (!license_key) {
      return res.status(400).json({ success: false, message: "License key is required" });
    }

    const requestBody = new URLSearchParams();
    requestBody.append('product_id', process.env.PRODUCT_ID);
    requestBody.append('license_key', license_key);
    requestBody.append('increment_uses_count', 'true'); // Ensure it's a string

    const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      body: requestBody,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const data = await response.json();

    if (data.purchase?.test) {
      return res.json({ success: true, message: 'Skipping verification for test purchase' });
    }

    const verificationLimit = Number(process.env.VERIFICATION_LIMIT) || 5;
    if (data.uses >= verificationLimit + 1) {
      return res.status(403).json({ success: false, message: 'Verification limit exceeded' });
    }

    if (!data.success) {
      return res.status(400).json({ success: false, message: data.message });
    }

    res.json({ success: true, data });

  } catch (error) {
    console.error('Error verifying license:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Root route to check if the server is running
app.get('/', (req, res) => {
  res.send('Server is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
