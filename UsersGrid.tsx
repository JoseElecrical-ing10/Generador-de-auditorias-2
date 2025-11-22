
import React from 'react';
import { User } from '../types';

interface UsersGridProps {
  users: User[];
}

export const UsersGrid: React.FC<UsersGridProps> = ({ users }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {users.map((user) => (
        <div key={user.id} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-xl">
              {user.name.charAt(0)}
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-800">{user.name}</h4>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <div className="text-xs font-semibold bg-gray-100 text-gray-800 px-2 py-1 rounded-full inline-block">
            {user.id}
          </div>
        </div>
      ))}
    </div>
  );
};
