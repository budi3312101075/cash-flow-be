import { query } from "../utils/query.js";

export const summary = async (req, res) => {
  const { dateIn, dateOut, bank } = req.body;
  try {
    const data = await query(``);
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: err.message,
    });
  }
};
