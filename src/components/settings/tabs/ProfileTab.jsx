import React from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import SettingsSection from '../SettingsSection';

const ProfileTab = ({ 
    currentUser, 
    settings, 
    setSettings, 
    setHasUnsavedChanges, 
    handleSave, 
    saving, 
    saved, 
    error,
    passwordData,
    setPasswordData,
    handlePasswordUpdate,
    showPasswords,
    setShowPasswords
}) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            {/* Profile Header Card */}
            <div className="bg-white p-6 md:p-8 rounded-[12px] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6 md:gap-8">
                <div className="size-20 md:w-24 md:h-24 rounded-full bg-primary flex items-center justify-center text-white text-2xl md:text-3xl font-black shadow-brand uppercase shrink-0">
                    {settings.displayName?.charAt(0) || currentUser.email?.charAt(0)}
                </div>
                <div className="flex-1 text-center md:text-left min-w-0">
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 truncate">{settings.displayName || 'No Name Set'}</h3>
                    <p className="text-sm md:text-base text-slate-500 font-medium truncate">{currentUser.email}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                        <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            UID: {currentUser.uid.slice(0, 8)}...
                        </div>
                        <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Member Since: {new Date(currentUser.metadata.creationTime).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>

            <SettingsSection
                title="Your Profile"
                subtitle="Update your personal information and public identity."
                onSave={() => handleSave({ displayName: settings.displayName })}
                saving={saving}
                saved={saved}
                error={error}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label htmlFor="displayName" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 cursor-pointer">Display Name</label>
                        <input
                            id="displayName"
                            type="text"
                            value={settings.displayName}
                            onChange={(e) => {
                                setSettings(prev => ({ ...prev, displayName: e.target.value }));
                                setHasUnsavedChanges(true);
                            }}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[8px] font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all"
                            placeholder="John Doe"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="emailAddress" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                        <div className="relative group">
                            <input
                                id="emailAddress"
                                type="email"
                                value={currentUser.email}
                                disabled
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[8px] font-medium text-slate-400 cursor-not-allowed opacity-70"
                            />
                            <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold ml-1 italic">Email cannot be changed.</p>
                    </div>
                </div>
            </SettingsSection>

            <SettingsSection
                title="Update Password"
                subtitle="Ensure your account remains secure with a strong password."
                onSave={handlePasswordUpdate}
                saving={saving}
                saved={saved}
                error={error}
            >
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="currentPassword" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 cursor-pointer">Current Password</label>
                        <div className="relative">
                            <input
                                id="currentPassword"
                                type={showPasswords.current ? "text" : "password"}
                                value={passwordData.current}
                                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[8px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary"
                                aria-label={showPasswords.current ? "Hide password" : "Show password"}
                            >
                                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label htmlFor="newPassword" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 cursor-pointer">New Password</label>
                            <div className="relative">
                                <input
                                    id="newPassword"
                                    type={showPasswords.new ? "text" : "password"}
                                    value={passwordData.new}
                                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[8px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                                    aria-label={showPasswords.new ? "Hide password" : "Show password"}
                                >
                                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 cursor-pointer">Confirm New Password</label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={showPasswords.confirm ? "text" : "password"}
                                    value={passwordData.confirm}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[8px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                                    aria-label={showPasswords.confirm ? "Hide password" : "Show password"}
                                >
                                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </SettingsSection>
        </div>
    );
};

export default ProfileTab;


