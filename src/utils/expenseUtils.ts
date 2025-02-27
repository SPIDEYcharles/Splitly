import { Expense, User, ExpenseSummary } from '../types';

// Calculate how much each user owes or is owed
export function calculateBalances(expenses: Expense[], currentUserId: string): ExpenseSummary {
  let totalSpent = 0;
  let totalOwed = 0;
  let totalOwedToYou = 0;
  
  expenses.forEach(expense => {
    // If current user paid for this expense
    if (expense.paidBy === currentUserId) {
      totalSpent += expense.amount;
      
      // Calculate how much others owe the current user
      expense.participants.forEach(participant => {
        if (participant.userId !== currentUserId) {
          totalOwedToYou += participant.amount;
        }
      });
    } else {
      // Find how much the current user owes for this expense
      const userParticipation = expense.participants.find(
        p => p.userId === currentUserId
      );
      
      if (userParticipation) {
        totalOwed += userParticipation.amount;
      }
    }
  });
  
  const netBalance = totalOwedToYou - totalOwed;
  
  return {
    totalSpent,
    totalOwed,
    totalOwedToYou,
    netBalance
  };
}

// Calculate simplified debts (who owes whom)
export function calculateSimplifiedDebts(expenses: Expense[], users: User[]): {
  fromUser: User;
  toUser: User;
  amount: number;
}[] {
  // Create a map of user balances
  const balances = new Map<string, number>();
  
  // Initialize balances for all users
  users.forEach(user => {
    balances.set(user.id, 0);
  });
  
  // Calculate net balance for each user
  expenses.forEach(expense => {
    // Add the full amount to the payer
    const payerId = expense.paidBy;
    balances.set(payerId, (balances.get(payerId) || 0) + expense.amount);
    
    // Subtract each participant's share
    expense.participants.forEach(participant => {
      const participantId = participant.userId;
      balances.set(
        participantId, 
        (balances.get(participantId) || 0) - participant.amount
      );
    });
  });
  
  // Separate users with positive and negative balances
  const positiveBalances: { userId: string; amount: number }[] = [];
  const negativeBalances: { userId: string; amount: number }[] = [];
  
  balances.forEach((balance, userId) => {
    if (balance > 0) {
      positiveBalances.push({ userId, amount: balance });
    } else if (balance < 0) {
      negativeBalances.push({ userId, amount: -balance });
    }
  });
  
  // Sort balances by amount (descending)
  positiveBalances.sort((a, b) => b.amount - a.amount);
  negativeBalances.sort((a, b) => b.amount - a.amount);
  
  // Calculate simplified debts
  const debts: { fromUser: User; toUser: User; amount: number }[] = [];
  
  while (positiveBalances.length > 0 && negativeBalances.length > 0) {
    const creditor = positiveBalances[0];
    const debtor = negativeBalances[0];
    
    const amount = Math.min(creditor.amount, debtor.amount);
    
    // Find the corresponding User objects
    const fromUser = users.find(u => u.id === debtor.userId);
    const toUser = users.find(u => u.id === creditor.userId);
    
    if (fromUser && toUser) {
      debts.push({
        fromUser,
        toUser,
        amount: Math.round(amount * 100) / 100 // Round to 2 decimal places
      });
    }
    
    // Update balances
    creditor.amount -= amount;
    debtor.amount -= amount;
    
    // Remove users with zero balance
    if (creditor.amount < 0.01) positiveBalances.shift();
    if (debtor.amount < 0.01) negativeBalances.shift();
  }
  
  return debts;
}

// Split expense equally among participants
export function splitEqually(amount: number, participantIds: string[]): { userId: string; amount: number }[] {
  const perPersonAmount = amount / participantIds.length;
  
  return participantIds.map(userId => ({
    userId,
    amount: Math.round(perPersonAmount * 100) / 100 // Round to 2 decimal places
  }));
}

// Split expense by custom amounts
export function splitByCustomAmount(
  amount: number,
  participants: { userId: string; percentage: number }[]
): { userId: string; amount: number }[] {
  // Ensure percentages sum to 100
  const totalPercentage = participants.reduce((sum, p) => sum + p.percentage, 0);
  
  if (Math.abs(totalPercentage - 100) > 0.01) {
    // Normalize percentages to sum to 100
    participants = participants.map(p => ({
      ...p,
      percentage: (p.percentage / totalPercentage) * 100
    }));
  }
  
  return participants.map(p => ({
    userId: p.userId,
    amount: Math.round((p.percentage / 100) * amount * 100) / 100 // Round to 2 decimal places
  }));
}

// Generate monthly expense report
export function generateMonthlyReport(expenses: Expense[], userId: string): {
  totalAmount: number;
  averagePerDay: number;
  categorySummary: { [category: string]: number };
  dailyExpenses: { date: string; amount: number }[];
} {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Filter expenses for the current month
  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= firstDayOfMonth && expenseDate <= now;
  });
  
  // Calculate total amount
  let totalAmount = 0;
  monthlyExpenses.forEach(expense => {
    if (expense.paidBy === userId) {
      totalAmount += expense.amount;
    }
  });
  
  // Calculate average per day
  const daysPassed = now.getDate();
  const averagePerDay = totalAmount / daysPassed;
  
  // Generate category summary
  const categorySummary: { [category: string]: number } = {};
  monthlyExpenses.forEach(expense => {
    if (expense.paidBy === userId) {
      const category = expense.category || 'Uncategorized';
      categorySummary[category] = (categorySummary[category] || 0) + expense.amount;
    }
  });
  
  // Generate daily expenses
  const dailyExpenses: { date: string; amount: number }[] = [];
  const dailyMap = new Map<string, number>();
  
  monthlyExpenses.forEach(expense => {
    if (expense.paidBy === userId) {
      const dateStr = expense.date.toISOString().split('T')[0];
      dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + expense.amount);
    }
  });
  
  dailyMap.forEach((amount, date) => {
    dailyExpenses.push({ date, amount });
  });
  
  // Sort by date
  dailyExpenses.sort((a, b) => a.date.localeCompare(b.date));
  
  return {
    totalAmount,
    averagePerDay,
    categorySummary,
    dailyExpenses
  };
}