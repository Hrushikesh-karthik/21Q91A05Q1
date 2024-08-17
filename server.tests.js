const request = require('supertest');
const express = require('express');
const app = require('./server');  // Ensure your Express app is exported from server.js

describe('GET /numbers/:id', () => {
    it('should return the correct response for a valid ID', async () => {
        const res = await request(app).get('/numbers/e');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('windowCurState');
        expect(res.body).toHaveProperty('numbers');
        expect(res.body).toHaveProperty('avg');
    });

    it('should return 400 for an invalid ID', async () => {
        const res = await request(app).get('/numbers/invalid');
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error');
    });
});
