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

// 특정 Room에 속한 Chat 조회 (GET)
router.get('/:room_id/chats', (req, res) => {
    const { room_id } = req.params;
    db.all(`SELECT * FROM ${TABLE_CHAT} WHERE room_id = ?`, [room_id], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(rows);
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
        res.json({ deletedID: id });
    });
});

module.exports = router;
