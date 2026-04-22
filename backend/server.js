require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Connect to Database
connectDB();

// Register all Mongoose Schemas
require('./models/User');
require('./models/Report');
require('./models/VetClinic');
require('./models/Drive');
require('./models/Case');
require('./models/Adoption');

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/vet', require('./routes/vetRoutes'));

// Basic route for testing
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => { 
  console.log(`Server running on port ${PORT}`);
});
