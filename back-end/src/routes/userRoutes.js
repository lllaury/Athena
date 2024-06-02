const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { setUser, getTasks, updateUser, deleteUser } = require('../controllers/userController');
const prisma = new PrismaClient();

router.get('/tasks', getTasks);

// Read RequestExamples.txt for how to use
router.post('/set-user', setUser);

router.post('/update-user', updateUser);

router.post('/delete-user', deleteUser);

module.exports = router;
