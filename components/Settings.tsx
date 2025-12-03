import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Shield, UserPlus, Trash2 } from 'lucide-react';

interface SettingsProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  currentUser: User;
}

const Settings: React.FC<SettingsProps> = ({ users, setUsers, currentUser }) => {
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '', email: '', role: UserRole.READ_ONLY, initials: ''
  });

  if (currentUser.role !== UserRole.ADMIN) {
    return <div className="p-10 text-center text-gray-500 font-heritage uppercase tracking-widest">Access Denied: Admins Only</div>;
  }

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) return;
    const user: User = {
        id: `u-${Date.now()}`,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role as UserRole,
        initials: newUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    };
    setUsers([...users, user]);
    setNewUser({ name: '', email: '', role: UserRole.READ_ONLY, initials: '' });
  };

  const handleDelete = (id: string) => {
    if (id === currentUser.id) {
        alert("You cannot delete yourself.");
        return;
    }
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-brand-dark font-heritage uppercase tracking-wider mb-6 flex items-center">
            <Shield className="mr-3 text-brand-gold" /> System Administration
        </h2>
        
        <div className="mb-8 p-6 bg-gray-50 rounded-sm border border-gray-200">
            <h3 className="text-sm font-bold text-brand-dark font-heritage uppercase tracking-widest mb-4">Add New User</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Name</label>
                    <input type="text" className="w-full p-2 border border-gray-300 rounded-sm" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                </div>
                <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Email</label>
                    <input type="email" className="w-full p-2 border border-gray-300 rounded-sm" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                </div>
                <div className="md:col-span-1">
                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Role</label>
                     <select className="w-full p-2 border border-gray-300 rounded-sm" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}>
                         <option value={UserRole.ADMIN}>Admin</option>
                         <option value={UserRole.RECRUITER}>Recruiter</option>
                         <option value={UserRole.READ_ONLY}>Read Only</option>
                     </select>
                </div>
                <button onClick={handleAddUser} className="bg-brand-dark text-brand-gold font-bold p-2.5 rounded-sm uppercase text-xs tracking-widest hover:bg-black transition-colors flex items-center justify-center">
                    <UserPlus size={16} className="mr-2" /> Add
                </button>
            </div>
        </div>

        <div>
            <h3 className="text-sm font-bold text-brand-dark font-heritage uppercase tracking-widest mb-4">Current Users</h3>
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase font-heritage">
                        <th className="py-3">User</th>
                        <th className="py-3">Role</th>
                        <th className="py-3 text-right">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center text-xs font-bold mr-3">
                                        {user.initials}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-brand-dark">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4">
                                <span className={`text-[10px] font-bold uppercase px-2 py-1 border rounded-sm ${user.role === UserRole.ADMIN ? 'border-brand-gold text-brand-dark' : 'border-gray-200 text-gray-500'}`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="py-4 text-right">
                                {user.id !== currentUser.id && (
                                    <button onClick={() => handleDelete(user.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Settings;