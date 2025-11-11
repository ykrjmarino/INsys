import ExcelJS from "exceljs";
import {db} from '../../db.js';

export const exportExamScores = async(req, res) => { //per section
  const { examId, sectionId } = req.params;

  try {
    // 1️⃣ Fetch student analytics
    const studentInfo = await db.query(`
      SELECT 
        u.first_name,
        u.last_name,
        u.middle_initial,
        u.school_id AS student_school_id,
        ss.total_score AS score,
        ss.objective_score,
        ss.essay_score,
        ss.deduction,
        e.title AS exam_title,
        st.section_id,
        st.section_name
      FROM student_scores ss
      JOIN users u ON ss.student_school_id = u.school_id
      JOIN examinations e ON ss.exam_id = e.exam_id
      JOIN section_takers st 
        ON st.exam_id = ss.exam_id
        AND st.section_name = ss.section_name
      WHERE ss.exam_id = $1 AND st.section_id = $2
      ORDER BY u.last_name ASC, u.first_name ASC
    `, [examId, sectionId]);

    // 2️⃣ Determine exam title
    let examTitle = "Exam";
    if (studentInfo.rows.length > 0) {
      examTitle = studentInfo.rows[0].exam_title;
    } else {
      const examRes = await db.query(
        "SELECT title FROM examinations WHERE exam_id = $1",
        [examId]
      );
      if (examRes.rows[0]) examTitle = examRes.rows[0].title;
    }

    const fileName = `${examTitle}_scores.xlsx`;

    // 2️⃣ Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(examTitle);

    // 3️⃣ Define columns
    worksheet.columns = [
      { header: "Student ID", key: "student_school_id", width: 20 },
      { header: "Name", key: "student_name", width: 25 },
      { header: "Objective", key: "objective_score", width: 10 },
      { header: "Essay", key: "essay_score", width: 10 },
      { header: "Deductions", key: "deduction", width: 10 },
      { header: "TOTAL", key: "score", width: 10 },
    ];

    // Bold header row
    worksheet.getRow(1).font = { bold: true };

    // 4️⃣ Add rows
    studentInfo.rows.forEach((s) => {
      worksheet.addRow({
        student_school_id: s.student_school_id,
        student_name: `${s.last_name}, ${s.first_name} ${s.middle_initial}.`,
        objective_score: s.objective_score,
        essay_score: s.essay_score,
        deduction: s.deduction,
        score: s.score,
      });
    });

    // Auto-adjust column widths
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value ? cell.value.toString() : "";
        maxLength = Math.max(maxLength, cellValue.length);
      });
      column.width = maxLength < 10 ? 10 : maxLength + 2;
    });

    // 5️⃣ Set response headers for download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${fileName}.xlsx`
    );

    console.log("Filename sent to client:", fileName);

    // 6️⃣ Write workbook to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Error exporting scores:", error);
    res.status(500).send("Failed to export scores");
  }
};

export const exportUsers = async (req, res) => {
  const { role } = req.params; //orrr req.query
  console.log("Exporting users with role:", role);

  try {
    // 1️⃣ Fetch all users with that role
    const userInfo = await db.query(`
      SELECT 
        u.user_id,
        u.first_name,
        u.last_name,
        u.middle_initial,
        u.school_id,
        u.role,
        u.email
      FROM users u
      WHERE u.role = $1
      ORDER BY u.last_name ASC, u.first_name ASC
    `, [role]);

    // 2️⃣ Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(role || "Users");

    // 3️⃣ Define columns
    worksheet.columns = [
      { header: "User ID", key: "user_id", width: 10 },
      { header: "Name", key: "name", width: 25 },
      { header: "School ID", key: "school_id", width: 15 },
      { header: "Role", key: "role", width: 15 },
      { header: "Email", key: "email", width: 30 },
    ];

    // Bold header row
    worksheet.getRow(1).font = { bold: true };

    // 4️⃣ Add rows
    userInfo.rows.forEach((u) => {
      worksheet.addRow({
        user_id: u.user_id,
        name: `${u.last_name}, ${u.first_name} ${u.middle_initial || ""}.`,
        school_id: u.school_id,
        role: u.role,
        email: u.email,
      });
    });

    // 5️⃣ Auto-adjust column widths
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value ? cell.value.toString() : "";
        maxLength = Math.max(maxLength, cellValue.length);
      });
      column.width = maxLength < 10 ? 10 : maxLength + 2;
    });

    // 6️⃣ Set response headers for download
    const fileName = `${role || "users"}_list.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );

    // 7️⃣ Write workbook to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Error exporting users:", error);
    res.status(500).send("Failed to export users");
  }
};
