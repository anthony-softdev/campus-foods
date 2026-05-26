import React from 'react';
import { 
  Plus, 
  CreditCard, 
  Bell, 
  Users, 
  Timer, 
  Package, 
  Trash2, 
  UserX,
  Edit
} from 'lucide-react';
import { User, Order, MenuItem } from '../types';

interface AdminSectionProps {
  currentUser: User;
  orders: Order[];
  menu: MenuItem[];
  users: User[];
  totalRevenue: number;
  totalReceivedOrdersCount: number;
  totalActiveUsersCount: number;
  handleStartAddItem: () => void;
  handleStartEditItem: (item: MenuItem) => void;
  handleToggleAvailability: (mealId: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  handleDeleteCatalogItem: (mealId: string, name: string) => void;
  handleDeleteUserAccount: (email: string, fullname: string) => void;
}

export default function AdminSection({
  currentUser,
  orders,
  menu,
  users,
  totalRevenue,
  totalReceivedOrdersCount,
  totalActiveUsersCount,
  handleStartAddItem,
  handleStartEditItem,
  handleToggleAvailability,
  updateOrderStatus,
  handleDeleteCatalogItem,
  handleDeleteUserAccount
}: AdminSectionProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in font-sans">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Vendor Management Panel</h1>
          <p className="text-slate-500 text-xs sm:text-sm font-semibold">Monitor campus delivery orders, adjust catalog prices, add menu items, and control member profiles.</p>
        </div>
        <button 
          type="button"
          onClick={handleStartAddItem}
          className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-4.5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer border-0 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Food Item
        </button>
      </div>

      {/* Simulated Live sales Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Total Sales Revenue</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-950 mt-1">₦{totalRevenue}</h3>
          </div>
          <div className="bg-yellow-50 text-amber-600 p-3 rounded-xl shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest font-sans">Active Orders Registered</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-950 mt-1">{totalReceivedOrdersCount}</h3>
          </div>
          <div className="bg-amber-50 text-amber-700 p-3 rounded-xl shrink-0">
            <Bell className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest font-sans">Student User Base</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-950 mt-1">{totalActiveUsersCount}</h3>
          </div>
          <div className="bg-amber-100/50 text-amber-800 p-3 rounded-xl shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Split content list block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Manage incoming customer orders */}
        <div className="lg:col-span-7 bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl space-y-5 h-fit shadow-xs">
          <h3 className="text-lg font-extrabold border-b border-slate-100 pb-3 text-slate-900 flex items-center gap-2">
            <Bell className="text-amber-500 w-5 h-5" /> Incoming Campus Orders tracker
          </h3>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {orders.length > 0 ? (
              orders.map(order => (
                <div 
                  key={order.orderId} 
                  className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 shadow-2xs"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{order.orderId}</h4>
                      <p className="text-slate-500 text-[11px] font-semibold">
                        Client: {order.userName} ({order.phone})
                      </p>
                    </div>
                    
                    {/* Live state update select */}
                    <select 
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.orderId, e.target.value as Order['status'])}
                      className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-amber-500 cursor-pointer font-sans"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>

                  <div className="text-xs text-slate-600 font-semibold space-y-1 bg-white p-2.5 rounded-lg border border-slate-150">
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[9px] block">Items</span>
                      <p className="text-slate-800 font-bold">
                        {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                      </p>
                    </div>
                    <hr className="border-slate-100 my-1" />
                    <div className="flex justify-between items-center pt-1 text-xs">
                      <span className="truncate pr-1"><span className="font-bold text-slate-550">Spot:</span> {order.address}</span>
                      {order.estimatedMinutes && (
                        <span className="text-amber-700 font-bold flex items-center gap-0.5 shrink-0 text-[10px] bg-amber-50 px-1.5 py-0.5 rounded-md">
                          <Timer className="w-3 h-3 text-amber-655" />
                          {order.estimatedMinutes}m ETA
                        </span>
                      )}
                      <span className="text-slate-900 font-extrabold text-xs shrink-0">Total: ₦{order.total}</span>
                    </div>
                  </div>

                </div>
              ))
            ) : (
              <p className="text-center py-8 text-slate-400 text-xs font-bold">No orders logged in database.</p>
            )}
          </div>
        </div>

        {/* Right Column: Menu deletion & Active user listings */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Menu catalogue deletion box */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-5">
            <h3 className="text-base sm:text-lg font-extrabold border-b border-slate-100 pb-3 text-slate-900 flex items-center gap-2">
              <Package className="text-amber-600 w-5 h-5" /> Current Culinary Catalog
            </h3>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
              {menu.map(item => (
                <div 
                  key={item.id} 
                  className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <img src={item.image} alt={item.name} className={`w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0 ${item.available === false ? 'grayscale brightness-75' : ''}`} />
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">{item.name}</h4>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-slate-500 text-[10px] font-semibold">₦{item.price} • {item.category}</span>
                        <span className={`text-[8px] px-1 py-0.2 rounded font-black tracking-wider uppercase ${item.available !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {item.available !== false ? 'In Stock' : 'Sold Out'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleAvailability(item.id)}
                      className={`px-2 py-1 rounded text-[9px] font-bold uppercase cursor-pointer border-0 transition duration-150 ${item.available !== false ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-250 border-solid' : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-250 border-solid'}`}
                      title="Toggle availability status"
                    >
                      {item.available !== false ? 'Available' : 'Unavailable'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleStartEditItem(item)}
                      className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-slate-200/50 rounded-lg transition cursor-pointer bg-transparent border-0"
                      title="Edit menu item"
                    >
                      <Edit className="w-4 h-4 stroke-[2]" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleDeleteCatalogItem(item.id, item.name)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-200/50 rounded-lg transition cursor-pointer bg-transparent border-0"
                      title="Delete menu item"
                    >
                      <Trash2 className="w-4 h-4 stroke-[2]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User directory listings deletion block */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold border-b border-slate-100 pb-2.5 text-slate-950 flex items-center gap-2">
                <Users className="text-amber-500 w-5 h-5" /> Registered Student Directory
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">Directly ban or disable student logins on security misconduct.</p>
            </div>

            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
              {users.map(u => (
                <div 
                  key={u.email} 
                  className="bg-slate-50 border border-slate-150 p-3 rounded-xl flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs">{u.firstname} {u.lastname}</h4>
                    <p className="text-slate-500 text-[10px] font-medium truncate max-w-[150px] sm:max-w-xs">{u.email}</p>
                    <span className={`inline-block py-0.5 px-2 rounded font-bold text-[9px] uppercase mt-1 ${u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'}`}>
                      {u.role}
                    </span>
                  </div>
                  
                  {u.email !== currentUser.email && (
                    <button 
                      type="button"
                      onClick={() => handleDeleteUserAccount(u.email, `${u.firstname} ${u.lastname}`)}
                      className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-red-500 hover:border-red-200 transition cursor-pointer shrink-0"
                      title="Ban Account"
                    >
                      <UserX className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
