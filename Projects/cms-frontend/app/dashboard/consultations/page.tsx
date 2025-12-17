'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, Trash2, Reply, CheckCircle, Archive, Clock, MapPin } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/api';

interface ConsultationSubmission {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  province: string;
  message: string | null;
  status: 'new' | 'read' | 'replied' | 'archived';
  assigned_to: string | null;
  replied_at: string | null;
  replied_by: string | null;
  reply_message: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
  assigned_to_name?: string;
  replied_by_name?: string;
}

export default function ConsultationsPage() {
  const { user, hydrate } = useAuthStore();
  const [submissions, setSubmissions] = useState<ConsultationSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<ConsultationSubmission | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    if (!user) {
      hydrate().then(() => {
        if (!useAuthStore.getState().user) return (window.location.href = '/login');
        fetchSubmissions();
        setIsInitialized(true);
      });
    } else {
      fetchSubmissions();
      setIsInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce search query
  useEffect(() => {
    if (!isInitialized) return;
    
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchSubmissions();
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Fetch when filters/pagination change
  useEffect(() => {
    if (isInitialized) {
      fetchSubmissions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, statusFilter, provinceFilter]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await axios.get<any>(buildApiUrl('/api/consultations'), {
        params: {
          page: currentPage,
          limit: pageSize,
          status: statusFilter || undefined,
          province: provinceFilter || undefined,
          search: searchQuery || undefined,
          sortBy: 'created_at',
          sortOrder: 'DESC',
        },
        withCredentials: true,
      });
      
      setSubmissions(response.data?.data || []);
      setTotal(response.data?.pagination?.total || 0);
      setTotalPages(response.data?.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch consultation submissions:', error);
      toast.error('Không thể tải yêu cầu tư vấn');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await axios.put(
        buildApiUrl(`/api/consultations/${id}`),
        { status },
        { withCredentials: true }
      );
      toast.success('Cập nhật trạng thái thành công');
      fetchSubmissions();
      if (selectedSubmission?.id === id) {
        setSelectedSubmission({ ...selectedSubmission, status: status as any });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const handleReply = async () => {
    if (!selectedSubmission || !replyMessage.trim()) {
      toast.error('Vui lòng nhập tin nhắn phản hồi');
      return;
    }

    try {
      await axios.put(
        buildApiUrl(`/api/consultations/${selectedSubmission.id}`),
        { reply_message: replyMessage, status: 'replied' },
        { withCredentials: true }
      );
      toast.success('Gửi phản hồi thành công');
      setReplyMessage('');
      setShowDetailModal(false);
      fetchSubmissions();
    } catch (error) {
      console.error('Failed to send reply:', error);
      toast.error('Không thể gửi phản hồi');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa yêu cầu tư vấn này?')) {
      return;
    }

    try {
      await axios.delete(buildApiUrl(`/api/consultations/${id}`), {
        withCredentials: true,
      });
      toast.success('Xóa yêu cầu tư vấn thành công');
      fetchSubmissions();
      if (selectedSubmission?.id === id) {
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error('Failed to delete submission:', error);
      toast.error('Không thể xóa yêu cầu tư vấn');
    }
  };

  const openDetailModal = async (submission: ConsultationSubmission) => {
    setSelectedSubmission(submission);
    setShowDetailModal(true);
    
    // Mark as read if status is 'new'
    if (submission.status === 'new') {
      await handleStatusUpdate(submission.id, 'read');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh', // UTC+7
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      read: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      replied: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      archived: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <Clock className="h-4 w-4" />;
      case 'read':
        return <Eye className="h-4 w-4" />;
      case 'replied':
        return <CheckCircle className="h-4 w-4" />;
      case 'archived':
        return <Archive className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Get unique provinces for filter
  const uniqueProvinces = Array.from(new Set(submissions.map(s => s.province))).sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Yêu cầu tư vấn</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý yêu cầu tư vấn thiết lập thiết bị spa
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, điện thoại, email hoặc tin nhắn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="new">Mới</option>
          <option value="read">Đã đọc</option>
          <option value="replied">Đã trả lời</option>
          <option value="archived">Đã lưu trữ</option>
        </select>

        <select
          value={provinceFilter}
          onChange={(e) => setProvinceFilter(e.target.value)}
          className="px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Tất cả tỉnh/thành</option>
          {uniqueProvinces.map((province) => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </select>

        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="10">10 mỗi trang</option>
          <option value="20">20 mỗi trang</option>
          <option value="50">50 mỗi trang</option>
        </select>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Đang tải yêu cầu tư vấn...</p>
        </div>
      ) : submissions.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="Không tìm thấy yêu cầu tư vấn"
          description="Các yêu cầu tư vấn từ form sẽ xuất hiện ở đây"
        />
      ) : (
        <div className="overflow-hidden border border-border rounded-lg">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Tên</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Điện thoại</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Tỉnh/Thành</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Tin nhắn</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Trạng thái</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Ngày</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {submissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {submission.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{submission.phone}</td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {submission.email || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {submission.province}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    <div className="max-w-xs truncate" title={submission.message || ''}>
                      {submission.message || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)} dark:bg-opacity-20 dark:text-opacity-90`}>
                      {getStatusIcon(submission.status)}
                      {submission.status === 'new' ? 'Mới' : submission.status === 'read' ? 'Đã đọc' : submission.status === 'replied' ? 'Đã trả lời' : 'Đã lưu trữ'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(submission.created_at)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openDetailModal(submission)}
                        className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {submission.status !== 'replied' && (
                        <button
                          onClick={() => handleStatusUpdate(submission.id, 'replied')}
                          className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                          title="Đánh dấu đã trả lời"
                        >
                          <Reply className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(submission.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Hiển thị {(currentPage - 1) * pageSize + 1} đến {Math.min(currentPage * pageSize, total)} trong tổng số {total} yêu cầu
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
            >
              Trước
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-border bg-background text-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Chi tiết yêu cầu tư vấn</h2>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedSubmission(null);
                    setReplyMessage('');
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tên</label>
                  <p className="text-foreground font-medium">{selectedSubmission.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Điện thoại</label>
                  <p className="text-foreground">{selectedSubmission.phone}</p>
                </div>
                {selectedSubmission.email && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-foreground">{selectedSubmission.email}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tỉnh/Thành</label>
                  <p className="text-foreground flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {selectedSubmission.province}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Trạng thái</label>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSubmission.status)} dark:bg-opacity-20 dark:text-opacity-90`}>
                    {getStatusIcon(selectedSubmission.status)}
                    {selectedSubmission.status === 'new' ? 'Mới' : selectedSubmission.status === 'read' ? 'Đã đọc' : selectedSubmission.status === 'replied' ? 'Đã trả lời' : 'Đã lưu trữ'}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ngày</label>
                  <p className="text-foreground">{formatDate(selectedSubmission.created_at)}</p>
                </div>
              </div>

              {/* Message */}
              {selectedSubmission.message && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tin nhắn</label>
                  <div className="mt-2 p-4 bg-muted rounded-lg text-foreground whitespace-pre-wrap">
                    {selectedSubmission.message}
                  </div>
                </div>
              )}

              {/* Existing Reply */}
              {selectedSubmission.reply_message && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phản hồi trước đó</label>
                  <div className="mt-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-foreground whitespace-pre-wrap">
                    {selectedSubmission.reply_message}
                  </div>
                  {selectedSubmission.replied_by_name && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Đã trả lời bởi {selectedSubmission.replied_by_name} vào {selectedSubmission.replied_at ? formatDate(selectedSubmission.replied_at) : ''}
                    </p>
                  )}
                </div>
              )}

              {/* Reply Form */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Tin nhắn phản hồi
                </label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Nhập phản hồi của bạn..."
                />
                <button
                  onClick={handleReply}
                  disabled={!replyMessage.trim()}
                  className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Gửi phản hồi
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-border">
                {selectedSubmission.status !== 'read' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedSubmission.id, 'read')}
                    className="px-4 py-2 border border-border bg-background text-foreground rounded-lg hover:bg-muted"
                  >
                    Đánh dấu đã đọc
                  </button>
                )}
                {selectedSubmission.status !== 'archived' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedSubmission.id, 'archived')}
                    className="px-4 py-2 border border-border bg-background text-foreground rounded-lg hover:bg-muted"
                  >
                    Lưu trữ
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selectedSubmission.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

