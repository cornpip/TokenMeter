const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.resolve(__dirname, '../database.db'), (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the database.');
    }
});

const TABLE_ROOM = `room`;
const TABLE_CHAT = `chat`;
const TABLE_CONFIG = `config`;

// 테이블 생성
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS ${TABLE_ROOM} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT                    
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS ${TABLE_CHAT} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            time TEXT NOT NULL,
            message TEXT NOT NULL,
            sequence INTEGER NOT NULL,
            is_answer INTEGER NOT NULL DEFAULT 0 CHECK(is_answer IN (0, 1)),
            room_id INTEGER NOT NULL,            
            FOREIGN KEY (room_id) REFERENCES ${TABLE_ROOM}(id) ON DELETE CASCADE 
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS ${TABLE_CONFIG} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            openai_api_key TEXT
        );
    `);
});

module.exports = {
    db,
    TABLE_ROOM, TABLE_CHAT, TABLE_CONFIG
};