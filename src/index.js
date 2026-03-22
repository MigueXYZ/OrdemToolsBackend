const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ordem_biblioteca')
  .then(() => console.log('✓ MongoDB connected'))
  .catch(err => console.log('✗ MongoDB error:', err));

const abilityRoutes = require('./routes/abilities');
const ritualRoutes = require('./routes/rituals');
const ruleRoutes = require('./routes/rules');
const searchRoutes = require('./routes/search');
const itemRoutes = require('./routes/items');
const classRoutes = require('./routes/classes');
const trackRoutes = require('./routes/tracks');
const weaponRoutes = require('./routes/weapons');
const authRoutes = require('./routes/auth');
const threatRoutes = require('./routes/threats');
const characterRoutes = require('./routes/characters');
const originRoutes = require('./routes/origins');

app.use('/api/abilities', abilityRoutes);
app.use('/api/rituals', ritualRoutes);
app.use('/api/rules', ruleRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/weapons', weaponRoutes);
app.use('/api/threats', threatRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/origins', originRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Ordem Biblioteca API' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT} (accessible from network)`);
});
