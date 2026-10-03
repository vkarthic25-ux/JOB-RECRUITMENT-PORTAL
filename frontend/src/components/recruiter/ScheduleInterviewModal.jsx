import React, { useState } from 'react';
import Modal from '../common/Modal';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Calendar, Clock, Video, MapPin, FileText } from 'lucide-react';

const ScheduleInterviewModal = ({ isOpen, onClose, application, onScheduled }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [mode, setMode] = useState('Online');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/hirematch-interview');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  if (!application) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !time) {
      addToast('Please select both interview date and time.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/interviews', {
        applicationId: application._id,
        date,
        time,
        mode,
        meetingLink: mode === 'Online' ? meetingLink : '',
        location: mode === 'Offline' ? location : '',
        notes,
      });

      if (res.data.success) {
        addToast('Interview scheduled successfully! Candidate notified.', 'success');
        if (onScheduled) onScheduled(res.data.interview);
        onClose();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to schedule interview.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Candidate Interview"
      subtitle={`Candidate: ${application.candidateId?.name || 'Candidate'} | Role: ${application.jobId?.title || 'Job'}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" /> Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" /> Time (e.g. 10:30 AM EST)
            </label>
            <input
              type="text"
              required
              placeholder="10:00 AM PST"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">Interview Mode</label>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setMode('Online')}
              className={`flex-1 py-2 px-3 rounded-xl border text-center font-medium transition ${
                mode === 'Online'
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              Online (Video Call)
            </button>
            <button
              type="button"
              onClick={() => setMode('Offline')}
              className={`flex-1 py-2 px-3 rounded-xl border text-center font-medium transition ${
                mode === 'Offline'
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              Offline (In-Person)
            </button>
          </div>
        </div>

        {mode === 'Online' ? (
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5 flex items-center">
              <Video className="w-3.5 h-3.5 mr-1 text-slate-500" /> Video Meeting Link
            </label>
            <input
              type="url"
              placeholder="https://meet.google.com/..."
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
            />
          </div>
        ) : (
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5 flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" /> Physical Location / Office Address
            </label>
            <input
              type="text"
              placeholder="Floor 4, Conference Room B, HQ"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
            />
          </div>
        )}

        <div>
          <label className="block font-semibold text-slate-700 mb-1.5 flex items-center">
            <FileText className="w-3.5 h-3.5 mr-1 text-slate-500" /> Preparation Notes for Candidate
          </label>
          <textarea
            rows="3"
            placeholder="Please have your portfolio ready and be prepared for a 45-minute technical discussion..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 resize-none"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-sm transition disabled:opacity-50"
          >
            {submitting ? 'Scheduling...' : 'Confirm & Schedule Interview'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ScheduleInterviewModal;
