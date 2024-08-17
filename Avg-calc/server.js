const express = require('express');
const fetch = require('node-fetch');

const app = express();
const port = 9876;
const windowSize = 10;
let numberWindow = [];

// Root route handler
app.get('/', (req, res) => {
    res.send('API is running. Use /numbers/:id to get data.');
});

// API endpoint for numbers
app.get('/numbers/:id', async (req, res) => {
    const id = req.params.id;

    if (!['p', 'f', 'e', 'r'].includes(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
    }

    try {
        const response = await fetch(`https://third-party-api.com/numbers/${id}`);
        if (!response.ok) {
            console.error(`API request failed with status ${response.status}`);
            return res.status(500).json({ error: 'Third-party API request failed' });
        }

        const data = await response.json();
        console.log('Fetched data:', data);

        if (!Array.isArray(data.numbers)) {
            return res.status(500).json({ error: 'Invalid data format' });
        }

        numberWindow.push(...data.numbers);

        // Ensure unique numbers
        numberWindow = [...new Set(numberWindow)];

        // Manage window size
        if (numberWindow.length > windowSize) {
            numberWindow = numberWindow.slice(numberWindow.length - windowSize);
        }

        // Calculate average
        const avg = numberWindow.length ? (numberWindow.reduce((acc, val) => acc + val, 0) / numberWindow.length) : 0;

        // Prepare the response
        res.json({
            windowPrevState: numberWindow.slice(0, -data.numbers.length),
            windowCurState: numberWindow,
            numbers: data.numbers,
            avg: avg.toFixed(2)
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
