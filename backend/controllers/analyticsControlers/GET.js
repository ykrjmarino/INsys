import {db} from '../../db.js';

export const getExamAnalytics = async(req, res) =>{
  const studentId = req.user.schoolId;
  const { examId } = req.params;

  try {
    //we'll use: title, start_datetime, end_datetime, total_points, passing_score, exam_type
    const result = await db.query(` 
      SELECT * FROM examinations
      WHERE exam_id = $1
        AND status = 'completed'`
    , [examId]);

    if (result.rows.length === 0) {
      return res.status(404).json({error: 'No Exam detail fetched'})
    }

    console.log(result.rows[0]);
    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('Error getting exam details:', error);
    res.status(500).json({ error: error.details || 'Failed to get exam detail' });
  }
} 
    