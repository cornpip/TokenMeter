const express = require('express');
const { db, TABLE_CHAT, TABLE_ROOM, TABLE_CONFIG } = require('../db/database');

const addBeforeCheck = (key, value, updates, values) => {
    if (value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
    }
}

const router = express.Router();
// Chat 생성 (POST)
router.post('/', (req, res) => {
    const {
        time,
        message,
        sequence,
        is_answer,
        room_id,
        msg_history,
        used_model,
        token_meter_prompt,
        token_meter_completion,
        token_meter_total
    } = req.body;

    db.run(`
        INSERT INTO ${TABLE_CHAT} (time, message, sequence, is_answer, room_id, msg_history, used_model, token_meter_prompt, token_meter_completion, token_meter_total) 
        VALUES (${"?, ".repeat(9)} ?)`,
        [time, message, sequence, is_answer, room_id, msg_history, used_model, token_meter_prompt, token_meter_completion, token_meter_total], function (err) {
            if (err) {
                console.log(err);
                return res.status(400).json({ error: err.message });
            }
            res.json({ id: this.lastID });
        }
    );
});

// Chat 업데이트 (PUT)
router.put('/:id', (req, res) => {
    const {
        time,
        message,
        sequence,
        is_answer,
        room_id,
        msg_history,
        used_model,
        token_meter_prompt,
        token_meter_completion,
        token_meter_total
    } = req.body;
    const { id } = req.params;

    const updates = [];
    const values = [];
    const fieldsWithValues = [
        ["time", time],
        ["message", message],
        ["sequence", sequence],
        ["is_answer", is_answer],
        ["room_id", room_id],
        ["msg_history", msg_history],
        ["used_model", used_model],
        ["token_meter_prompt", token_meter_prompt],
        ["token_meter_completion", token_meter_completion],
        ["token_meter_total", token_meter_total],
    ];

    fieldsWithValues.forEach(([field, value]) => {
        addBeforeCheck(field, value, updates, values);
    });

    if (updates.length === 0) {
        return res.json({ message: 'updated successfully', id: id });
    }
    values.push(id);
    const sql = `UPDATE ${TABLE_CHAT} SET ${updates.join(', ')} WHERE id = ?`;

    db.run(sql, values, function (err) {
        if (err) {
            console.log(err);
            return res.status(400).json({ error: err.message });
        }
        res.json({ message: 'updated successfully', id: id });
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

// 특정 Room에 속한 Chat 조회 (GET)
router.get('/room/:room_id', (req, res) => {
    const { room_id } = req.params;
    db.all(`SELECT * FROM ${TABLE_CHAT} WHERE room_id = ?`, [room_id], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(rows);
    });
});

module.exports = router;