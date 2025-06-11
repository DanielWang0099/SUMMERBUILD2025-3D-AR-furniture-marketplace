require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const app = express();
const port = process.env.PORT || 3001; // Fixed default port 3001

app.use(express.json()); // Middleware to parse JSON request bodies

// Basic route
app.get('/', (req, res) => {
  res.send('PlaceIt Backend is running!');
});

// You would add your Supabase integration here
// const { createClient } = require('@supabase/supabase-js');
// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseKey = process.env.SUPABASE_KEY;
// const supabase = createClient(supabaseUrl, supabaseKey);

app.listen(port, () => {
  console.log(`PlaceIt Backend listening on port ${port}`);
});