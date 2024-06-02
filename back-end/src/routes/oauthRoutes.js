const express = require('express');
const axios = require('axios');
const router = express.Router();

const canvasInstance = 'https://yourcanvasinstance.instructure.com';
const client_id = 'your_client_id';
const client_secret = 'your_client_secret';
const redirect_uri = 'http://localhost:5000/api/oauth/callback';

router.get('/login', (req, res) => {
  const authUrl = `${canvasInstance}/login/oauth2/auth?client_id=${client_id}&response_type=code&redirect_uri=${redirect_uri}`;
  res.redirect(authUrl);
});

router.get('/callback', async (req, res) => {
  const authorizationCode = req.query.code;
  const tokenUrl = `${canvasInstance}/login/oauth2/token`;

  try {
    const response = await axios.post(tokenUrl, {
      client_id,
      client_secret,
      code: authorizationCode,
      grant_type: 'authorization_code',
      redirect_uri
    });

    req.session.accessToken = response.data.access_token;
    res.redirect('/api/some_endpoint'); // Redirect to a page or API endpoint
  } catch (error) {
    console.error('Error exchanging authorization code for access token:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
