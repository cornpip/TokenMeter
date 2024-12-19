const express = require('express');
const { db, TABLE_CHAT, TABLE_ROOM, TABLE_CONFIG } = require('../db/database');

const router = express.Router();
// Chat 생성 (POST)
router.post('/', (req, res) => {
    const { time, message, sequence, is_answer, room_id } = req.body;
    db.run(`
        INSERT INTO ${TABLE_CHAT} (time, message, sequence, is_answer, room_id) 
        VALUES (?, ?, ?, ?, ?)`,
        [time, message, sequence, is_answer, room_id], function (err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.json({ id: this.lastID });
        }
    );
});

// Chat 업데이트 (PUT)
router.put('/:id', (req, res) => {
    const { time, message, sequence, is_answer } = req.body;
    const { id } = req.params;
    db.run(`
        UPDATE ${TABLE_CHAT} SET time = ?, message = ?, sequence = ?, is_answer = ? 
        WHERE id = ?`,
        [time, message, sequence, is_answer, id], function (err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.json({ updatedID: id });
        }
    );
});

// Chat 삭제 (DELETE)
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM ${TABLE_CHAT} WHERE id = ?`, [id], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ deletedID: id });
    });
});

module.exports = router;