
import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h6 className="text-sm font-medium text-gray-500 mb-1">{title}</h6>
      <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
    </div>
  );
};
