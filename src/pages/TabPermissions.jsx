import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import { ALL_TABS } from '../components/DashboardLayout';
import {
  LayoutDashboard, Eye, EyeOff, Save, RefreshCw,
  Users, ChevronRight, CheckSquare, Square, ShieldCheck,
  Zap, BarChart2, HelpCircle, Activity, User as UserIcon,
  RotateCcw, Sparkles, Info, UserCog, Wrench, Home
} from 'lucide-react';

// Flat list of all tab metadata keyed by key string
const ALL_TAB_FLAT = [...ALL_TABS.dashboard, ...ALL_TABS.settings];

const TAB_GROUP_LABELS = {
  dashboard: 'Dashboard',
  settings: 'Settings',
};

const TAB_ICONS = {
  overview: <Activity className="w-4 h-4" />,
  stations: <Zap className="w-4 h-4" />,
  analysis: <BarChart2 className="w-4 h-4" />,
  'admin-users': <Users className="w-4 h-4" />,
  'admin-prosumers': <ShieldCheck className="w-4 h-4" />,
  'my-account': <UserIcon className="w-4 h-4" />,
  support: <HelpCircle className="w-4 h-4" />,
};

// Role definitions
const ROLES = [
  {
    key: 'GridOperator',
    name: 'Grid Operator',
    icon: Wrench,
    subtitle: 'Daily Operations',
    description: 'Responsible for daily operational activities at microgrid stations.',
    configurable: true
  },
  {
    key: 'Prosumer',
    name: 'Solar Prosumer',
    icon: Home,
    subtitle: 'End User',
    description: 'A property owner who uses solar panels and interacts with microgrid stations.',
    configurable: true
  },
  {
    key: 'Backoffice',
    name: 'Backoffice',
    icon: UserCog,
    subtitle: 'System Administration',
    description: 'Responsible for system administration and management.',
    configurable: false // Backoffice always sees all tabs
  }
];

