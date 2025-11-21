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

export const getAllUsers = async(req, res) => { //ALL no matter the archived accounts
  try {
    const result = await db.query(`
      SELECT role, COUNT(*) AS count
      FROM users
      GROUP BY role
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({message: 'No users found'})
    }

    const counts = {
      admin: 0,
      student: 0,
      superadmin: 0,
      all: 0
    };

    result.rows.forEach(row => {
      counts[row.role] = parseInt(row.count);
      counts.all += parseInt(row.count); //count all users
    });

   res.status(200).json(counts);
  } catch (error) {
    console.error('Error counting users by role', error)
    res.status(500).json({error: 'Failed to count users'});
  }
}

export const getAllActiveUsers = async(req, res) => { //ALL no matter the archived accounts
  try {
    const result = await db.query(`
      SELECT role, COUNT(*) AS count
      FROM users
      WHERE is_archived = false
      GROUP BY role
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({message: 'No active users found'})
    }

    const counts = {
      admin: 0,
      student: 0,
      superadmin: 0,
      all: 0
    };

    result.rows.forEach(row => {
      counts[row.role] = parseInt(row.count);
      counts.all += parseInt(row.count); //count all users
    });

   res.status(200).json(counts);
  } catch (error) {
    console.error('Error counting users by role', error)
    res.status(500).json({error: 'Failed to count users'});
  }
}