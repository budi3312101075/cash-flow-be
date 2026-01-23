import { query } from "../utils/query.js";

export const category = async (req, res) => {
  try {
    const data = await query(`SELECT id, name FROM category`);

    return res.status(200).json({
      status: 200,
      message: "Successfully Add Transaction! 🎉",
      data: data,
    });
  } catch {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: err.message,
    });
  }
};
