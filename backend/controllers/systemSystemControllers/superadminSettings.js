import { db } from "../../db.js";
import { logAction } from "../../utils/logAction.js";

//delete data older than 7 months, keeps structure safe
export const deleteOldData  = async (req, res) => { //update lang pala
  console.log("deleteOldData reached");

  try {
    // 1. Clear old logs
    const result = await db.query(`
      UPDATE system_logs
      SET is_archived = true
      WHERE created_at < NOW() - INTERVAL '7 months';
    `);
    
    await logAction(req.user.userId, `Archived ${result.rowCount} system logs older than 7 months`);

    console.log(result.rowCount, "rows archived");

    // 2. Clear old draft/test exams (and cascades linked data)
    // await db.query(`
    //   UPDATE examinations
    //   SET is_archived = true
    //   WHERE created_at < NOW() - INTERVAL '7 months'
    //   AND status = 'completed';
    // `);

    res.status(200).json({ message: `System logs archived successfully. Rows affected: ${result.rowCount}` });
  } catch (err) {
    console.error("Maintenance cleanup failed:", err);
    res.status(500).json({ error: "Failed to delete old data." });
  }
};


//delete all data from key tables, keeps structure safe
export const deleteAllData = async (req, res) => {
  console.log("deleteAllData reached");

  try {
    const logsResult = await db.query(`
      UPDATE system_logs
      SET is_archived = true
      WHERE is_archived = false
        AND target_id IS NOT NULL;
    `);

    const examsResult = await db.query(`
      UPDATE examinations
      SET is_archived = true
      WHERE is_archived = false;
    `);

    // 1. Truncate key tables (order matters if CASCADE not used)
    // await db.query(`
    //   TRUNCATE TABLE 
    //     system_logs,
    //     examinations
    //   RESTART IDENTITY CASCADE;
    // `);
    const rowTotal = logsResult.rowCount + examsResult.rowCount;

    await logAction(req.user.userId, `All system data archived successfully. Rows affected: ${rowTotal}`);

    res.status(200).json({ message: `All data archived successfully. Rows affected - System Logs: ${logsResult.rowCount}, Examinations: ${examsResult.rowCount}` });
  } catch (err) {
    console.error("Full data archived failed:", err);
    res.status(500).json({ error: "Failed to archived all data." });
  }
};