const TabPermissions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedTabs, setSelectedTabs] = useState(null); // null = unrestricted
  const [isUnrestricted, setIsUnrestricted] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingTabs, setLoadingTabs] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [allRolePermissions, setAllRolePermissions] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'Backoffice') {
      navigate('/');
      return;
    }
    fetchAllRolePermissions();
  }, [user, navigate]);

  const fetchAllRolePermissions = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllRoleTabPermissions();
      if (response.success) {
        setAllRolePermissions(response.data || []);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to load role permissions.' });
    } finally {
      setLoading(false);
    }
  };

  const selectRole = async (role) => {
    if (!role.configurable) {
      setMessage({ type: 'info', text: 'Backoffice role always sees all tabs and cannot be configured.' });
      return;
    }

    setSelectedRole(role);
    setMessage({ type: '', text: '' });
    setLoadingTabs(true);
    try {
      const response = await userAPI.getRoleTabPermissions(role.key);
      if (response.success && response.data) {
        const tabs = response.data.visibleTabs;
        if (tabs === null || tabs === undefined) {
          setIsUnrestricted(true);
          setSelectedTabs(ALL_TAB_FLAT.map(t => t.key));
        } else {
          setIsUnrestricted(false);
          setSelectedTabs(tabs);
        }
      }
    } catch {
      setIsUnrestricted(true);
      setSelectedTabs(ALL_TAB_FLAT.map(t => t.key));
    } finally {
      setLoadingTabs(false);
    }
  };

  const toggleTab = (key) => {
    if (isUnrestricted) {
      // Switching from unrestricted → restricted mode
      const allKeys = ALL_TAB_FLAT.map(t => t.key);
      setIsUnrestricted(false);
      setSelectedTabs(allKeys.filter(k => k !== key));
      return;
    }
    setSelectedTabs(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const setAllVisible = () => {
    setIsUnrestricted(true);
    setSelectedTabs(ALL_TAB_FLAT.map(t => t.key));
  };

  const setNoneVisible = () => {
    setIsUnrestricted(false);
    setSelectedTabs([]);
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      // If unrestricted, send null to remove restrictions
      const payload = isUnrestricted ? null : selectedTabs;
      const response = await userAPI.updateRoleTabPermissions(selectedRole.key, payload);
      if (response.success) {
        setMessage({ type: 'success', text: `Tab permissions updated for ${selectedRole.name}` });
        // Refresh all role permissions
        await fetchAllRolePermissions();
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to update permissions.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to update tab permissions.' });
    } finally {
      setSaving(false);
    }
  };

  const isTabVisible = (key) => {
    if (isUnrestricted) return true;
    return selectedTabs?.includes(key) ?? false;
  };

  const getRoleBadge = (roleKey) => {
    const map = {
      GridOperator: 'bg-blue-50 text-blue-600 border-blue-100',
      Prosumer: 'bg-lime-50 text-lime-700 border-lime-100',
      Backoffice: 'bg-purple-50 text-purple-600 border-purple-100',
    };
    return map[roleKey] || 'bg-gray-50 text-gray-600 border-gray-100';
  };

  const visibleCount = isUnrestricted ? ALL_TAB_FLAT.length : (selectedTabs?.length ?? 0);

  const getRoleStatus = (roleKey) => {
    const roleData = allRolePermissions.find(r => r.role === roleKey);
    if (!roleData || roleData.visibleTabs === null) {
      return { status: 'unrestricted', count: ALL_TAB_FLAT.length };
    }
    return { status: 'restricted', count: roleData.visibleTabs.length };
  };

  return (
    <div className="text-charcoal-900 w-full h-full flex flex-col pt-4 pb-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-10 w-full max-w-6xl mx-auto">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="w-5 h-5 text-lime-600" />
            <span className="text-xs font-bold text-lime-600 uppercase tracking-widest">Backoffice</span>
          </div>
          <h1 className="text-3xl font-bold text-charcoal-900 tracking-tight">Tab Permissions</h1>
          <p className="text-gray-500 text-sm font-medium">Control which sidebar tabs are visible for each user role</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/users')}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-charcoal-900 px-5 py-2.5 rounded-lg font-semibold transition-colors shadow-sm text-sm flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Manage Users
          </button>
        </div>
      </div>

      {/* Message banner */}
      {message.text && (
        <div className={`mb-6 w-full max-w-6xl mx-auto px-4 py-3 rounded-lg text-sm font-medium shadow-sm ${message.type === 'success'
            ? 'bg-lime-50 text-lime-700 border border-lime-200'
            : message.type === 'info'
              ? 'bg-blue-50 text-blue-600 border border-blue-200'
              : 'bg-red-50 text-red-600 border border-red-200'
          }`}>
          {message.text}
        </div>
      )}

      <div className="w-full max-w-6xl mx-auto flex gap-6 flex-1 min-h-0">

        {/* Left panel – role list */}
        <div className="w-80 flex flex-col gap-3 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Select Role</p>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {loading ? (
                <div className="flex items-center justify-center py-12 text-gray-400 text-sm font-medium">
                  Loading roles...
                </div>
              ) : (
                ROLES.map((role) => {
                  const roleStatus = getRoleStatus(role.key);
                  return (
                    <button
                      key={role.key}
                      onClick={() => selectRole(role)}
                      disabled={!role.configurable}
                      className={`w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors ${selectedRole?.key === role.key ? 'bg-lime-50/60' : ''
                        } ${!role.configurable ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${selectedRole?.key === role.key
                          ? 'bg-lime-400 text-charcoal-900'
                          : role.key === 'Backoffice'
                            ? 'bg-purple-100 text-purple-600'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                        <role.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-charcoal-900">{role.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadge(role.key)}`}>
                            {role.subtitle}
                          </span>
                          <span className={`text-[10px] font-medium ${roleStatus.status === 'unrestricted' ? 'text-lime-600' : 'text-blue-600'}`}>
                            {roleStatus.status === 'unrestricted' ? 'All tabs' : `${roleStatus.count} tabs`}
                          </span>
                        </div>
                      </div>
                      {selectedRole?.key === role.key && (
                        <ChevronRight className="w-4 h-4 text-lime-600 shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right panel – tab permission editor */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {!selectedRole ? (
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-4 py-24">
              <div className="w-14 h-14 rounded-2xl bg-lime-50 flex items-center justify-center">
                <LayoutDashboard className="w-7 h-7 text-lime-500" />
              </div>
              <div className="text-center">
                <p className="text-charcoal-900 font-semibold text-lg">Select a role</p>
                <p className="text-gray-400 text-sm mt-1">Choose a role from the left panel to manage their sidebar visibility</p>
              </div>
            </div>
          ) : (
            <>
              {/* Role info card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${selectedRole.key === 'Backoffice' ? 'bg-purple-100 text-purple-600' : 'bg-lime-400 text-charcoal-900'}`}>
                  <selectedRole.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-charcoal-900">{selectedRole.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadge(selectedRole.key)}`}>
                      {selectedRole.subtitle}
                    </span>
                    <span className="text-gray-400 text-xs">{selectedRole.description}</span>
                  </div>
                </div>
                {/* Summary chip */}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shrink-0 ${isUnrestricted
                    ? 'bg-lime-50 text-lime-700 border-lime-200'
                    : visibleCount === 0
                      ? 'bg-red-50 text-red-500 border-red-100'
                      : 'bg-blue-50 text-blue-600 border-blue-100'
                  }`}>
                  {isUnrestricted ? (
                    <><Sparkles className="w-3 h-3" /> All tabs visible</>
                  ) : (
                    <><Eye className="w-3 h-3" /> {visibleCount} of {ALL_TAB_FLAT.length} visible</>
                  )}
                </div>
              </div>

              {/* Notice banner */}
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-600 font-medium leading-relaxed">
                  <strong>Unrestricted</strong> means users of this role see all tabs (server default).
                  Toggling a tab off switches to <strong>restricted mode</strong> — only ticked tabs will appear in their sidebar.
                  Use <em>Reset to Default</em> to restore full visibility.
                </p>
              </div>

              {/* Tab editor */}
              {loadingTabs ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center py-20 text-gray-400 text-sm font-medium">
                  Loading permissions...
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex-1">
                  {/* Toolbar */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sidebar Tabs</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={setAllVisible}
                        className="flex items-center gap-1.5 text-xs font-semibold text-lime-700 hover:text-lime-800 px-3 py-1.5 rounded-lg hover:bg-lime-50 transition-colors"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        All visible
                      </button>
                      <button
                        onClick={setNoneVisible}
                        className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-charcoal-900 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Square className="w-3.5 h-3.5" />
                        Hide all
                      </button>
                    </div>
                  </div>

                  {/* Tab groups */}
                  <div className="divide-y divide-gray-50">
                    {Object.entries(ALL_TABS).map(([group, tabs]) => (
                      <div key={group} className="px-6 py-5">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                          {TAB_GROUP_LABELS[group]}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {tabs.map(tab => {
                            const visible = isTabVisible(tab.key);
                            return (
                              <button
                                key={tab.key}
                                onClick={() => toggleTab(tab.key)}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all text-left group ${visible
                                    ? 'border-lime-300 bg-lime-50/60 hover:bg-lime-50'
                                    : 'border-gray-100 bg-gray-50/60 hover:bg-gray-100/60 opacity-60'
                                  }`}
                              >
                                <div className={`p-2 rounded-lg shrink-0 transition-colors ${visible ? 'bg-lime-100 text-lime-700' : 'bg-gray-200 text-gray-500'
                                  }`}>
                                  {TAB_ICONS[tab.key]}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className={`text-sm font-semibold truncate transition-colors ${visible ? 'text-charcoal-900' : 'text-gray-400'
                                    }`}>
                                    {tab.name}
                                  </div>
                                  <div className="text-[10px] font-medium text-gray-400 mt-0.5">{tab.path}</div>
                                </div>
                                <div className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${visible
                                    ? 'bg-lime-500 border-lime-500'
                                    : 'border-gray-300 bg-white'
                                  }`}>
                                  {visible && (
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={setAllVisible}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-charcoal-900 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset to Default
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-lime-400 hover:bg-lime-500 disabled:opacity-60 text-charcoal-900 font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-sm text-sm"
                >
                  {saving ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="w-4 h-4" /> Save Permissions</>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TabPermissions;