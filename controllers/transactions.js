import { query } from "../utils/query.js";
import { dateValue, uuid } from "../utils/tools.cjs";

export const addTransactions = async (req, res) => {
  const { type, amount, description, idCategory, idBank } = req.body;
  try {
    if (!type || !idCategory || !amount || !idBank) {
      return res.status(400).json({
        status: 400,
        message: "Bad Request: Missing required fields",
      });
    }

    if (type === "expense" && amount > 0) {
      await query(`UPDATE bank SET amount = amount - ? WHERE id = ?`, [
        amount,
        idBank,
      ]);
    } else if (type === "income" && amount > 0) {
      await query(`UPDATE bank SET amount = amount + ? WHERE id = ?`, [
        amount,
        idBank,
      ]);
    }

    await query(
      `INSERT INTO transactions
        (id, type, amount, date, description, id_category, id_bank) VALUES 
        (?, ?, ?, ?, ?, ?, ?)`,
      [uuid(), type, amount, dateValue(), description, idCategory, idBank]
    );

    return res
      .status(200)
      .json({ status: 200, message: "Successfully Add Transaction! 🎉" });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const getTransactions = async (req, res) => {
  const { idBank } = req.params;

  try {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const startDate = new Date(currentYear, currentMonth - 1, 28);
    const endDate = new Date(currentYear, currentMonth, 28);

    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    let transactions;
    if (idBank && idBank !== "all") {
      transactions = await query(
        `SELECT t.*, c.name as category, c.icons as icon, b.name as bank_name 
         FROM transactions t 
         LEFT JOIN bank b ON t.id_bank = b.id 
         LEFT JOIN category c ON t.id_category = c.id
         WHERE t.id_bank = ? 
         AND t.date >= ? 
         AND t.date <= ?
         ORDER BY t.date DESC`,
        [idBank, startDateStr, endDateStr]
      );
    } else {
      transactions = await query(
        `SELECT t.*, c.name as category, c.icons as icon, b.name as bank_name 
         FROM transactions t 
         LEFT JOIN bank b ON t.id_bank = b.id 
         LEFT JOIN category c ON t.id_category = c.id
         WHERE t.date >= ? 
         AND t.date <= ?
         ORDER BY t.date DESC`,
        [startDateStr, endDateStr]
      );
    }

    let bankBalance = 0;
    if (idBank && idBank !== "all") {
      const bankData = await query(`SELECT amount FROM bank WHERE id = ?`, [
        idBank,
      ]);
      if (bankData.length > 0) {
        bankBalance = parseFloat(bankData[0].amount);
      }
    } else {
      const allBanks = await query(`SELECT SUM(amount) as total FROM bank`);
      if (allBanks.length > 0 && allBanks[0].total !== null) {
        bankBalance = parseFloat(allBanks[0].total);
      }
    }

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryExpenses = {};

    transactions.forEach((transaction) => {
      const amount = parseFloat(transaction.amount);

      if (transaction.type === "income") {
        totalIncome += amount;
      } else if (transaction.type === "expense") {
        totalExpense += amount;

        const category = transaction.category;
        const icon = transaction.icon;

        if (categoryExpenses[category]) {
          categoryExpenses[category].amount += amount;
        } else {
          categoryExpenses[category] = {
            amount: amount,
            icon: icon,
          };
        }
      }
    });

    const expensesByCategory = Object.entries(categoryExpenses).map(
      ([category, data]) => ({
        category,
        amount: parseFloat(data.amount.toFixed(2)),
        icon: data.icon,
      })
    );

    return res.status(200).json({
      status: 200,
      message: "Successfully retrieved transactions",
      data: {
        period: {
          startDate: startDateStr,
          endDate: endDateStr,
        },
        summary: {
          totalBalance: parseFloat(bankBalance.toFixed(2)),
          totalIncome: parseFloat(totalIncome.toFixed(2)),
          totalExpense: parseFloat(totalExpense.toFixed(2)),
        },
        expensesByCategory,
        transactions: transactions.map((t) => ({
          id: t.id,
          type: t.type,
          category: t.category,
          icon: t.icon,
          amount: parseFloat(t.amount),
          date: t.date,
          description: t.description,
          bankName: t.bank_name,
        })),
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: err.message,
    });
  }
};
