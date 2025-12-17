'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Eye, Filter, Mail, Trash2, Reply, CheckCircle, Archive, Clock } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/api';

interface ContactMessage {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
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

export default function ContactsPage() {
  const { user, hydrate } = useAuthStore();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    if (!user) {
      hydrate().then(() => {
        if (!useAuthStore.getState().user) return (window.location.href = '/login');
        fetchMessages();
        setIsInitialized(true);
      });
    } else {
      fetchMessages();
      setIsInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce search query
  useEffect(() => {
    if (!isInitialized) return;
    
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchMessages();
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Fetch when filters/pagination change
  useEffect(() => {
    if (isInitialized) {
      fetchMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, statusFilter, subjectFilter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.get<any>(buildApiUrl('/api/contacts'), {
        params: {
          page: currentPage,
          limit: pageSize,
          status: statusFilter || undefined,
          subject: subjectFilter || undefined,
          search: searchQuery || undefined,
          sortBy: 'created_at',
          sortOrder: 'DESC',
        },
        withCredentials: true,
      });
      
      setMessages(response.data?.data || []);
      setTotal(response.data?.pagination?.total || 0);
      setTotalPages(response.data?.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch contact messages:', error);
      toast.error('Không thể tải tin nhắn liên hệ');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await axios.put(
        buildApiUrl(`/api/contacts/${id}`),
        { status },
        { withCredentials: true }
      );
      toast.success('Cập nhật trạng thái thành công');
      fetchMessages();
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, status: status as any });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyMessage.trim()) {
      toast.error('Vui lòng nhập tin nhắn phản hồi');
      return;
    }

    try {
      await axios.put(
        buildApiUrl(`/api/contacts/${selectedMessage.id}`),
        { reply_message: replyMessage, status: 'replied' },
        { withCredentials: true }
      );
      toast.success('Gửi phản hồi thành công');
      setReplyMessage('');
      setShowDetailModal(false);
      fetchMessages();
    } catch (error) {
      console.error('Failed to send reply:', error);
      toast.error('Không thể gửi phản hồi');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tin nhắn này?')) {
      return;
    }

    try {
      await axios.delete(buildApiUrl(`/api/contacts/${id}`), {
        withCredentials: true,
      });
      toast.success('Xóa tin nhắn thành công');
      fetchMessages();
      if (selectedMessage?.id === id) {
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
      toast.error('Không thể xóa tin nhắn');
    }
  };

  const openDetailModal = async (message: ContactMessage) => {
    setSelectedMessage(message);
    setShowDetailModal(true);
    
    // Mark as read if status is 'new'
    if (message.status === 'new') {
      await handleStatusUpdate(message.id, 'read');
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
        return <Mail className="h-4 w-4" />;
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

  const getSubjectLabel = (subject: string) => {
    const labels: Record<string, string> = {
      product: 'Tư vấn sản phẩm',
      order: 'Tình trạng đơn hàng',
      support: 'Hỗ trợ kỹ thuật',
      'spa-development': 'Dịch vụ phát triển Spa',
      partnership: 'Cơ hội hợp tác',
      other: 'Khác',
    };
    return labels[subject] || subject;
  };

  const filteredMessages = messages;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tin nhắn liên hệ</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý yêu cầu và hỗ trợ khách hàng
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
              placeholder="Tìm kiếm theo tên, email hoặc tin nhắn..."
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
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Tất cả chủ đề</option>
          <option value="product">Tư vấn sản phẩm</option>
          <option value="order">Tình trạng đơn hàng</option>
          <option value="support">Hỗ trợ kỹ thuật</option>
          <option value="spa-development">Dịch vụ phát triển Spa</option>
          <option value="partnership">Cơ hội hợp tác</option>
          <option value="other">Khác</option>
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

      {/* Messages List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Đang tải tin nhắn...</p>
        </div>
      ) : filteredMessages.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="Không tìm thấy tin nhắn liên hệ"
          description="Các tin nhắn từ form liên hệ sẽ xuất hiện ở đây"
        />
      ) : (
        <div className="overflow-hidden border border-border rounded-lg">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Tên</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Chủ đề</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Tin nhắn</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Trạng thái</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Ngày</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredMessages.map((message) => (
                <tr key={message.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm">
                    <div className="font-medium text-foreground">
                      {message.first_name} {message.last_name}
                    </div>
                    {message.phone && (
                      <div className="text-xs text-muted-foreground">{message.phone}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{message.email}</td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {getSubjectLabel(message.subject)}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    <div className="max-w-xs truncate" title={message.message}>
                      {message.message}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)} dark:bg-opacity-20 dark:text-opacity-90`}>
                      {getStatusIcon(message.status)}
                      {message.status === 'new' ? 'Mới' : message.status === 'read' ? 'Đã đọc' : message.status === 'replied' ? 'Đã trả lời' : 'Đã lưu trữ'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(message.created_at)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openDetailModal(message)}
                        className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {message.status !== 'replied' && (
                        <button
                          onClick={() => handleStatusUpdate(message.id, 'replied')}
                          className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                          title="Đánh dấu đã trả lời"
                        >
                          <Reply className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(message.id)}
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
            Hiển thị {(currentPage - 1) * pageSize + 1} đến {Math.min(currentPage * pageSize, total)} trong tổng số {total} tin nhắn
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
              className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Chi tiết tin nhắn liên hệ</h2>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedMessage(null);
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
                  <p className="text-foreground font-medium">
                    {selectedMessage.first_name} {selectedMessage.last_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-foreground">{selectedMessage.email}</p>
                </div>
                {selectedMessage.phone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Điện thoại</label>
                    <p className="text-foreground">{selectedMessage.phone}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Chủ đề</label>
                  <p className="text-foreground">{getSubjectLabel(selectedMessage.subject)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Trạng thái</label>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedMessage.status)} dark:bg-opacity-20 dark:text-opacity-90`}>
                    {getStatusIcon(selectedMessage.status)}
                    {selectedMessage.status === 'new' ? 'Mới' : selectedMessage.status === 'read' ? 'Đã đọc' : selectedMessage.status === 'replied' ? 'Đã trả lời' : 'Đã lưu trữ'}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ngày</label>
                  <p className="text-foreground">{formatDate(selectedMessage.created_at)}</p>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tin nhắn</label>
                <div className="mt-2 p-4 bg-muted rounded-lg text-foreground whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Existing Reply */}
              {selectedMessage.reply_message && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phản hồi trước đó</label>
                  <div className="mt-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-foreground whitespace-pre-wrap">
                    {selectedMessage.reply_message}
                  </div>
                  {selectedMessage.replied_by_name && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Đã trả lời bởi {selectedMessage.replied_by_name} vào {selectedMessage.replied_at ? formatDate(selectedMessage.replied_at) : ''}
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
                {selectedMessage.status !== 'read' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedMessage.id, 'read')}
                    className="px-4 py-2 border border-border bg-background text-foreground rounded-lg hover:bg-muted"
                  >
                    Đánh dấu đã đọc
                  </button>
                )}
                {selectedMessage.status !== 'archived' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedMessage.id, 'archived')}
                    className="px-4 py-2 border border-border bg-background text-foreground rounded-lg hover:bg-muted"
                  >
                    Lưu trữ
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selectedMessage.id)}
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







