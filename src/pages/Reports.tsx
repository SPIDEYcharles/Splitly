import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useExpenseStore } from '../store/expenseStore';
import ReportSummary from '../components/reports/ReportSummary';
import { Calendar, RefreshCw } from 'lucide-react';

const Reports: React.FC = () => {
  const { user } = useAuthStore();
  const { expenses, fetchExpenses, fetchExpensesForLastMonth } = useExpenseStore();
  const [timeRange, setTimeRange] = useState<'all' | 'month'>('month');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const loadExpenses = async () => {
      if (user) {
        setIsLoading(true);
        if (timeRange === 'month') {
          await fetchExpensesForLastMonth(user.id);
        } else {
          await fetchExpenses(user.id);
        }
        setIsLoading(false);
      }
    };
    
    loadExpenses();
  }, [user, timeRange, fetchExpenses, fetchExpensesForLastMonth]);
  
  if (!user) return null;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Expense Reports</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('month')}
            className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium ${
              timeRange === 'month'
                ? 'bg-indigo-600 text-white border-transparent'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Last Month
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium ${
              timeRange === 'all'
                ? 'bg-indigo-600 text-white border-transparent'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            All Time
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <ReportSummary expenses={expenses} currentUser={user} />
      )}
    </div>
  );
};

export default Reports;