import React from 'react';
import { Expense, User } from '../../types';
import { generateMonthlyReport } from '../../utils/expenseUtils';
import { BarChart, PieChart, DollarSign, Calendar } from 'lucide-react';

interface ReportSummaryProps {
  expenses: Expense[];
  currentUser: User;
}

const ReportSummary: React.FC<ReportSummaryProps> = ({ expenses, currentUser }) => {
  const report = generateMonthlyReport(expenses, currentUser.id);
  
  // Get current month name
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  
  // Prepare data for category chart
  const categories = Object.entries(report.categorySummary).map(([category, amount]) => ({
    category,
    amount,
    percentage: Math.round((amount / report.totalAmount) * 100),
  }));
  
  // Sort categories by amount (descending)
  categories.sort((a, b) => b.amount - a.amount);
  
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {currentMonth} Summary
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                <DollarSign size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Spent</p>
                <p className="text-xl font-semibold text-gray-900">
                  ${report.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Daily Average</p>
                <p className="text-xl font-semibold text-gray-900">
                  ${report.averagePerDay.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                <PieChart size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Top Category</p>
                <p className="text-xl font-semibold text-gray-900">
                  {categories.length > 0 ? categories[0].category : 'None'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Spending by Category</h3>
            <div className="p-2 rounded-full bg-gray-100">
              <PieChart size={16} className="text-gray-500" />
            </div>
          </div>
          
          {categories.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No expense data available</p>
          ) : (
            <div className="space-y-4">
              {categories.map(({ category, amount, percentage }) => (
                <div key={category}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{category}</span>
                    <span className="text-sm font-medium text-gray-900">
                      ${amount.toFixed(2)} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Daily Expenses</h3>
            <div className="p-2 rounded-full bg-gray-100">
              <BarChart size={16} className="text-gray-500" />
            </div>
          </div>
          
          {report.dailyExpenses.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No expense data available</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {report.dailyExpenses.map(({ date, amount }) => (
                <div key={date} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">
                    {new Date(date).toLocaleDateString()}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    ${amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportSummary;