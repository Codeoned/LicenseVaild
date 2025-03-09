'node-fetch';  // Required for Node.js < 18

(async () => {
  try {
    const requestBody = new URLSearchParams();
    requestBody.append('product_id', process.env.PRODUCT_ID);
    requestBody.append('license_key', process.env.LICENSE_KEY);
    requestBody.append('increment_uses_count', 'true'); // Ensure it's a string

    const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      body: requestBody,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' } // Required header
    });

    const data = await response.json();

    if (data.purchase?.test) {
      console.log('Skipping verification for test purchase');
      return;
    }

    const verificationLimit = Number(process.env.VERIFICATION_LIMIT) || 5; // Default limit if not set
    if (data.uses >= verificationLimit + 1) {
      throw new Error('Verification limit exceeded');
    }

    if (!data.success) {
      throw new Error(data.message);
    }

    console.log('License verified successfully:', data);
  } catch (error) {
    if (error?.response?.status === 404) {
      console.log('License key doesn\'t exist');
      return;
    }

    console.error('Verifying license key failed', error);
  }
})();