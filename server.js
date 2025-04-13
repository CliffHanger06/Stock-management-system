const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();
const PORT = 8000;

app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root", // set your MySQL password
    database: "stock_app"
});

db.connect(err => {
    if (err) throw err;
    console.log("MySQL connected!");
});

// Get all portfolio stocks
app.get("/api/portfolio", (req, res) => {
    db.query("SELECT stock_name, quantity, price FROM portfolio", (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// Add a new stock
app.post("/api/portfolio", (req, res) => {
    const { stockName, quantity, price } = req.body;
    const sql = "INSERT INTO portfolio (stock_name, quantity, price) VALUES (?, ?, ?)";
    db.query(sql, [stockName, quantity, price], (err) => {
        if (err) return res.status(500).send(err);
        res.sendStatus(200);
    });
});
app.post("/api/contact", (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: "All fields are required." });
    }

    const sql = "INSERT INTO contact (name, email, message) VALUES (?, ?, ?)";
    db.query(sql, [name, email, message], (err, result) => {
        if (err) {
            console.error("Error saving contact message:", err);
            return res.status(500).json({ error: "Database error." });
        }
        res.status(201).json({ message: "Message saved successfully!" });
    });
});

app.delete("/api/portfolio", (req, res) => {
    const { stockName } = req.body;

    if (!stockName) {
        return res.status(400).json({ error: "Stock name is required" });
    }

    // MySQL query to remove the stock
    const query = "DELETE FROM portfolio WHERE stock_name = ?";
    db.query(query, [stockName], (err, result) => {
        if (err) {
            console.error("Error deleting stock:", err);
            return res.status(500).json({ error: "Failed to remove stock" });
        }
        if (result.affectedRows > 0) {
            res.status(200).json({ message: "Stock removed successfully" });
        } else {
            res.status(404).json({ message: "Stock not found" });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
