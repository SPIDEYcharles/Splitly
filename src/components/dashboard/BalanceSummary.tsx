import React from 'react';
import { ExpenseSummary } from '../../types';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface BalanceSummaryProps {
  summary: ExpenseSummary;
}

const BalanceSummary: React.FC<BalanceSummaryProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Spent</p>
            <p className="text-lg font-semibold text-gray-900">
              ${summary.totalSpent.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">You Owe</p>
            <p className="text-lg font-semibold text-red-600">
              ${summary.totalOwed.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <TrendingDown size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">You Are Owed</p>
            <p className="text-lg font-semibold text-green-600">
              ${summary.totalOwedToYou.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className={`p-3 rounded-full mr-4 ${
            summary.netBalance >= 0 
              ? 'bg-green-100 text-green-600' 
              : 'bg-red-100 text-red-600'
          }`}>
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Net Balance</p>
            <p className={`text-lg font-semibold ${
              summary.netBalance >= 0 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              ${Math.abs(summary.netBalance).toFixed(2)}
              {summary.netBalance >= 0 ? ' credit' : ' debt'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceSummary;