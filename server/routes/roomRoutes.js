const express = require('express');
const { db, TABLE_CHAT, TABLE_ROOM, TABLE_CONFIG } = require('../db/database');

const router = express.Router();
// Room 생성 (POST)
router.post('/', (req, res) => {
    const { name } = req.body;
    db.run(`INSERT INTO ${TABLE_ROOM} (name) VALUES (?)`, [name], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

// Room 조회 (GET)
router.get('/', (req, res) => {
    db.all(`SELECT * FROM ${TABLE_ROOM} ORDER BY id DESC`, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(rows);
    });
});

// 특정 Room 조회 (GET)  
router.get('/:roomId', (req, res) => {
    const roomId = req.params.roomId;
    const query = `SELECT * FROM ${TABLE_ROOM} WHERE id = ?`;

    db.get(query, [roomId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Room not found' });
        }
        res.json(row);
    });
});

// Room 업데이트 (PUT)
router.put('/:id', (req, res) => {
    const { name } = req.body;
    const { id } = req.params;
    db.run(`UPDATE ${TABLE_ROOM} SET name = ? WHERE id = ?`, [name, id], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ updatedID: id });
    });
});

// Room 삭제 (DELETE)
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM ${TABLE_ROOM} WHERE id = ?`, [id], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ deletedId: id });
    });
});

module.exports = router;
