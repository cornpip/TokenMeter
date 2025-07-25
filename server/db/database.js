const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.resolve(__dirname, '../database.db'), (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the database.');

        // 외래 키 기능/제약 활성화  
        db.run('PRAGMA foreign_keys = ON;', (err) => {
            if (err) {
                console.error("Error enabling foreign keys:", err.message);
            } else {
                console.log("Foreign keys are enabled.");
            }
        });
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

    // 외래키 제약 사항 안먹음
    db.run(`
        CREATE TABLE IF NOT EXISTS ${TABLE_CHAT} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            time TEXT NOT NULL,
            message TEXT NOT NULL,
            sequence INTEGER NOT NULL,
            is_answer INTEGER NOT NULL DEFAULT 0 CHECK(is_answer IN (0, 1)),
            room_id INTEGER NOT NULL,            
            msg_history TEXT,
            token_meter_prompt INTEGER,
            token_meter_completion INTEGER,
            token_meter_total INTEGER,
            used_model TEXT,
            FOREIGN KEY (room_id) REFERENCES ${TABLE_ROOM}(id) ON DELETE CASCADE 
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS ${TABLE_CONFIG} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            openai_api_key TEXT,
            selected_model TEXT,
            max_message INTEGER,
            system_message TEXT
        );
    `, (err) => {
        if (err) {
            return;
        }

        const default_instructions = [
            "When providing an answer that includes code, always put the code inside a Markdown code block using triple backticks (```) and include the appropriate language identifier (e.g., ```python, ```javascript). Any explanations or other text should be written outside of the code block. If your answer does not include code, just write your response as usual.",
        ];
        const jsonString = JSON.stringify(default_instructions);
        const insert_default_sql = `INSERT INTO ${TABLE_CONFIG} (openai_api_key, selected_model, max_message, system_message) VALUES (NULL, 'gpt-4.1', 5, '${jsonString}');`;

        // 테이블이 생성된 경우에만 삽입
        const get_all_sql = `SELECT * FROM ${TABLE_CONFIG}`;
        db.all(get_all_sql, (err, rows) => {
            if (err) {
                console.error('Error checking rows', err);
                return;
            }

            if (rows.length == 0) {
                db.run(insert_default_sql, (err) => {
                    if (err) {
                        console.error('Error inserting data:', err);
                    } else {
                        console.log('Empty row inserted');
                    }
                });
            } else {
                console.log('default row exists, no row inserted.');
            }
        });
    });
});

module.exports = {
    db,
    TABLE_ROOM, TABLE_CHAT, TABLE_CONFIG
};