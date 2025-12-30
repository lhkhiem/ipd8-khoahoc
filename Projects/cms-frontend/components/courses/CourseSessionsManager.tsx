'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, Clock, Users, MapPin, Video } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { buildApiUrl } from '@/lib/api';
import RichTextEditor from '@/components/RichTextEditor';

interface Session {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  capacity: number;
  enrolled_count: number;
  instructor_id?: string;
  meeting_link?: string;
  meeting_type?: 'google-meet' | 'zoom' | 'offline';
  status: 'scheduled' | 'full' | 'cancelled' | 'done';
  order?: number;
  created_at: string;
  updated_at: string;
}

interface Instructor {
  id: string;
  title: string;
  credentials: string;
}

interface CourseSessionsManagerProps {
  courseId: string;
}

export default function CourseSessionsManager({ courseId }: CourseSessionsManagerProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState(10);
  const [instructorId, setInstructorId] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingType, setMeetingType] = useState<'google-meet' | 'zoom' | 'offline'>('google-meet');

  useEffect(() => {
    fetchSessions();
    fetchInstructors();
  }, [courseId]);

  const fetchSessions = async () => {
    try {
      const response = await axios.get(buildApiUrl(`/api/courses/${courseId}/sessions`), {
        withCredentials: true,
      });
      if (response.data?.data) {
        setSessions(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      toast.error('Không thể tải danh sách sessions');
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await axios.get(buildApiUrl('/api/instructors'), {
        withCredentials: true,
      });
      if (response.data?.data) {
        setInstructors(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch instructors:', error);
    }
  };

  const openCreate = () => {
    setEditingSession(null);
    setTitle('');
    setDescription('');
    setStartTime('');
    setEndTime('');
    setLocation('');
    setCapacity(10);
    setInstructorId('');
    setMeetingLink('');
    setMeetingType('google-meet');
    setShowDialog(true);
  };

  const openEdit = (session: Session) => {
    setEditingSession(session);
    setTitle(session.title);
    setDescription(session.description || '');
    setStartTime(new Date(session.start_time).toISOString().slice(0, 16));
    setEndTime(new Date(session.end_time).toISOString().slice(0, 16));
    setLocation(session.location || '');
    setCapacity(session.capacity);
    setInstructorId(session.instructor_id || '');
    setMeetingLink(session.meeting_link || '');
    setMeetingType(session.meeting_type || 'google-meet');
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startTime || !endTime) {
      toast.error('Tiêu đề, thời gian bắt đầu và kết thúc là bắt buộc');
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      toast.error('Thời gian kết thúc phải sau thời gian bắt đầu');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        location: location.trim() || null,
        capacity: capacity || 10,
        instructor_id: instructorId || null,
        meeting_link: meetingLink.trim() || null,
        meeting_type: meetingType,
      };

      if (editingSession) {
        await axios.put(
          buildApiUrl(`/api/courses/${courseId}/sessions/${editingSession.id}`),
          payload,
          { withCredentials: true }
        );
        toast.success('Session đã được cập nhật');
      } else {
        await axios.post(
          buildApiUrl(`/api/courses/${courseId}/sessions`),
          payload,
          { withCredentials: true }
        );
        toast.success('Session đã được tạo');
      }

      setShowDialog(false);
      fetchSessions();
    } catch (error: any) {
      console.error('Failed to save session:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Không thể lưu session';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa session này?')) return;

    try {
      await axios.delete(buildApiUrl(`/api/courses/${courseId}/sessions/${sessionId}`), {
        withCredentials: true,
      });
      toast.success('Session đã được xóa');
      fetchSessions();
    } catch (error: any) {
      console.error('Failed to delete session:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Không thể xóa session';
      toast.error(errorMessage);
    }
  };

  const handleUpdateStatus = async (sessionId: string, status: Session['status']) => {
    try {
      await axios.put(
        buildApiUrl(`/api/courses/${courseId}/sessions/${sessionId}/status`),
        { status },
        { withCredentials: true }
      );
      toast.success('Trạng thái session đã được cập nhật');
      fetchSessions();
    } catch (error: any) {
      console.error('Failed to update status:', error);
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: Session['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'full':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      case 'done':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: Session['status']) => {
    switch (status) {
      case 'scheduled':
        return 'Đã lên lịch';
      case 'full':
        return 'Đã đầy';
      case 'cancelled':
        return 'Đã hủy';
      case 'done':
        return 'Đã hoàn thành';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quản lý Lịch học</h2>
          <p className="text-muted-foreground">
            Tổng số: {sessions.length} sessions
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Thêm Session
        </button>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground mb-4">Chưa có sessions nào</p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Thêm Session đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="group rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h3 className="font-semibold text-card-foreground">
                      {session.title}
                    </h3>
                    <span className={`rounded px-2 py-1 text-xs font-medium ${getStatusColor(session.status)}`}>
                      {getStatusLabel(session.status)}
                    </span>
                  </div>
                  
                  {session.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {session.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDateTime(session.start_time)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Đến {formatDateTime(session.end_time)}</span>
                    </div>
                    {session.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{session.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>
                        {session.enrolled_count}/{session.capacity} người
                      </span>
                    </div>
                    {session.meeting_link && (
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        <a
                          href={session.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Link meeting
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="ml-4 flex flex-col items-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex items-center gap-2">
                    <select
                      value={session.status}
                      onChange={(e) => handleUpdateStatus(session.id, e.target.value as Session['status'])}
                      className="rounded-lg border border-border bg-background px-2 py-1 text-xs"
                    >
                      <option value="scheduled">Đã lên lịch</option>
                      <option value="full">Đã đầy</option>
                      <option value="cancelled">Đã hủy</option>
                      <option value="done">Đã hoàn thành</option>
                    </select>
                    <button
                      onClick={() => openEdit(session)}
                      className="rounded-lg border border-border bg-background p-2 hover:bg-accent"
                      title="Chỉnh sửa"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(session.id)}
                      className="rounded-lg border border-border bg-background p-2 hover:bg-accent text-red-600"
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg border border-border bg-card p-6 shadow-lg max-h-[90vh] overflow-y-auto">
            <h3 className="mb-4 text-lg font-semibold">
              {editingSession ? 'Chỉnh sửa Session' : 'Tạo Session mới'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Nhập tiêu đề session"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Mô tả</label>
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Nhập mô tả session (tùy chọn)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Thời gian bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Thời gian kết thúc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Địa điểm</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Online hoặc địa chỉ"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Sức chứa</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Giảng viên</label>
                  <select
                    value={instructorId}
                    onChange={(e) => setInstructorId(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Chọn giảng viên</option>
                    {instructors.map((instructor) => (
                      <option key={instructor.id} value={instructor.id}>
                        {instructor.title} - {instructor.credentials}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Loại meeting</label>
                  <select
                    value={meetingType}
                    onChange={(e) => setMeetingType(e.target.value as 'google-meet' | 'zoom' | 'offline')}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="google-meet">Google Meet</option>
                    <option value="zoom">Zoom</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Meeting Link</label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://meet.google.com/..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDialog(false)}
                  className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : editingSession ? 'Cập nhật' : 'Tạo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

