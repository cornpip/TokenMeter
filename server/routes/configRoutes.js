const express = require('express');
const { db, TABLE_CHAT, TABLE_ROOM, TABLE_CONFIG } = require('../db/database');

const router = express.Router();
// getAll
router.get('/all', (req, res) => {
    db.all(`SELECT * FROM ${TABLE_CONFIG} ORDER BY id DESC`, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(rows);
    });
});

// getById
router.get('/:config_id', (req, res) => {
    const { config_id } = req.params;
    db.run(`SELECT * FROM ${TABLE_CONFIG} WHERE id=? ORDER BY id DESC`, [config_id], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(rows);
    });
});

// 일단 getAll 조회 없을 때만 생성
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

// put
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { openai_api_key } = req.body;
    const { selected_model } = req.body;

    // 동적으로 업데이트할 컬럼과 값 구성
    const updates = [];
    const values = [];

    if (openai_api_key !== undefined) {
        updates.push('openai_api_key = ?');
        values.push(openai_api_key);
    }

    if (selected_model !== undefined) {
        updates.push('selected_model = ?');
        values.push(selected_model);
    }

    if (updates.length === 0) {
        return res.json({ message: 'API key updated successfully', id: id });
    }

    // ID를 바인딩 값으로 추가
    values.push(id);
    // 동적으로 SQL 쿼리 생성
    const sql = `UPDATE ${TABLE_CONFIG} SET ${updates.join(', ')} WHERE id = ?`;

    db.run(sql, values,
        function (err, row) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Record not found' });
            }
            res.json({ message: 'API key updated successfully', id: id });
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