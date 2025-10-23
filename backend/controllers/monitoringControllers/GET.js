import {db} from '../../db.js';

export const getSessionId = async(req, res) =>{ 
  const userId = req.user.userId;
  try {
    const result = await db.query("SELECT * FROM examinations WHERE user_id = $1", [userId])
    res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error cant GET violations', error)
  }
} 