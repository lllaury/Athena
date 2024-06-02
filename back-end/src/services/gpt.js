const axios = require("axios");

const GPT_API_URL = "https://api.openai.com/v1/chat/completions";
const GPT_API_KEY = process.env.GPT_API_KEY;

async function takePrompt(prompt) {
    try {
        const response = await axios.post(
            GPT_API_URL,
            {
                messages: [{ role: "system", content: prompt }],
                model: "gpt-4",
            },
            {
                headers: { Authorization: `Bearer ${GPT_API_KEY}` },
            }
        );
        return response.data.choices[0].message.content;
    } catch (error) {
        throw new Error(
            "Error calling GPT API: " +
                (error.response ? error.response.data : error)
        );
    }
}

async function generateTaskData(title, details, dueDate, course_id, weight) {
    const prompt = `Generate a JSON response with a breakdown of tasks into easy-to-manage subtasks and an estimated completion time for the assignment titled "${title}" with details "${details}" and due date "${dueDate}". The estimated_completion_time is in hours. The JSON should have the following format: { "title": "", "sub_tasks": [ { "description": "" } ], "estimated_completion_time": 0, "due_date": "${dueDate}" }`;
    const gptResponse = await takePrompt(prompt);

    try {
        const taskData = JSON.parse(gptResponse);
        taskData.status = "to-do";
        // taskData.time_spent = 0;
        // taskData.finish_date = null;
        taskData.description = details;
        taskData.course_id = course_id;
        taskData.weight = weight;

        // Ensure each sub_task has a status of "to-do"
        if (Array.isArray(taskData.sub_tasks)) {
            taskData.sub_tasks = taskData.sub_tasks.map((subTask) => ({
                ...subTask,
                status: "to-do",
            }));
        }

        return taskData;
    } catch (error) {
        throw new Error("Error parsing GPT response: " + error);
    }
}

module.exports = { takePrompt, generateTaskData };
