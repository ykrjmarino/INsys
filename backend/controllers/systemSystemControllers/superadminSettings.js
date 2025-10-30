import { db } from "../../db.js";

//delete data older than 7 months, keeps structure safe
export const deleteOldData  = async (req, res) => {
  try {
    // 1. Clear old logs
    await db.query(`
      DELETE FROM system_logs
      WHERE created_at < NOW() - INTERVAL '7 months';
    `);

    // 2. Clear old draft/test exams (and cascades linked data)
    await db.query(`
      DELETE FROM examinations
      WHERE created_at < NOW() - INTERVAL '7 months'
      AND status = 'completed';
    `);

    res.status(200).json({ message: "Old data (7+ months) cleared successfully." });
  } catch (err) {
    console.error("Maintenance cleanup failed:", err);
    res.status(500).json({ error: "Failed to delete old data." });
  }
};


//delete all data from key tables, keeps structure safe
export const deleteAllData = async (req, res) => {
  try {
    // 1. Truncate key tables (order matters if CASCADE not used)
    await db.query(`
      TRUNCATE TABLE 
        system_logs,
        examinations
      RESTART IDENTITY CASCADE;
    `);

    res.status(200).json({ message: "All data cleared successfully." });
  } catch (err) {
    console.error("Full data wipe failed:", err);
    res.status(500).json({ error: "Failed to clear all data." });
  }
};