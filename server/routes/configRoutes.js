const express = require('express');
const { db, TABLE_CHAT, TABLE_ROOM, TABLE_CONFIG } = require('../db/database');

const router = express.Router();
// API 키 조회 (GET)
router.get('/', (req, res) => {
    db.all(`SELECT * FROM ${TABLE_CONFIG} ORDER BY id DESC`, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(rows);
    });
});

// API 키 생성 (POST)
router.post('/', (req, res) => {
    const { openai_api_key } = req.body;
    if (!openai_api_key) {
        return res.status(400).json({ error: 'openai_api_key is required' });
    }

    db.run(`INSERT INTO ${TABLE_CONFIG} (openai_api_key) VALUES (?)`, [openai_api_key], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, openai_api_key });
    });
});

// API 키 업데이트 (PUT)
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { openai_api_key } = req.body;

    if (!openai_api_key) {
        return res.status(400).json({ error: 'openai_api_key is required' });
    }

    db.run(
        `UPDATE ${TABLE_CONFIG} SET openai_api_key = ? WHERE id = ?`,
        [openai_api_key, id],
        function (err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Record not found' });
            }
            res.json({ message: 'API key updated successfully', id });
        }
    );
});

// API 키 삭제 (DELETE)
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    db.run(`DELETE FROM ${TABLE_CONFIG} WHERE id = ?`, [id], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Record not found' });
        }
        res.json({ message: 'API key deleted successfully', id });
    });
});

module.exports = router;