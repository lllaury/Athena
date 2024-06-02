const express = require('express');
const router = express.Router();
const gptController = require('../controllers/gptController')

router.post('/', gptController.getGPTResponse);

// I need a route for generating assignments for the import assignments functionality
// It needs to get assignments
// Each assignment must be fed to GPT
// GPT analyzes the assignment and generates a sub-task list
// It also generates an estimated time to completion based on some userStats
// UserStats for prioritization should be located in the database
// Those stats should only be recalculated on assignment completion
/**
 * The return data should be formatted like:
 * {
 *  assignment-title: "some title",
 *  sub-tasks: ["Some sub-task", "another sub-task"],
 *  estimated-completion-time: 123;
 * }
 */
// Maybe another field for when you should get started on a certain task
// But I feel like that could be handled by an algorithm in the front-end as well

module.exports = router;