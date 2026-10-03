import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Bell, CheckCheck, Calendar, Send, Info, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const markSingleRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(
        notifications.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <LoadingSpinner text="Retrieving notifications..." size="lg" />;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Notifications Center
          </h2>
          <p className="text-xs text-slate-500">
            Real-time updates regarding application screenings, interviews, and status alerts
          </p>
        </div>

        {notifications.some((n) => !n.read) && (
          <button
            onClick={markAllRead}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center transition"
          >
            <CheckCheck className="w-4 h-4 mr-1" /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No Notifications"
          description="You are fully up to date! System alerts, shortlisting notices, and interview schedules will appear here."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => markSingleRead(notif._id)}
              className={`p-5 rounded-2xl border transition flex items-start space-x-3.5 ${
                notif.read
                  ? 'bg-white border-slate-200/80 text-slate-700'
                  : 'bg-indigo-50/50 border-indigo-200 shadow-sm text-slate-900 font-medium'
              }`}
            >
              <div
                className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
                  notif.type === 'interview'
                    ? 'bg-emerald-100 text-emerald-700'
                    : notif.type === 'application'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {notif.type === 'interview' && <Calendar className="w-4 h-4" />}
                {notif.type === 'application' && <Send className="w-4 h-4" />}
                {notif.type === 'system' && <Info className="w-4 h-4" />}
              </div>

              <div className="flex-1 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">{notif.title}</h4>
                  <span className="text-[10px] text-slate-400">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">{notif.message}</p>
                {notif.link && (
                  <div className="pt-1">
                    <Link
                      to={notif.link}
                      className="text-indigo-600 hover:underline font-bold text-[11px] inline-flex items-center"
                    >
                      View Details <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
