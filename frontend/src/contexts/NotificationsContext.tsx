import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import apiService from '../services/api';
import { STORAGE_KEYS } from '../constants';

export type NotificationSeverity = 'critical' | 'warning' | 'info' | 'success';
export type NotificationCategory = 'accident' | 'road_closure' | 'construction' | 'congestion' | 'resolved' | 'system';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  category: NotificationCategory;
  city: 'Nairobi' | 'Mombasa' | 'Kisumu' | 'Nakuru' | 'Eldoret' | string;
  location?: string;
  coordinates?: { lat: number; lng: number };
  createdAt: string; // ISO
  read: boolean;
}

interface NotificationsContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  toggleRead: (id: string) => void;
  deleteOne: (id: string) => void;
  markAllAsRead: () => void;
  setCity: (cityId: string) => void;
  cityId: string;
  lastUpdated: string | null;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

const LS_KEY = 'movesmart_notifications_v1';

function toCategoryFromIcon(iconCategory: any, fallbackDesc: string): NotificationCategory {
  const code = Number(iconCategory);
  if (!Number.isNaN(code)) {
    // Basic mapping based on common TomTom icon categories
    if (code === 1 || /accident/i.test(fallbackDesc)) return 'accident';
    if (code === 9 || /closure|closed/i.test(fallbackDesc)) return 'road_closure';
    if (code === 10 || /construction|roadwork/i.test(fallbackDesc)) return 'construction';
    if (code === 12 || /congestion|traffic jam|delay/i.test(fallbackDesc)) return 'congestion';
  }
  // Fallback: infer from description
  const lower = fallbackDesc.toLowerCase();
  if (lower.includes('accident')) return 'accident';
  if (lower.includes('closure') || lower.includes('closed')) return 'road_closure';
  if (lower.includes('construction') || lower.includes('roadworks') || lower.includes('work')) return 'construction';
  if (lower.includes('congestion') || lower.includes('traffic')) return 'congestion';
  return 'system';
}

function toSeverityFromDelay(delay: any): NotificationSeverity {
  const d = Number(delay) || 0;
  if (d >= 900) return 'critical';
  if (d >= 300) return 'warning';
  return 'info';
}

function mapIncidentToNotification(cityId: string, incident: any): NotificationItem {
  const desc: string = incident.description || incident.properties?.description || 'Traffic incident';
  const iconCategory = incident.type ?? incident.properties?.iconCategory;
  const delay = (incident.delay ?? incident.properties?.delay ?? incident.properties?.magnitudeOfDelay ?? 0) as number;

  const category = toCategoryFromIcon(iconCategory, desc);
  const severity = toSeverityFromDelay(delay);

  const coords = incident.location?.coordinates || incident.geometry?.coordinates || [];
  const lat = Array.isArray(coords) ? (coords[1] ?? undefined) : undefined;
  const lng = Array.isArray(coords) ? (coords[0] ?? undefined) : undefined;

  // Prefer TomTom timestamps if available
  const ts = incident.lastReportTime || incident.properties?.lastReportTime || incident.start_time || incident.properties?.startTime;
  const createdAt = ts ? new Date(ts).toISOString() : new Date().toISOString();

  const road = Array.isArray(incident.road_numbers) ? incident.road_numbers.join(', ') : (incident.properties?.roadNumbers || []).join(', ');

  return {
    id: `live-${incident.id ?? iconCategory ?? Math.random().toString(36).slice(2)}`,
    title: category === 'accident' ? 'Accident reported' : category === 'road_closure' ? 'Road closure' : category === 'construction' ? 'Roadworks update' : 'Congestion alert',
    message: desc,
    severity,
    category,
    city: (cityId.charAt(0).toUpperCase() + cityId.slice(1)) as any,
    coordinates: lat != null && lng != null ? { lat, lng } : undefined,
    location: road || undefined,
    createdAt,
    read: false,
  };
}

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const cached = localStorage.getItem(LS_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [cityId, setCity] = useState<string>(() => localStorage.getItem(STORAGE_KEYS.SELECTED_CITY) || 'nairobi');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const mergeNotifications = useCallback((incoming: NotificationItem[]) => {
    setNotifications(prev => {
      const existingById = new Map(prev.map(n => [n.id, n] as const));
      for (const n of incoming) {
        if (!existingById.has(n.id)) {
          existingById.set(n.id, n);
        }
      }
      return Array.from(existingById.values()).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    });
  }, []);

  const pollRef = useRef<number | null>(null);

  const poll = useCallback(async () => {
    try {
      const city = (localStorage.getItem(STORAGE_KEYS.SELECTED_CITY) || cityId).toLowerCase();
      const response = await apiService.getLiveIncidents(city);
      if (response && response.success && Array.isArray(response.data)) {
        const mapped = response.data.map((inc: any) => mapIncidentToNotification(city, inc));
        mergeNotifications(mapped);
        setLastUpdated(new Date().toISOString());
        if (process.env.NODE_ENV !== 'production') {
          console.info(`[Notifications] Polled ${city}: ${mapped.length} items @ ${new Date().toLocaleTimeString()}`);
        }
      }
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[Notifications] Poll failed', e);
      }
    }
  }, [cityId, mergeNotifications]);

  useEffect(() => {
    poll();
    pollRef.current = window.setInterval(poll, 10000); // 10s while developing
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [poll]);

  const markAsRead = (id: string) => setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  const toggleRead = (id: string) => setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: !n.read } : n)));
  const deleteOne = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));
  const markAllAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const value: NotificationsContextValue = {
    notifications,
    unreadCount,
    markAsRead,
    toggleRead,
    deleteOne,
    markAllAsRead,
    setCity,
    cityId,
    lastUpdated,
  };

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
} 