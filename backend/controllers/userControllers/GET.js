import {db} from '../../db.js'

export const getUserById = async(req, res) => {
  const {userId} = req.params;
  try {
    const result = await db.query('SELECT * FROM users WHERE user_id = $1', [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({message: 'User not found'})
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error cant GET user', error)
    res.status(500).json({error: 'Failed to GET user'});
  }
}