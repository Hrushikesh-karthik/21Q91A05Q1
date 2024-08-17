const express = require('express');
const fetch = require('node-fetch'); // Make sure node-fetch is installed
const app = express();
const port = 9876;

// Configure the window size
const windowSize = 10;
let numberWindow = []; // To keep track of numbers

app.use(express.json()); // Middleware to parse JSON requests

app.get('/numbers/:id', async (req, res) => {
    const id = req.params.id;

    if (!['p', 'f', 'e', 'r'].includes(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
    }

    try {
        const response = await fetch(`https://third-party-api.com/numbers/${id}`, {
            headers: {
                // Uncomment and replace with actual token if needed
                // 'Authorization': 'Bearer YOUR_API_KEY'
            }
        });

        const contentType = response.headers.get('content-type');

        if (!response.ok) {
            console.error(`API request failed with status ${response.status}`);
            const errorBody = await response.text();
            console.error(`Response body: ${errorBody}`);
            return res.status(500).json({ error: `Third-party API request failed with status ${response.status}`, details: errorBody });
        }

        if (!contentType || !contentType.includes('application/json')) {
            const errorBody = await response.text();
            console.error(`Invalid response format: ${errorBody}`);
            return res.status(500).json({ error: 'Invalid data format from API', details: errorBody });
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
        res.status(500).json({ error: 'Something went wrong', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
