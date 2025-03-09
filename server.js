require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// ✅ Allow requests from Figma & Railway domain
const corsOptions = {
  origin: ["https://www.figma.com", "https://your-railway-app.up.railway.app"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type"
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ Ensure PORT is dynamically assigned by Railway
const PORT = process.env.PORT;
const GUMROAD_API_URL = 'https://api.gumroad.com/v2/licenses/verify';
const PRODUCT_ID = process.env.AjQGDMqfhFt5Himy1_J1zw==

app.post('/validate', async (req, res) => {
    const { license_key } = req.body;

    if (!license_key) {
        return res.status(400).json({ success: false, message: "License key is required" });
    }

    try {
        const response = await axios.post(GUMROAD_API_URL, {
            product_id: PRODUCT_ID,
            license_key: license_key
        });

        if (response.data.success) {
            res.json({ success: true, message: "License is valid!" });
        } else {
            res.status(401).json({ success: false, message: "Invalid license key" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Error verifying license key", error: error.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
