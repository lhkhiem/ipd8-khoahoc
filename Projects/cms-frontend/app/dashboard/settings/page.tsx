'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Save, Globe, Palette, Mail, Bell, Lock, Database, Image as ImageIcon, Plus, Edit, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { useTheme } from '@/hooks/use-theme';
import { useAppearance } from '@/hooks/use-appearance';
import MediaPicker from '@/components/MediaPicker';
import { getAssetUrl, buildApiUrl, getNormalizedApiBaseUrl, getNormalizedBackendUrl } from '@/lib/api';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const { user } = useAuthStore();
  const { setTheme } = useTheme();
  const [saving, setSaving] = useState(false);
  const { setAppearance: setAppearanceCtx } = useAppearance();
  const apiBase = getNormalizedApiBaseUrl();
  const backendBase = getNormalizedBackendUrl();

  // Namespaced settings state
  const [general, setGeneral] = useState<any>({ siteName: '', siteDescription: '', siteUrl: '', adminEmail: '', businessInfo: {}, socialLinks: {}, workingHours: {} });
  // Theme mode is managed separately from the rest of appearance to avoid stale state bugs
  // and to ensure the selected option is always what gets applied & saved.
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('light');
  const [appearance, setAppearance] = useState<any>({
    primaryColor: '#8b5cf6',
    // CMS branding
    logo_asset_id: null,
    logo_url: '',
    favicon_asset_id: null,
    favicon_url: '',
    // Client (ecommerce) branding
    ecommerce_logo_asset_id: null,
    ecommerce_logo_url: '',
    ecommerce_favicon_asset_id: null,
    ecommerce_favicon_url: '',
    // Top Banner Text
    topBannerText: '',
  });
  const [email, setEmail] = useState<any>({ smtpHost: '', smtpPort: 587, encryption: 'tls', fromEmail: '', fromName: 'PressUp CMS', username: '', password: '', enabled: false });
  const [notifications, setNotifications] = useState<any>({ newPost: true, newUser: true, newComment: true, systemUpdates: true });
  const [security, setSecurity] = useState<any>({ twoFactorEnabled: false, sessionTimeout: 60, passwordPolicy: { minLength: 8, uppercase: true, numbers: true, special: false } });
  const [advanced, setAdvanced] = useState<any>({ apiBaseUrl: apiBase, cacheStrategy: 'memory' });
  const [homepageMetrics, setHomepageMetrics] = useState<any>({
    activeCustomers: '',
    countriesServed: '',
    yearsInBusiness: '',
  });
  const [logoPickerOpen, setLogoPickerOpen] = useState(false);
  const [faviconPickerOpen, setFaviconPickerOpen] = useState(false);
  const [clientLogoPickerOpen, setClientLogoPickerOpen] = useState(false);
  const [clientFaviconPickerOpen, setClientFaviconPickerOpen] = useState(false);

  const fetchNs = async (ns: string, setter: (v: any)=>void) => {
    try {
      const res = await axios.get<any>(buildApiUrl(`/api/settings/${ns}`), { withCredentials: true });
      const value = res.data?.value ?? {};
      
      // Convert relative URLs to full URLs for display (only for appearance namespace)
      if (ns === 'appearance') {
        value.logo_url = getAssetUrl(value.logo_url);
        value.favicon_url = getAssetUrl(value.favicon_url);
        value.ecommerce_logo_url = getAssetUrl(value.ecommerce_logo_url);
        value.ecommerce_favicon_url = getAssetUrl(value.ecommerce_favicon_url);
      }
      
      setter(value);
      if (ns === 'appearance') {
        // Keep context in sync (logo, favicon, etc.)
        setAppearanceCtx(value);
        // Initialize theme mode from settings (fallback to light)
        if (value && typeof value.themeMode === 'string') {
          const m = value.themeMode as 'light' | 'dark' | 'system';
          setThemeMode(m);
          setTheme(m);
        }
      }
    } catch (e: any) {
      // silent for initial load
    }
  };

  useEffect(() => {
    fetchNs('general', setGeneral);
    fetchNs('appearance', setAppearance);
    fetchNs('email', setEmail);
    fetchNs('notifications', setNotifications);
    fetchNs('security', setSecurity);
    fetchNs('advanced', setAdvanced);
    fetchNs('homepage_metrics', setHomepageMetrics);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const ns = activeTab;
      if (ns === 'appearance') {
        const stripBase = (value: string | null | undefined) => {
          if (!value) return value;
          if (value.startsWith(apiBase)) return value.replace(apiBase, '');
          if (value.startsWith(backendBase)) return value.replace(backendBase, '');
          return value;
        };

        const appearancePayload = {
          ...appearance,
          themeMode,
          logo_url: stripBase(appearance.logo_url),
          favicon_url: stripBase(appearance.favicon_url),
          topBannerText: appearance.topBannerText || '',
        };

        await axios.put(buildApiUrl('/api/settings/appearance'), appearancePayload, { withCredentials: true });
        await axios.put(buildApiUrl('/api/settings/homepage_metrics'), homepageMetrics, { withCredentials: true });

        if (themeMode === 'dark' || themeMode === 'light' || themeMode === 'system') {
          setTheme(themeMode);
        }
        if (appearance.primaryColor) {
          document.documentElement.style.setProperty('--color-primary', appearance.primaryColor);
          // Only set --primary in dark mode, or if color is dark enough for light mode
          // In light mode, keep default dark purple to ensure button visibility
          const isDarkMode = themeMode === 'dark' || (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
          if (isDarkMode) {
            document.documentElement.style.setProperty('--primary', appearance.primaryColor);
          } else {
            // Light mode: use default dark purple, don't override with light colors
            document.documentElement.style.removeProperty('--primary');
          }
        }
        try {
          const stored = JSON.stringify({ ...appearance, themeMode });
          localStorage.setItem('cms_appearance', stored);
          window.dispatchEvent(new StorageEvent('storage', { key: 'cms_appearance', newValue: stored } as any));
          window.dispatchEvent(new CustomEvent('appearanceUpdated'));
        } catch {}
        toast.success('Settings saved and applied successfully!');
        await Promise.all([
          fetchNs('appearance', setAppearance),
          fetchNs('homepage_metrics', setHomepageMetrics),
        ]);
      } else if (ns === 'homepage_metrics') {
        await axios.put(buildApiUrl('/api/settings/homepage_metrics'), homepageMetrics, { withCredentials: true });
        toast.success('Homepage metrics saved');
        await fetchNs('homepage_metrics', setHomepageMetrics);
      } else {
        const map: Record<string, { state: any; setter: (v: any) => void }> = {
          general: { state: general, setter: setGeneral },
          email: { state: email, setter: setEmail },
          notifications: { state: notifications, setter: setNotifications },
          security: { state: security, setter: setSecurity },
          advanced: { state: advanced, setter: setAdvanced },
        };

        const target = map[ns];
        if (!target) {
          toast.error('Unknown settings namespace');
          return;
        }

        await axios.put(buildApiUrl(`/api/settings/${ns}`), target.state, { withCredentials: true });
        toast.success('Settings saved');
        await fetchNs(ns, target.setter);
      }
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const onClearCache = async () => {
    try {
  await axios.post(buildApiUrl('/api/settings/clear-cache'), {}, { withCredentials: true });
      toast.success('Cache cleared');
    } catch (e: any) {
      toast.error('Failed to clear cache');
    }
  };

  const onResetDefaults = async () => {
    try {
      const res = await axios.post<any>(buildApiUrl('/api/settings/reset-default'), { scope: activeTab }, { withCredentials: true });
      const defaults = res.data?.defaults;
      if (activeTab === 'appearance') {
        setAppearance(defaults);
        setAppearanceCtx(defaults);
      }
      if (activeTab === 'general') setGeneral(defaults);
      if (activeTab === 'email') setEmail(defaults);
      if (activeTab === 'notifications') setNotifications(defaults);
      if (activeTab === 'security') setSecurity(defaults);
      if (activeTab === 'advanced') setAdvanced(defaults);
      toast.success('Reset to default');
    } catch (e: any) {
      toast.error('Failed to reset');
    }
  };

  // Client (ecommerce) asset selector (Logo/Favicon Client)
  const handleClientAssetSelect = async (assetId: string | null, type: 'logo' | 'favicon') => {
    try {
      let assetData: any = null;

      if (assetId) {
        const res = await axios.get<any>(buildApiUrl(`/api/assets/${assetId}`), { withCredentials: true });
        assetData = res.data?.data || res.data;
        if (!assetData?.id) {
          toast.error('Selected asset is invalid');
          return;
        }
      }

      const relativeUrl = assetData?.cdn_url || assetData?.url || '';
      const displayUrl = relativeUrl ? getAssetUrl(relativeUrl) : '';

      const updatedAppearance = {
        ...appearance,
        ...(type === 'logo'
          ? {
              ecommerce_logo_asset_id: assetData?.id || null,
              ecommerce_logo_url: displayUrl,
            }
          : {
              ecommerce_favicon_asset_id: assetData?.id || null,
              ecommerce_favicon_url: displayUrl,
            }),
      };

      setAppearance(updatedAppearance);
      setAppearanceCtx(updatedAppearance);

      const backendData = {
        ...appearance,
        ...(type === 'logo'
          ? {
              ecommerce_logo_asset_id: assetData?.id || null,
              ecommerce_logo_url: relativeUrl,
            }
          : {
              ecommerce_favicon_asset_id: assetData?.id || null,
              ecommerce_favicon_url: relativeUrl,
            }),
      };

      await axios.put(buildApiUrl('/api/settings/appearance'), backendData, { withCredentials: true });
      toast.success(type === 'logo' ? 'Logo Client updated' : 'Favicon Client updated');
      await fetchNs('appearance', setAppearance);
    } catch (error: any) {
      console.error('Failed to update client appearance asset:', error);
      toast.error('Failed to update client asset. Please try again.');
    } finally {
      if (type === 'logo') {
        setClientLogoPickerOpen(false);
      } else {
        setClientFaviconPickerOpen(false);
      }
    }
  };

  const handleAssetSelect = async (assetId: string | null, type: 'logo' | 'favicon') => {
    try {
      let assetData: any = null;

      if (assetId) {
        const res = await axios.get<any>(buildApiUrl(`/api/assets/${assetId}`), { withCredentials: true });
        assetData = res.data?.data || res.data;
        if (!assetData?.id) {
          toast.error('Selected asset is invalid');
          return;
        }
      }

      const relativeUrl = assetData?.cdn_url || assetData?.url || '';
      const displayUrl = relativeUrl ? getAssetUrl(relativeUrl) : '';

      // Strip base URL from relativeUrl if it contains full URL
      const stripBase = (value: string | null | undefined) => {
        if (!value) return value || '';
        if (value.startsWith(apiBase)) return value.replace(apiBase, '');
        if (value.startsWith(backendBase)) return value.replace(backendBase, '');
        if (value.startsWith('http://') || value.startsWith('https://')) {
          // Extract path from full URL
          try {
            const url = new URL(value);
            return url.pathname;
          } catch {
            return value;
          }
        }
        return value;
      };

      const cleanRelativeUrl = stripBase(relativeUrl);

      // Update local state first for immediate UI feedback
      const updatedAppearance = {
        ...appearance,
        [`${type}_asset_id`]: assetData?.id || null,
        [`${type}_url`]: displayUrl,
      };

      setAppearance(updatedAppearance);
      setAppearanceCtx(updatedAppearance);

      // Prepare backend data - fetch current appearance to ensure we have all fields
      const currentRes = await axios.get<any>(buildApiUrl('/api/settings/appearance'), { withCredentials: true });
      const currentAppearance = (currentRes.data?.value || currentRes.data || {}) as any;
      
      // Merge current appearance with updates, ensuring we preserve all existing fields
      const backendData = {
        ...currentAppearance,
        primaryColor: appearance.primaryColor || currentAppearance.primaryColor || '#8b5cf6',
        themeMode: themeMode || currentAppearance.themeMode || 'light',
        topBannerText: appearance.topBannerText || currentAppearance.topBannerText || '',
        // CMS branding
        logo_asset_id: type === 'logo' ? (assetData?.id || null) : (currentAppearance.logo_asset_id || null),
        logo_url: type === 'logo' ? cleanRelativeUrl : (stripBase(currentAppearance.logo_url) || ''),
        favicon_asset_id: type === 'favicon' ? (assetData?.id || null) : (currentAppearance.favicon_asset_id || null),
        favicon_url: type === 'favicon' ? cleanRelativeUrl : (stripBase(currentAppearance.favicon_url) || ''),
        // Client (ecommerce) branding - preserve existing values
        ecommerce_logo_asset_id: currentAppearance.ecommerce_logo_asset_id || null,
        ecommerce_logo_url: stripBase(currentAppearance.ecommerce_logo_url) || '',
        ecommerce_favicon_asset_id: currentAppearance.ecommerce_favicon_asset_id || null,
        ecommerce_favicon_url: stripBase(currentAppearance.ecommerce_favicon_url) || '',
      };

      console.log(`[handleAssetSelect] Updating ${type}:`, {
        assetId: assetData?.id || null,
        relativeUrl: cleanRelativeUrl,
        displayUrl,
        backendData: {
          [`${type}_asset_id`]: backendData[`${type}_asset_id`],
          [`${type}_url`]: backendData[`${type}_url`],
        }
      });

      const response = await axios.put<any>(buildApiUrl('/api/settings/appearance'), backendData, { withCredentials: true });
      
      if (response.data && (response.data.ok !== false || response.data.ok === undefined)) {
        toast.success(`${type === 'logo' ? 'Logo' : 'Favicon'} CMS updated successfully`);
      }
      
      // Refresh from backend to ensure consistency
      await fetchNs('appearance', setAppearance);
    } catch (error: any) {
      console.error('Failed to update appearance asset:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: buildApiUrl('/api/settings/appearance'),
      });
      toast.error(error.response?.data?.error || `Failed to update ${type}. Please try again.`);
    } finally {
      if (type === 'logo') {
        setLogoPickerOpen(false);
      } else {
        setFaviconPickerOpen(false);
      }
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'advanced', label: 'Advanced', icon: Database },
  ];

  return (
    <>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your CMS configuration and preferences</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <button 
            onClick={onSave} 
            disabled={saving} 
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar Tabs */}
        <div className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {activeTab === 'general' && (
            <div className="rounded-lg border border-border bg-card p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-card-foreground mb-4">General Settings</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Site Name</label>
                  <input
                    type="text"
                    value={general.siteName || ''}
                    onChange={(e)=>setGeneral({ ...general, siteName: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Site Description</label>
                  <textarea
                    rows={3}
                    value={general.siteDescription || ''}
                    onChange={(e)=>setGeneral({ ...general, siteDescription: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Site URL</label>
                  <input
                    type="url"
                    value={general.siteUrl || ''}
                    onChange={(e)=>setGeneral({ ...general, siteUrl: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Admin Email</label>
                  <input
                    type="email"
                    value={general.adminEmail || ''}
                    onChange={(e)=>setGeneral({ ...general, adminEmail: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Business Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Company Name</label>
                    <input type="text" value={general.businessInfo?.company || ''} onChange={(e)=>setGeneral({ ...general, businessInfo: { ...general.businessInfo, company: e.target.value } })} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Tax Code</label>
                    <input type="text" value={general.businessInfo?.taxCode || ''} onChange={(e)=>setGeneral({ ...general, businessInfo: { ...general.businessInfo, taxCode: e.target.value } })} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">Address</label>
                    <input type="text" value={general.businessInfo?.address || ''} onChange={(e)=>setGeneral({ ...general, businessInfo: { ...general.businessInfo, address: e.target.value } })} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                    <input type="text" value={general.businessInfo?.phone || ''} onChange={(e)=>setGeneral({ ...general, businessInfo: { ...general.businessInfo, phone: e.target.value } })} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                    <input type="email" value={general.businessInfo?.email || ''} onChange={(e)=>setGeneral({ ...general, businessInfo: { ...general.businessInfo, email: e.target.value } })} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm" />
                  </div>
                </div>

                {/* Social Links */}
                <div className="grid md:grid-cols-2 gap-4">
                  {['facebook','youtube','tiktok','linkedin','twitter'].map((k)=> (
                    <div key={k}>
                      <label className="block text-sm font-medium text-foreground mb-2">{k[0].toUpperCase()+k.slice(1)} URL</label>
                      <input type="url" value={general.socialLinks?.[k] || ''} onChange={(e)=>setGeneral({ ...general, socialLinks: { ...general.socialLinks, [k]: e.target.value } })} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm" />
                    </div>
                  ))}
                </div>

                {/* Working Hours */}
                <div className="border-t border-border pt-4">
                  <h4 className="text-sm font-semibold text-foreground mb-4">Giờ làm việc</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Thứ 2 - Thứ 6</label>
                      <input
                        type="text"
                        value={general.workingHours?.mondayFriday || ''}
                        onChange={(e)=>setGeneral({ ...general, workingHours: { ...general.workingHours, mondayFriday: e.target.value } })}
                        className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm"
                        placeholder="9:00 - 18:00 EST"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Thứ 7</label>
                      <input
                        type="text"
                        value={general.workingHours?.saturday || ''}
                        onChange={(e)=>setGeneral({ ...general, workingHours: { ...general.workingHours, saturday: e.target.value } })}
                        className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm"
                        placeholder="10:00 - 16:00 EST"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Chủ nhật</label>
                      <input
                        type="text"
                        value={general.workingHours?.sunday || ''}
                        onChange={(e)=>setGeneral({ ...general, workingHours: { ...general.workingHours, sunday: e.target.value } })}
                        className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm"
                        placeholder="Nghỉ"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Giờ làm việc (Điện thoại)</label>
                      <input
                        type="text"
                        value={general.workingHours?.phoneHours || ''}
                        onChange={(e)=>setGeneral({ ...general, workingHours: { ...general.workingHours, phoneHours: e.target.value } })}
                        className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm"
                        placeholder="Thứ 2-6, 9:00-18:00 EST"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Thời gian phản hồi Email</label>
                      <input
                        type="text"
                        value={general.workingHours?.emailResponse || ''}
                        onChange={(e)=>setGeneral({ ...general, workingHours: { ...general.workingHours, emailResponse: e.target.value } })}
                        className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm"
                        placeholder="Phản hồi trong 24 giờ"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="rounded-lg border border-border bg-card p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-card-foreground mb-4">Appearance</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Theme Mode</label>
                  <select
                    value={themeMode}
                    onChange={(e)=>{
                      const mode = e.target.value as 'light'|'dark'|'system';
                      // Cập nhật state riêng cho theme mode để tránh việc state appearance bị stale
                      setThemeMode(mode);
                      // Áp dụng theme ngay lập tức
                      setTheme(mode);
                    }}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Primary Color</label>
                  <input
                    type="color"
                    value={appearance.primaryColor || '#8b5cf6'}
                    onChange={(e)=>{
                      const c = e.target.value;
                      setAppearance({ ...appearance, primaryColor: c });
                      // Apply immediately
                      document.documentElement.style.setProperty('--color-primary', c);
                      // Only set --primary in dark mode to ensure buttons are always visible in light mode
                      const isDarkMode = themeMode === 'dark' || (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                      if (isDarkMode) {
                        document.documentElement.style.setProperty('--primary', c);
                      } else {
                        // Light mode: keep default dark purple, don't override with potentially light colors
                        document.documentElement.style.removeProperty('--primary');
                      }
                    }}
                    className="h-10 px-2 rounded-lg border border-input bg-background cursor-pointer"
                  />
                </div>

                {/* Logo CMS */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Logo CMS</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg border border-border bg-muted flex items-center justify-center text-2xl font-bold text-primary overflow-hidden">
                      {appearance.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={appearance.logo_url} 
                          alt="Logo CMS" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Logo image failed to load:', appearance.logo_url);
                            // Try to fix URL if it's malformed
                            const currentUrl = appearance.logo_url;
                            if (currentUrl && !currentUrl.startsWith('http')) {
                              const fixedUrl = getAssetUrl(currentUrl);
                              if (fixedUrl !== currentUrl) {
                                console.log('Retrying logo with fixed URL:', fixedUrl);
                                e.currentTarget.src = fixedUrl;
                              }
                            }
                          }}
                        />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Site logo used across the admin interface and website.</p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setLogoPickerOpen(true)}
                          className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          Choose from Media
                        </button>
                        {appearance.logo_url && (
                          <button
                            onClick={() => handleAssetSelect(null, 'logo')}
                            className="text-sm text-destructive hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Favicon CMS */}
                <div className="border-t border-border pt-4">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Favicon CMS
                  </label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Icon trên tab trình duyệt cho trang admin. Recommended: 32x32px .ico, .png, or .svg
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      {appearance.favicon_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={appearance.favicon_url}
                          alt="Favicon CMS"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Favicon image failed to load:', appearance.favicon_url);
                            console.error('Attempting to fix URL...');
                            // Try to fix URL if it's malformed
                            const currentUrl = appearance.favicon_url;
                            if (currentUrl && !currentUrl.startsWith('http')) {
                              // If relative URL, try with backend base
                              const fixedUrl = getAssetUrl(currentUrl);
                              if (fixedUrl !== currentUrl) {
                                console.log('Retrying with fixed URL:', fixedUrl);
                                e.currentTarget.src = fixedUrl;
                              } else {
                                e.currentTarget.style.display = 'none';
                              }
                            } else {
                              e.currentTarget.style.display = 'none';
                            }
                          }}
                          onLoad={() => {
                            console.log('Favicon loaded successfully:', appearance.favicon_url);
                          }}
                        />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <button 
                        type="button"
                        onClick={() => setFaviconPickerOpen(true)}
                        className="px-4 py-2 rounded-lg border border-input bg-background text-sm hover:bg-accent transition-colors"
                      >
                        Choose from Media
                      </button>
                      {appearance.favicon_url && (
                        <button
                          type="button"
                          onClick={() => handleAssetSelect(null, 'favicon')}
                          className="ml-3 text-sm text-destructive hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Logo Client */}
                <div className="border-t border-border pt-4">
                  <label className="block text-sm font-medium text-foreground mb-2">Logo Client</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg border border-border bg-muted flex items-center justify-center text-2xl font-bold text-primary overflow-hidden">
                      {appearance.ecommerce_logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={appearance.ecommerce_logo_url}
                          alt="Logo Client"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Logo dùng cho website client (ecommerce storefront).
                      </p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setClientLogoPickerOpen(true)}
                          className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          Choose from Media
                        </button>
                        {appearance.ecommerce_logo_url && (
                          <button
                            onClick={() => handleClientAssetSelect(null, 'logo')}
                            className="text-sm text-destructive hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Favicon Client */}
                <div className="border-t border-border pt-4">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Favicon Client
                  </label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Icon trên tab trình duyệt cho website client. Recommended: 32x32px .ico, .png, or .svg
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      {appearance.ecommerce_favicon_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={appearance.ecommerce_favicon_url}
                          alt="Favicon Client"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <button
                        type="button"
                        onClick={() => setClientFaviconPickerOpen(true)}
                        className="px-4 py-2 rounded-lg border border-input bg-background text-sm hover:bg-accent transition-colors"
                      >
                        Choose from Media
                      </button>
                      {appearance.ecommerce_favicon_url && (
                        <button
                          type="button"
                          onClick={() => handleClientAssetSelect(null, 'favicon')}
                          className="ml-3 text-sm text-destructive hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Top Banner Text */}
                <div className="border-t border-border pt-4">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Top Banner Text
                  </label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Nội dung hiển thị trên banner phía trên cùng của website (ecommerce storefront).
                  </p>
                  <textarea
                    value={appearance.topBannerText || ''}
                    onChange={(e) => setAppearance({ ...appearance, topBannerText: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px]"
                    placeholder="Miễn phí vận chuyển cho đơn hàng trên 749.000₫+ | 4.990₫ vận chuyển cho đơn hàng trên 199.000₫+"
                  />
                </div>

                <div className="border-t border-border pt-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Homepage Metrics</h4>
                    <p className="text-xs text-muted-foreground">
                      These stats appear on the homepage to highlight company achievements.
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">Active Customers</label>
                      <input
                        type="text"
                        value={homepageMetrics.activeCustomers || ''}
                        onChange={(e) =>
                          setHomepageMetrics((prev: any) => ({
                            ...prev,
                            activeCustomers: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="e.g., 84,000+"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">Countries Served</label>
                      <input
                        type="text"
                        value={homepageMetrics.countriesServed || ''}
                        onChange={(e) =>
                          setHomepageMetrics((prev: any) => ({
                            ...prev,
                            countriesServed: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="e.g., 47"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">Years in Business</label>
                      <input
                        type="text"
                        value={homepageMetrics.yearsInBusiness || ''}
                        onChange={(e) =>
                          setHomepageMetrics((prev: any) => ({
                            ...prev,
                            yearsInBusiness: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="e.g., 40+"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}


          {activeTab === 'email' && (
            <div className="rounded-lg border border-border bg-card p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-card-foreground mb-4">Email Configuration</h3>
                <p className="text-sm text-muted-foreground mb-4">Configure SMTP settings for sending emails from your CMS</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">Enable Email</p>
                    <p className="text-xs text-muted-foreground mt-1">Enable email sending functionality</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={email.enabled || false}
                      onChange={(e) => setEmail({ ...email, enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">SMTP Host</label>
                  <input
                    type="text"
                    value={email.smtpHost || ''}
                    onChange={(e) => setEmail({ ...email, smtpHost: e.target.value })}
                    placeholder="smtp.example.com"
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    disabled={!email.enabled}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">SMTP Port</label>
                    <input
                      type="number"
                      value={email.smtpPort || 587}
                      onChange={(e) => setEmail({ ...email, smtpPort: parseInt(e.target.value) || 587 })}
                      placeholder="587"
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      disabled={!email.enabled}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Encryption</label>
                    <select
                      value={email.encryption || 'tls'}
                      onChange={(e) => setEmail({ ...email, encryption: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      disabled={!email.enabled}
                    >
                      <option value="tls">TLS</option>
                      <option value="ssl">SSL</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">SMTP Username</label>
                    <input
                      type="text"
                      value={email.username || ''}
                      onChange={(e) => setEmail({ ...email, username: e.target.value })}
                      placeholder="username@example.com"
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      disabled={!email.enabled}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">SMTP Password</label>
                    <input
                      type="password"
                      value={email.password || ''}
                      onChange={(e) => setEmail({ ...email, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      disabled={!email.enabled}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">From Email</label>
                  <input
                    type="email"
                    value={email.fromEmail || ''}
                    onChange={(e) => setEmail({ ...email, fromEmail: e.target.value })}
                    placeholder="noreply@example.com"
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    disabled={!email.enabled}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">From Name</label>
                  <input
                    type="text"
                    value={email.fromName || ''}
                    onChange={(e) => setEmail({ ...email, fromName: e.target.value })}
                    placeholder="PressUp CMS"
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    disabled={!email.enabled}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="rounded-lg border border-border bg-card p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-card-foreground mb-4">Notification Preferences</h3>
                <p className="text-sm text-muted-foreground mb-4">Configure which notifications you want to receive</p>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'newPost', key: 'newPost', label: 'New post published', description: 'Get notified when a new post is published' },
                  { id: 'newUser', key: 'newUser', label: 'New user registration', description: 'Get notified when a new user registers' },
                  { id: 'newComment', key: 'newComment', label: 'New comment', description: 'Get notified when someone comments' },
                  { id: 'systemUpdates', key: 'systemUpdates', label: 'System updates', description: 'Get notified about system updates and maintenance' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications[item.key] !== undefined ? notifications[item.key] : true}
                        onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="rounded-lg border border-border bg-card p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-card-foreground mb-4">Security Settings</h3>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                      <p className="text-xs text-muted-foreground mt-1">Add an extra layer of security to your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={security.twoFactorEnabled || false}
                        onChange={(e) => setSecurity({ ...security, twoFactorEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    value={security.sessionTimeout || 60}
                    onChange={(e) => setSecurity({ ...security, sessionTimeout: parseInt(e.target.value) || 60 })}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="p-4 rounded-lg border border-border">
                  <p className="text-sm font-medium text-foreground mb-3">Password Requirements</p>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={security.passwordPolicy?.minLength >= 8 || false}
                        onChange={(e) => setSecurity({
                          ...security,
                          passwordPolicy: {
                            ...security.passwordPolicy,
                            minLength: e.target.checked ? 8 : 0
                          }
                        })}
                        className="rounded"
                      />
                      Minimum 8 characters
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={security.passwordPolicy?.uppercase || false}
                        onChange={(e) => setSecurity({
                          ...security,
                          passwordPolicy: {
                            ...security.passwordPolicy,
                            uppercase: e.target.checked
                          }
                        })}
                        className="rounded"
                      />
                      Require uppercase letters
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={security.passwordPolicy?.numbers || false}
                        onChange={(e) => setSecurity({
                          ...security,
                          passwordPolicy: {
                            ...security.passwordPolicy,
                            numbers: e.target.checked
                          }
                        })}
                        className="rounded"
                      />
                      Require numbers
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={security.passwordPolicy?.special || false}
                        onChange={(e) => setSecurity({
                          ...security,
                          passwordPolicy: {
                            ...security.passwordPolicy,
                            special: e.target.checked
                          }
                        })}
                        className="rounded"
                      />
                      Require special characters
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="rounded-lg border border-border bg-card p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-card-foreground mb-4">Advanced Settings</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">API Base URL</label>
                  <input
                    type="url"
                    value={advanced.apiBaseUrl || apiBase}
                    onChange={(e) => setAdvanced({ ...advanced, apiBaseUrl: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Cache Strategy</label>
                  <select
                    value={advanced.cacheStrategy || 'memory'}
                    onChange={(e) => setAdvanced({ ...advanced, cacheStrategy: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="memory">Memory</option>
                    <option value="redis">Redis</option>
                    <option value="none">None</option>
                  </select>
                </div>

                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm font-medium text-destructive mb-2">Danger Zone</p>
                  <div className="space-y-2">
                    <button onClick={onClearCache} className="w-full px-4 py-2 rounded-lg border border-destructive text-destructive text-sm hover:bg-destructive hover:text-destructive-foreground transition-colors">
                      Clear Cache
                    </button>
                    <button onClick={onResetDefaults} className="w-full px-4 py-2 rounded-lg border border-destructive text-destructive text-sm hover:bg-destructive hover:text-destructive-foreground transition-colors">
                      Reset to Defaults
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    <MediaPicker
      isOpen={logoPickerOpen}
      onClose={() => setLogoPickerOpen(false)}
      value={appearance.logo_asset_id || ''}
      onChange={(value) => handleAssetSelect((value as string) || null, 'logo')}
      multiple={false}
      modalOnly
    />

    <MediaPicker
      isOpen={faviconPickerOpen}
      onClose={() => setFaviconPickerOpen(false)}
      value={appearance.favicon_asset_id || ''}
      onChange={(value) => handleAssetSelect((value as string) || null, 'favicon')}
      multiple={false}
      modalOnly
    />

    {/* Client (ecommerce) media pickers */}
    <MediaPicker
      isOpen={clientLogoPickerOpen}
      onClose={() => setClientLogoPickerOpen(false)}
      value={appearance.ecommerce_logo_asset_id || ''}
      onChange={(value) => handleClientAssetSelect((value as string) || null, 'logo')}
      multiple={false}
      modalOnly
    />

    <MediaPicker
      isOpen={clientFaviconPickerOpen}
      onClose={() => setClientFaviconPickerOpen(false)}
      value={appearance.ecommerce_favicon_asset_id || ''}
      onChange={(value) => handleClientAssetSelect((value as string) || null, 'favicon')}
      multiple={false}
      modalOnly
    />
    </>
  );
}
