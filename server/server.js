const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const db = new sqlite3.Database('database.db', (err) => {
    if (err) {
        console.error('Could not open database', err);
        new_db = false;
    } else {
        console.log('Connected to SQLite database.');
    }
});

app.use(cors());
app.use(bodyParser.json());

app.post('/rooms', (req, res) => {
    const { name } = req.body;
    db.run('INSERT INTO Room (name) VALUES (?)', [name], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});



// 테이블 생성
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS Room (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT                    
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS Chat (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            time TEXT NOT NULL,
            message TEXT NOT NULL,
            sequence INTEGER NOT NULL,
            is_answer INTEGER NOT NULL DEFAULT 0 CHECK(is_answer IN (0, 1)),
            room_id INTEGER NOT NULL,            
            FOREIGN KEY (room_id) REFERENCES Room(id) ON DELETE CASCADE 
        );
    `);
});

// --- Room 테이블 CRUD ---

// Room 생성 (POST)
app.post('/rooms', (req, res) => {
    const { name } = req.body;
    db.run('INSERT INTO Room (name) VALUES (?)', [name], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

// Room 조회 (GET)
app.get('/rooms', (req, res) => {
    db.all('SELECT * FROM Room', [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Room 업데이트 (PUT)
app.put('/rooms/:id', (req, res) => {
    const { name } = req.body;
    const { id } = req.params;
    db.run('UPDATE Room SET name = ? WHERE id = ?', [name, id], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ updatedID: id });
    });
});

// Room 삭제 (DELETE)
app.delete('/rooms/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM Room WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ deletedID: id });
    });
});

// --- Chat 테이블 CRUD ---

// Chat 생성 (POST)
app.post('/chats', (req, res) => {
    const { time, message, sequence, is_answer, room_id } = req.body;
    db.run(`
        INSERT INTO Chat (time, message, sequence, is_answer, room_id) 
        VALUES (?, ?, ?, ?, ?)`,
        [time, message, sequence, is_answer, room_id], function (err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.json({ id: this.lastID });
        }
    );
});

// 특정 Room에 속한 Chat 조회 (GET)
app.get('/rooms/:room_id/chats', (req, res) => {
    const { room_id } = req.params;
    db.all('SELECT * FROM Chat WHERE room_id = ?', [room_id], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Chat 업데이트 (PUT)
app.put('/chats/:id', (req, res) => {
    const { time, message, sequence, is_answer } = req.body;
    const { id } = req.params;
    db.run(`
        UPDATE Chat SET time = ?, message = ?, sequence = ?, is_answer = ? 
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
app.delete('/chats/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM Chat WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ deletedID: id });
    });
});

app.listen(4000, () => {
    console.log('Server is running on port 4000');
});