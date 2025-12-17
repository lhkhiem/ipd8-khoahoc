'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Eye, EyeOff, ChevronUp, ChevronDown, HelpCircle, FolderOpen } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { buildApiUrl } from '@/lib/api';
import { generateSlug } from '@/lib/slug';
import { toast } from 'sonner';

interface FAQCategory {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface FAQQuestion {
  id: string;
  category_id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface CategoryForm {
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
}

interface QuestionForm {
  category_id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
}

const DEFAULT_CATEGORY_FORM: CategoryForm = {
  name: '',
  slug: '',
  sort_order: 0,
  is_active: true,
};

const DEFAULT_QUESTION_FORM: QuestionForm = {
  category_id: '',
  question: '',
  answer: '',
  sort_order: 0,
  is_active: true,
};

export default function FAQsPage() {
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [questions, setQuestions] = useState<FAQQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FAQCategory | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<FAQQuestion | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(DEFAULT_CATEGORY_FORM);
  const [questionForm, setQuestionForm] = useState<QuestionForm>(DEFAULT_QUESTION_FORM);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, questionsRes] = await Promise.all([
        axios.get<{ data: FAQCategory[] }>(buildApiUrl('/api/faqs/categories'), {
          withCredentials: true,
        }),
        axios.get<{ data: FAQQuestion[] }>(buildApiUrl('/api/faqs/questions'), {
          withCredentials: true,
        }),
      ]);
      setCategories(categoriesRes.data?.data || []);
      setQuestions(questionsRes.data?.data || []);
    } catch (error) {
      console.error('[FAQsPage] Fetch failed:', error);
      toast.error('Không thể tải dữ liệu FAQ');
    } finally {
      setLoading(false);
    }
  };

  const sortedCategories = [...categories].sort(
    (a, b) => a.sort_order - b.sort_order || (a.created_at || '').localeCompare(b.created_at || '')
  );

  const getQuestionsForCategory = (categoryId: string) => {
    return [...questions]
      .filter((q) => q.category_id === categoryId)
      .sort((a, b) => a.sort_order - b.sort_order || (a.created_at || '').localeCompare(b.created_at || ''));
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Category handlers
  const openCreateCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      ...DEFAULT_CATEGORY_FORM,
      sort_order: categories.length,
    });
    setSlugManuallyEdited(false);
    setShowCategoryDialog(true);
  };

  const openEditCategory = (category: FAQCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      sort_order: category.sort_order ?? 0,
      is_active: category.is_active,
    });
    setSlugManuallyEdited(false);
    setShowCategoryDialog(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    try {
      const payload = {
        name: categoryForm.name.trim(),
        slug: categoryForm.slug.trim(),
        sort_order: Number.isFinite(categoryForm.sort_order) ? categoryForm.sort_order : 0,
        is_active: categoryForm.is_active,
      };

      if (editingCategory) {
        await axios.put(buildApiUrl(`/api/faqs/categories/${editingCategory.id}`), payload, {
          withCredentials: true,
        });
        toast.success('Cập nhật danh mục thành công');
      } else {
        await axios.post(buildApiUrl('/api/faqs/categories'), payload, {
          withCredentials: true,
        });
        toast.success('Tạo danh mục thành công');
      }
      setShowCategoryDialog(false);
      fetchData();
    } catch (error: any) {
      console.error('[FAQsPage] Category save failed:', error);
      const message = error.response?.data?.error || error.message || 'Không thể lưu danh mục';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này? Tất cả câu hỏi trong danh mục sẽ bị xóa.')) return;
    try {
      await axios.delete(buildApiUrl(`/api/faqs/categories/${id}`), {
        withCredentials: true,
      });
      toast.success('Xóa danh mục thành công');
      fetchData();
    } catch (error: any) {
      console.error('[FAQsPage] Delete category failed:', error);
      const message = error.response?.data?.error || error.message || 'Không thể xóa danh mục';
      toast.error(message);
    }
  };

  // Question handlers
  const openCreateQuestion = (categoryId?: string) => {
    setEditingQuestion(null);
    setQuestionForm({
      ...DEFAULT_QUESTION_FORM,
      category_id: categoryId || categories[0]?.id || '',
      sort_order: questions.filter((q) => q.category_id === (categoryId || categories[0]?.id || '')).length,
    });
    setShowQuestionDialog(true);
  };

  const openEditQuestion = (question: FAQQuestion) => {
    setEditingQuestion(question);
    setQuestionForm({
      category_id: question.category_id,
      question: question.question,
      answer: question.answer,
      sort_order: question.sort_order ?? 0,
      is_active: question.is_active,
    });
    setShowQuestionDialog(true);
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    try {
      const payload = {
        category_id: questionForm.category_id,
        question: questionForm.question.trim(),
        answer: questionForm.answer.trim(),
        sort_order: Number.isFinite(questionForm.sort_order) ? questionForm.sort_order : 0,
        is_active: questionForm.is_active,
      };

      if (editingQuestion) {
        await axios.put(buildApiUrl(`/api/faqs/questions/${editingQuestion.id}`), payload, {
          withCredentials: true,
        });
        toast.success('Cập nhật câu hỏi thành công');
      } else {
        await axios.post(buildApiUrl('/api/faqs/questions'), payload, {
          withCredentials: true,
        });
        toast.success('Tạo câu hỏi thành công');
      }
      setShowQuestionDialog(false);
      fetchData();
    } catch (error: any) {
      console.error('[FAQsPage] Question save failed:', error);
      const message = error.response?.data?.error || error.message || 'Không thể lưu câu hỏi';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return;
    try {
      await axios.delete(buildApiUrl(`/api/faqs/questions/${id}`), {
        withCredentials: true,
      });
      toast.success('Xóa câu hỏi thành công');
      fetchData();
    } catch (error) {
      console.error('[FAQsPage] Delete question failed:', error);
      toast.error('Không thể xóa câu hỏi');
    }
  };

  const handleToggleActive = async (item: FAQCategory | FAQQuestion, type: 'category' | 'question') => {
    try {
      const endpoint = type === 'category' ? `/api/faqs/categories/${item.id}` : `/api/faqs/questions/${item.id}`;
      await axios.put(
        buildApiUrl(endpoint),
        {
          ...(type === 'category'
            ? { name: (item as FAQCategory).name, slug: (item as FAQCategory).slug }
            : {
                category_id: (item as FAQQuestion).category_id,
                question: (item as FAQQuestion).question,
                answer: (item as FAQQuestion).answer,
              }),
          sort_order: item.sort_order,
          is_active: !item.is_active,
        },
        { withCredentials: true }
      );
      fetchData();
    } catch (error) {
      console.error('[FAQsPage] Toggle failed:', error);
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý FAQ</h1>
          <p className="text-sm text-muted-foreground">Quản lý danh mục và câu hỏi thường gặp.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openCreateQuestion()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Thêm câu hỏi
          </button>
          <button
            onClick={openCreateCategory}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Thêm danh mục
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
        </div>
      ) : sortedCategories.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="Chưa có danh mục FAQ nào"
          description="Tạo danh mục đầu tiên để bắt đầu quản lý câu hỏi thường gặp."
        />
      ) : (
        <div className="space-y-4">
          {sortedCategories.map((category) => {
            const categoryQuestions = getQuestionsForCategory(category.id);
            const isExpanded = expandedCategories.has(category.id);

            return (
              <div key={category.id} className="rounded-lg border border-border bg-card shadow-sm">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <FolderOpen className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold text-foreground">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {categoryQuestions.length} câu hỏi • Slug: {category.slug}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleActive(category, 'category');
                      }}
                      className="rounded p-2 text-muted-foreground hover:text-foreground"
                      title={category.is_active ? 'Hủy kích hoạt' : 'Kích hoạt'}
                    >
                      {category.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditCategory(category);
                      }}
                      className="rounded p-2 text-primary hover:bg-primary/10"
                      title="Chỉnh sửa"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(category.id);
                      }}
                      className="rounded p-2 text-destructive hover:bg-destructive/10"
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openCreateQuestion(category.id);
                      }}
                      className="ml-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      <Plus className="h-3 w-3 inline mr-1" />
                      Thêm câu hỏi
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border p-4 space-y-3">
                    {categoryQuestions.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Chưa có câu hỏi nào trong danh mục này.</p>
                    ) : (
                      categoryQuestions.map((question) => (
                        <div key={question.id} className="rounded-lg border border-border bg-background p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground mb-2">{question.question}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-2">{question.answer}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleActive(question, 'question')}
                                className="rounded p-2 text-muted-foreground hover:text-foreground"
                                title={question.is_active ? 'Hủy kích hoạt' : 'Kích hoạt'}
                              >
                                {question.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={() => openEditQuestion(question)}
                                className="rounded p-2 text-primary hover:bg-primary/10"
                                title="Chỉnh sửa"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(question.id)}
                                className="rounded p-2 text-destructive hover:bg-destructive/10"
                                title="Xóa"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Category Dialog */}
      {showCategoryDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowCategoryDialog(false)}
        >
          <div
            className="w-full max-w-xl rounded-lg bg-card border border-border p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              {editingCategory ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'}
            </h3>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Tên danh mục <span className="text-destructive">*</span>
                </label>
                <input
                  className="w-full rounded border border-input bg-background text-foreground px-3 py-2"
                  value={categoryForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setCategoryForm({
                      ...categoryForm,
                      name,
                      slug: slugManuallyEdited ? categoryForm.slug : generateSlug(name),
                    });
                  }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Slug <span className="text-destructive">*</span>
                </label>
                <input
                  className="w-full rounded border border-input bg-background text-foreground px-3 py-2"
                  value={categoryForm.slug}
                  onChange={(e) => {
                    setSlugManuallyEdited(true);
                    setCategoryForm({ ...categoryForm, slug: e.target.value });
                  }}
                  required
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Thứ tự</label>
                  <input
                    type="number"
                    min={0}
                    className="w-full rounded border border-input bg-background text-foreground px-3 py-2"
                    value={categoryForm.sort_order}
                    onChange={(e) => setCategoryForm({ ...categoryForm, sort_order: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    id="category-active"
                    type="checkbox"
                    checked={categoryForm.is_active}
                    onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <label htmlFor="category-active" className="text-sm text-foreground">Hoạt động</label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryDialog(false)}
                  className="rounded-lg border border-input bg-background text-foreground px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  {saving ? 'Đang lưu…' : editingCategory ? 'Cập nhật' : 'Tạo danh mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Question Dialog */}
      {showQuestionDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowQuestionDialog(false)}
        >
          <div
            className="w-full max-w-2xl rounded-lg bg-card border border-border p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              {editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Tạo câu hỏi mới'}
            </h3>
            <form onSubmit={handleQuestionSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Danh mục <span className="text-destructive">*</span>
                </label>
                <select
                  className="w-full rounded border border-input bg-background text-foreground px-3 py-2"
                  value={questionForm.category_id}
                  onChange={(e) => setQuestionForm({ ...questionForm, category_id: e.target.value })}
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Câu hỏi <span className="text-destructive">*</span>
                </label>
                <textarea
                  className="w-full rounded border border-input bg-background text-foreground px-3 py-2 min-h-[80px]"
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Câu trả lời <span className="text-destructive">*</span>
                </label>
                <textarea
                  className="w-full rounded border border-input bg-background text-foreground px-3 py-2 min-h-[120px]"
                  value={questionForm.answer}
                  onChange={(e) => setQuestionForm({ ...questionForm, answer: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Thứ tự</label>
                  <input
                    type="number"
                    min={0}
                    className="w-full rounded border border-input bg-background text-foreground px-3 py-2"
                    value={questionForm.sort_order}
                    onChange={(e) => setQuestionForm({ ...questionForm, sort_order: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    id="question-active"
                    type="checkbox"
                    checked={questionForm.is_active}
                    onChange={(e) => setQuestionForm({ ...questionForm, is_active: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <label htmlFor="question-active" className="text-sm text-foreground">Hoạt động</label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuestionDialog(false)}
                  className="rounded-lg border border-input bg-background text-foreground px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  {saving ? 'Đang lưu…' : editingQuestion ? 'Cập nhật' : 'Tạo câu hỏi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}




