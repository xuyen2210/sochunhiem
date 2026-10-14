import React, { useState, useMemo, useEffect } from 'react';
import {
  Award,
  AlertTriangle,
  Plus,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  Search,
  CheckCircle2,
  Edit2,
  Trash2,
  Filter,
  Eye,
  EyeOff,
  User,
  GraduationCap,
  X,
  Clock,
  Download,
  Settings,
  Star,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Medal,
  Sliders,
  RotateCcw,
  BookOpen,
  ShieldAlert,
  ChevronRight,
  Info,
  Check,
  FileSpreadsheet,
  ExternalLink,
} from 'lucide-react';
import { Behavior, ClassInfo, EmulationCriterion, EmulationScaleConfig, Student } from '../../core/types';
import {
  computeEmulationRankings,
  DEFAULT_CRITERIA,
  DEFAULT_SCALE_CONFIG,
  exportEmulationRankingsCSV,
  exportEmulationRankingsExcel,
  exportEmulationRecordsCSV,
  exportEmulationRecordsExcel,
  loadEmulationCriteria,
  loadScaleConfig,
  saveEmulationCriteria,
  saveScaleConfig,
  StudentEmulationItem,
} from '../../utils/emulationHelper';
import {
  getAccessToken,
  googleSignIn,
  exportEmulationToGoogleSheet,
} from '../../services/googleWorkspace';

interface AdminBehaviorsProps {
  behaviors: Behavior[];
  students: Student[];
  classes: ClassInfo[];
  currentClassId: string;
  onAddBehavior: (data: Omit<Behavior, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateBehavior: (id: string, data: Partial<Behavior>) => Promise<void>;
  onDeleteBehavior: (id: string) => Promise<void>;
}

export const AdminBehaviors: React.FC<AdminBehaviorsProps> = ({
  behaviors,
  students,
  classes,
  currentClassId,
  onAddBehavior,
  onUpdateBehavior,
  onDeleteBehavior,
}) => {
  // Navigation tabs: 'rankings' (Xếp loại theo thanh điểm) | 'records' (Sổ ghi nhận thi đua) | 'criteria' (Quản lý tiêu chí)
  const [activeTab, setActiveTab] = useState<'rankings' | 'records' | 'criteria'>('rankings');

  // Filters
  const [filterClassId, setFilterClassId] = useState<string>(currentClassId || 'all');
  const [filterType, setFilterType] = useState<'all' | 'PRAISE' | 'WARN'>('all');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('month');
  const [customFrom, setCustomFrom] = useState('2026-10-01');
  const [customTo, setCustomTo] = useState('2026-10-31');
  const [searchTerm, setSearchTerm] = useState('');

  // Criteria & Scale Config state
  const [criteria, setCriteria] = useState<EmulationCriterion[]>(() => loadEmulationCriteria());
  const [scaleConfig, setScaleConfig] = useState<EmulationScaleConfig>(() => loadScaleConfig());

  // Modals
  const [isBehaviorModalOpen, setIsBehaviorModalOpen] = useState(false);
  const [editingBehavior, setEditingBehavior] = useState<Behavior | null>(null);

  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false);
  const [editingCriterion, setEditingCriterion] = useState<EmulationCriterion | null>(null);

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [tempScaleConfig, setTempScaleConfig] = useState<EmulationScaleConfig>(scaleConfig);

  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<StudentEmulationItem | null>(null);

  // Form states for Behavior (Ghi điểm thi đua)
  const [formStudentId, setFormStudentId] = useState<string>(students[0]?.id || '');
  const [formType, setFormType] = useState<'PRAISE' | 'WARN'>('PRAISE');
  const [formContent, setFormContent] = useState('');
  const [formPoints, setFormPoints] = useState<number>(5);
  const [formDate, setFormDate] = useState('2026-10-07');
  const [formIsSensitive, setFormIsSensitive] = useState(false);
  const [selectedCriterionId, setSelectedCriterionId] = useState<string>('');

  // Form states for Criteria (Tiêu chí thi đua)
  const [critCode, setCritCode] = useState('');
  const [critTitle, setCritTitle] = useState('');
  const [critCategory, setCritCategory] = useState('Học tập & Chuyên môn');
  const [critType, setCritType] = useState<'PRAISE' | 'WARN'>('PRAISE');
  const [critPoints, setCritPoints] = useState<number>(5);
  const [critDesc, setCritDesc] = useState('');

  // UI feedback & processing states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter criteria category
  const [critFilterCategory, setCritFilterCategory] = useState<string>('all');
  const [critFilterType, setCritFilterType] = useState<'all' | 'PRAISE' | 'WARN'>('all');
  const [critSearch, setCritSearch] = useState('');

  // Persist criteria & scaleConfig
  const updateAndSaveCriteria = (newCriteria: EmulationCriterion[]) => {
    setCriteria(newCriteria);
    saveEmulationCriteria(newCriteria);
  };

  const updateAndSaveScaleConfig = (newConfig: EmulationScaleConfig) => {
    setScaleConfig(newConfig);
    saveScaleConfig(newConfig);
  };

  const showFeedback = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Compute rankings & stats dynamically
  const { list: rankedStudents, stats } = useMemo(() => {
    return computeEmulationRankings(
      students,
      behaviors,
      scaleConfig,
      filterClassId,
      timeFilter,
      customFrom,
      customTo
    );
  }, [students, behaviors, scaleConfig, filterClassId, timeFilter, customFrom, customTo]);

  // Filtered students for display on ranking table
  const displayedRankedStudents = useMemo(() => {
    return rankedStudents.filter((item) => {
      // Tier filter
      if (filterTier !== 'all' && item.tier.id !== filterTier) return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = item.studentName.toLowerCase().includes(q);
        const matchesCode = item.studentCode.toLowerCase().includes(q);
        return matchesName || matchesCode;
      }
      return true;
    });
  }, [rankedStudents, filterTier, searchTerm]);

  // Filter behaviors list for Records tab
  const filteredBehaviors = useMemo(() => {
    return behaviors.filter((b) => {
      // Class filter
      const student = students.find((s) => s.id === b.studentId);
      if (filterClassId !== 'all') {
        const bClassId = b.classId || student?.classId;
        if (bClassId !== filterClassId) return false;
      }

      // Type filter
      const normalizedType = String(b.type).toUpperCase();
      if (filterType === 'PRAISE') {
        if (normalizedType !== 'PRAISE') return false;
      } else if (filterType === 'WARN') {
        if (normalizedType !== 'WARN' && normalizedType !== 'WARNING' && normalizedType !== 'VIOLATION') return false;
      }

      // Time filter
      if (timeFilter === 'today') {
        if (b.date !== '2026-10-07') return false;
      } else if (timeFilter === 'week') {
        if (b.date < '2026-10-05' || b.date > '2026-10-11') return false;
      } else if (timeFilter === 'month') {
        if (!b.date.startsWith('2026-10')) return false;
      } else if (timeFilter === 'custom') {
        if (customFrom && b.date < customFrom) return false;
        if (customTo && b.date > customTo) return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const sName = (b.studentName || student?.fullname || student?.fullName || '').toLowerCase();
        const cText = (b.content || b.description || b.title || '').toLowerCase();
        const q = searchTerm.toLowerCase();
        return sName.includes(q) || cText.includes(q);
      }

      return true;
    });
  }, [behaviors, students, filterClassId, filterType, timeFilter, customFrom, customTo, searchTerm]);

  // Filtered criteria list for Criteria tab
  const displayedCriteria = useMemo(() => {
    return criteria.filter((c) => {
      if (critFilterCategory !== 'all' && c.category !== critFilterCategory) return false;
      if (critFilterType !== 'all' && c.type !== critFilterType) return false;
      if (critSearch.trim()) {
        const q = critSearch.toLowerCase();
        return (
          c.title.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          (c.description || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [criteria, critFilterCategory, critFilterType, critSearch]);

  const allCategories = useMemo(() => {
    const set = new Set<string>();
    criteria.forEach((c) => set.add(c.category));
    return Array.from(set);
  }, [criteria]);

  // --- Handlers for Ghi điểm thi đua ---
  const openCreateBehaviorModal = (presetStudentId?: string, presetType?: 'PRAISE' | 'WARN') => {
    setEditingBehavior(null);
    setFormStudentId(presetStudentId || students[0]?.id || '');
    const t = presetType || 'PRAISE';
    setFormType(t);
    setFormPoints(t === 'PRAISE' ? 5 : -2);
    setFormContent('');
    setFormDate('2026-10-07');
    setFormIsSensitive(false);
    setSelectedCriterionId('');
    setIsBehaviorModalOpen(true);
  };

  const openEditBehaviorModal = (beh: Behavior) => {
    setEditingBehavior(beh);
    setFormStudentId(beh.studentId);
    const normalizedType =
      String(beh.type).toUpperCase() === 'WARN' ||
      String(beh.type).toUpperCase() === 'WARNING' ||
      String(beh.type).toUpperCase() === 'VIOLATION'
        ? 'WARN'
        : 'PRAISE';
    setFormType(normalizedType);
    setFormPoints(beh.points);
    setFormContent(beh.content || beh.description || beh.title || '');
    setFormDate(beh.date);
    setFormIsSensitive(!!beh.isSensitive);
    setSelectedCriterionId('');
    setIsBehaviorModalOpen(true);
  };

  // Quick select criterion in Behavior Modal
  const handleSelectCriterionInModal = (critId: string) => {
    setSelectedCriterionId(critId);
    if (!critId) return;
    const found = criteria.find((c) => c.id === critId);
    if (found) {
      setFormType(found.type);
      setFormPoints(found.points);
      setFormContent(found.title);
    }
  };

  const handleBehaviorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formContent.trim() || !formStudentId) return;

    setIsSubmitting(true);
    try {
      const selectedStudent = students.find((s) => s.id === formStudentId);
      const studentName = selectedStudent?.fullname || selectedStudent?.fullName || 'Học sinh';
      const classId = selectedStudent?.classId || currentClassId;

      const payload = {
        studentId: formStudentId,
        studentName,
        classId,
        date: formDate,
        type: formType,
        content: formContent.trim(),
        title: formContent.trim(),
        description: formContent.trim(),
        points: Number(formPoints),
        isSensitive: formIsSensitive,
      };

      if (editingBehavior) {
        await onUpdateBehavior(editingBehavior.id, payload);
        showFeedback('Đã cập nhật điểm thi đua học sinh thành công!');
      } else {
        await onAddBehavior(payload);
        showFeedback(
          `Đã ghi nhận ${formType === 'PRAISE' ? 'cộng' : 'trừ'} ${Math.abs(formPoints)} điểm thi đua cho ${studentName}!`
        );
      }

      setIsBehaviorModalOpen(false);
    } catch (err) {
      console.error(err);
      showFeedback('Đã có lỗi xảy ra khi lưu điểm thi đua.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBehavior = async (id: string, content: string) => {
    if (!window.confirm(`Xác nhận xóa ghi nhận thi đua: "${content.substring(0, 40)}..."?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await onDeleteBehavior(id);
      showFeedback('Đã xóa ghi nhận thi đua thành công!');
    } finally {
      setDeletingId(null);
    }
  };

  // --- Handlers for Criteria CRUD ---
  const openCreateCriteriaModal = () => {
    setEditingCriterion(null);
    const nextNum = criteria.length + 1;
    setCritCode(`TC-${nextNum < 10 ? '0' + nextNum : nextNum}`);
    setCritTitle('');
    setCritCategory('Học tập & Chuyên môn');
    setCritType('PRAISE');
    setCritPoints(5);
    setCritDesc('');
    setIsCriteriaModalOpen(true);
  };

  const openEditCriteriaModal = (crit: EmulationCriterion) => {
    setEditingCriterion(crit);
    setCritCode(crit.code);
    setCritTitle(crit.title);
    setCritCategory(crit.category);
    setCritType(crit.type);
    setCritPoints(crit.points);
    setCritDesc(crit.description || '');
    setIsCriteriaModalOpen(true);
  };

  const handleCriteriaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!critTitle.trim() || !critCode.trim()) return;

    let pointsNumber = Number(critPoints);
    if (critType === 'PRAISE' && pointsNumber <= 0) pointsNumber = 5;
    if (critType === 'WARN' && pointsNumber >= 0) pointsNumber = -2;

    if (editingCriterion) {
      const updated = criteria.map((c) =>
        c.id === editingCriterion.id
          ? {
              ...c,
              code: critCode.trim().toUpperCase(),
              title: critTitle.trim(),
              category: critCategory,
              type: critType,
              points: pointsNumber,
              description: critDesc.trim(),
            }
          : c
      );
      updateAndSaveCriteria(updated);
      showFeedback(`Đã cập nhật tiêu chí thi đua: [${critCode.trim().toUpperCase()}] ${critTitle.trim()}`);
    } else {
      const newCrit: EmulationCriterion = {
        id: `crit-custom-${Date.now()}`,
        code: critCode.trim().toUpperCase(),
        title: critTitle.trim(),
        category: critCategory,
        type: critType,
        points: pointsNumber,
        description: critDesc.trim(),
        isActive: true,
      };
      updateAndSaveCriteria([newCrit, ...criteria]);
      showFeedback(`Đã thêm tiêu chí thi đua mới: [${newCrit.code}] ${newCrit.title}`);
    }

    setIsCriteriaModalOpen(false);
  };

  const handleDeleteCriterion = (id: string, title: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tiêu chí thi đua: "${title}"?`)) {
      return;
    }
    const updated = criteria.filter((c) => c.id !== id);
    updateAndSaveCriteria(updated);
    showFeedback('Đã xóa tiêu chí thi đua thành công!');
  };

  const handleResetDefaultCriteria = () => {
    if (
      window.confirm(
        'Bạn có muốn đặt lại danh mục tiêu chí thi đua về chuẩn ban đầu (theo khung nề nếp Bộ GD&ĐT)?'
      )
    ) {
      updateAndSaveCriteria(DEFAULT_CRITERIA);
      showFeedback('Đã khôi phục danh mục tiêu chí thi đua chuẩn ban đầu.');
    }
  };

  // --- Handlers for Scale Config (Thang điểm thi đua) ---
  const openConfigModal = () => {
    setTempScaleConfig({ ...scaleConfig });
    setIsConfigModalOpen(true);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateAndSaveScaleConfig(tempScaleConfig);
    setIsConfigModalOpen(false);
    showFeedback('Đã cập nhật thang điểm và ngưỡng xếp loại thi đua!');
  };

  const handleResetDefaultConfig = () => {
    setTempScaleConfig({ ...DEFAULT_SCALE_CONFIG });
  };

  // Export handlers
  const currentClassName = classes.find((c) => c.id === filterClassId)?.name || '12A1';
  const periodLabel =
    timeFilter === 'month'
      ? 'Tháng 10/2026'
      : timeFilter === 'week'
      ? 'Tuần 05'
      : timeFilter === 'today'
      ? 'Hôm nay (07/10/2026)'
      : timeFilter === 'custom'
      ? `${customFrom} đến ${customTo}`
      : 'Học kỳ 1';

  // Xuất Bảng Xếp Loại Thi Đua dạng Excel (.xlsx)
  const handleExportRankingExcel = () => {
    try {
      exportEmulationRankingsExcel(
        displayedRankedStudents,
        currentClassName,
        periodLabel,
        scaleConfig
      );
      showFeedback(`Đã xuất bảng xếp loại thi đua lớp ${currentClassName} ra tệp Excel (.xlsx) thành công!`);
    } catch (err) {
      console.error('Lỗi khi xuất Excel xếp loại:', err);
      showFeedback('Có lỗi xảy ra khi tạo tệp Excel xếp loại thi đua.', 'error');
    }
  };

  const handleExportRankingCSV = () => {
    exportEmulationRankingsCSV(
      displayedRankedStudents,
      currentClassName,
      periodLabel
    );
  };

  const [isExportingGoogleSheet, setIsExportingGoogleSheet] = useState(false);

  // Xuất Bảng Xếp Loại trực tiếp lên Google Sheets
  const handleExportRankingGoogleSheet = async () => {
    setIsExportingGoogleSheet(true);
    try {
      let token = await getAccessToken();
      if (!token) {
        const signRes = await googleSignIn();
        if (!signRes) {
          showFeedback('Chưa đăng nhập Google để xuất Sheets', 'error');
          setIsExportingGoogleSheet(false);
          return;
        }
      }
      const res = await exportEmulationToGoogleSheet(
        displayedRankedStudents,
        currentClassName,
        periodLabel
      );
      showFeedback(`Đã xuất bảng xếp loại lên Google Sheets thành công!`);
      window.open(res.spreadsheetUrl, '_blank');
    } catch (err: any) {
      console.error('Lỗi xuất Google Sheets:', err);
      showFeedback(err.message || 'Lỗi khi xuất bảng xếp loại lên Google Sheets', 'error');
    } finally {
      setIsExportingGoogleSheet(false);
    }
  };

  // Xuất Sổ Ghi Nhận Thi Đua dạng Excel (.xlsx)
  const handleExportRecordsExcel = () => {
    try {
      exportEmulationRecordsExcel(
        filteredBehaviors,
        students,
        currentClassName,
        periodLabel
      );
      showFeedback(`Đã xuất sổ ghi nhận thi đua lớp ${currentClassName} ra tệp Excel (.xlsx) thành công!`);
    } catch (err) {
      console.error('Lỗi khi xuất Excel sổ ghi nhận:', err);
      showFeedback('Có lỗi xảy ra khi tạo tệp Excel sổ ghi nhận thi đua.', 'error');
    }
  };

  const handleExportRecordsCSV = () => {
    exportEmulationRecordsCSV(
      filteredBehaviors,
      students,
      currentClassName,
      periodLabel
    );
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Quản Lý Thi Đua & Nề Nếp Lớp Học
                </h1>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  /admin/behavior
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Xếp loại học sinh theo thanh điểm thi đua • Thêm, sửa, xóa các tiêu chí thi đua • Sổ ghi nhận khen thưởng và nhắc nhở
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <button
            onClick={openConfigModal}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5 border border-slate-200"
            title="Tùy chỉnh điểm khởi điểm và ngưỡng xếp loại thi đua"
          >
            <Settings className="h-4 w-4 text-slate-600" />
            <span>Thang Điểm Xếp Loại</span>
          </button>

          {activeTab === 'criteria' && (
            <button
              onClick={openCreateCriteriaModal}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Thêm Tiêu Chí Thi Đua</span>
            </button>
          )}

          {activeTab === 'rankings' && (
            <>
              <button
                onClick={handleExportRankingExcel}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
                title="Xuất bảng xếp loại thi đua học sinh định dạng Excel (.xlsx)"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-100" />
                <span>Xuất Bảng Xếp Loại (.xlsx)</span>
              </button>

              <button
                onClick={handleExportRankingGoogleSheet}
                disabled={isExportingGoogleSheet}
                className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                title="Xuất trực tiếp lên Google Sheets trên Google Drive của bạn"
              >
                <ExternalLink className="h-4 w-4 text-teal-600" />
                <span>{isExportingGoogleSheet ? 'Đang tạo Sheet...' : 'Lưu Google Sheets'}</span>
              </button>
            </>
          )}

          {activeTab === 'records' && (
            <button
              onClick={handleExportRecordsExcel}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
              title="Xuất sổ ghi nhận thi đua học sinh định dạng Excel (.xlsx)"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-100" />
              <span>Xuất Sổ Ghi Nhận (.xlsx)</span>
            </button>
          )}

          <button
            onClick={() => openCreateBehaviorModal()}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Ghi Điểm Thi Đua (+ / -)</span>
          </button>
        </div>
      </div>

      {/* Feedback banner */}
      {feedbackMsg && (
        <div
          className={`px-4 py-3 rounded-xl flex items-center space-x-2 shadow-xs transition-all animate-fadeIn border ${
            feedbackMsg.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : feedbackMsg.type === 'info'
              ? 'bg-blue-50 border-blue-200 text-blue-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <CheckCircle2 className="h-5 w-5 shrink-0 text-current" />
          <span className="text-xs font-semibold">{feedbackMsg.text}</span>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-2xl shadow-2xs space-x-1 sm:space-x-4">
        <button
          onClick={() => setActiveTab('rankings')}
          className={`py-3.5 px-3 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'rankings'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Medal className="h-4 w-4 text-amber-500" />
          <span>Bảng Xếp Loại & Thanh Điểm Thi Đua</span>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 ml-1">
            {rankedStudents.length} HS
          </span>
        </button>

        <button
          onClick={() => setActiveTab('records')}
          className={`py-3.5 px-3 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'records'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Clock className="h-4 w-4 text-slate-400" />
          <span>Sổ Ghi Nhận Khen / Nhắc</span>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 ml-1">
            {filteredBehaviors.length} lượt
          </span>
        </button>

        <button
          onClick={() => setActiveTab('criteria')}
          className={`py-3.5 px-3 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'criteria'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <BookOpen className="h-4 w-4 text-emerald-600" />
          <span>Tiêu Chí Thi Đua (Thêm/Sửa/Xóa)</span>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 ml-1">
            {criteria.length} tiêu chí
          </span>
        </button>
      </div>

      {/* TAB 1: BẢNG XẾP LOẠI & THANH ĐIỂM THI ĐUA */}
      {activeTab === 'rankings' && (
        <div className="space-y-6">
          {/* Top KPI Cards & Tier Distribution */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Xuất sắc */}
            <div
              onClick={() => setFilterTier(filterTier === 'excellent' ? 'all' : 'excellent')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                filterTier === 'excellent'
                  ? 'bg-emerald-500 text-white shadow-md border-emerald-600'
                  : 'bg-white hover:bg-emerald-50/50 border-emerald-200 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  filterTier === 'excellent' ? 'text-emerald-100' : 'text-emerald-700'
                }`}>
                  Xuất sắc (≥ {scaleConfig.tiers.excellentMin}đ)
                </span>
                <Star className={`h-4 w-4 ${filterTier === 'excellent' ? 'text-amber-200 fill-amber-200' : 'text-emerald-600'}`} />
              </div>
              <p className={`text-2xl font-black mt-2 ${filterTier === 'excellent' ? 'text-white' : 'text-emerald-700'}`}>
                {stats.excellentCount}{' '}
                <span className="text-xs font-semibold opacity-80">
                  ({stats.totalStudents > 0 ? Math.round((stats.excellentCount / stats.totalStudents) * 100) : 0}%)
                </span>
              </p>
              <p className={`text-[10px] mt-1 ${filterTier === 'excellent' ? 'text-emerald-100' : 'text-slate-500'}`}>
                Gương mẫu tiêu biểu
              </p>
            </div>

            {/* Tốt */}
            <div
              onClick={() => setFilterTier(filterTier === 'good' ? 'all' : 'good')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                filterTier === 'good'
                  ? 'bg-blue-600 text-white shadow-md border-blue-700'
                  : 'bg-white hover:bg-blue-50/50 border-blue-200 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  filterTier === 'good' ? 'text-blue-100' : 'text-blue-700'
                }`}>
                  Tốt ({scaleConfig.tiers.goodMin} - {scaleConfig.tiers.excellentMin - 1}đ)
                </span>
                <ThumbsUp className={`h-4 w-4 ${filterTier === 'good' ? 'text-blue-200' : 'text-blue-600'}`} />
              </div>
              <p className={`text-2xl font-black mt-2 ${filterTier === 'good' ? 'text-white' : 'text-blue-700'}`}>
                {stats.goodCount}{' '}
                <span className="text-xs font-semibold opacity-80">
                  ({stats.totalStudents > 0 ? Math.round((stats.goodCount / stats.totalStudents) * 100) : 0}%)
                </span>
              </p>
              <p className={`text-[10px] mt-1 ${filterTier === 'good' ? 'text-blue-100' : 'text-slate-500'}`}>
                Chấp hành tốt nội quy
              </p>
            </div>

            {/* Khá */}
            <div
              onClick={() => setFilterTier(filterTier === 'fair' ? 'all' : 'fair')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                filterTier === 'fair'
                  ? 'bg-amber-500 text-white shadow-md border-amber-600'
                  : 'bg-white hover:bg-amber-50/50 border-amber-200 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  filterTier === 'fair' ? 'text-amber-100' : 'text-amber-700'
                }`}>
                  Khá ({scaleConfig.tiers.fairMin} - {scaleConfig.tiers.goodMin - 1}đ)
                </span>
                <Sparkles className={`h-4 w-4 ${filterTier === 'fair' ? 'text-amber-200' : 'text-amber-600'}`} />
              </div>
              <p className={`text-2xl font-black mt-2 ${filterTier === 'fair' ? 'text-white' : 'text-amber-700'}`}>
                {stats.fairCount}{' '}
                <span className="text-xs font-semibold opacity-80">
                  ({stats.totalStudents > 0 ? Math.round((stats.fairCount / stats.totalStudents) * 100) : 0}%)
                </span>
              </p>
              <p className={`text-[10px] mt-1 ${filterTier === 'fair' ? 'text-amber-100' : 'text-slate-500'}`}>
                Cần tích cực thi đua
              </p>
            </div>

            {/* Trung bình */}
            <div
              onClick={() => setFilterTier(filterTier === 'average' ? 'all' : 'average')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                filterTier === 'average'
                  ? 'bg-orange-500 text-white shadow-md border-orange-600'
                  : 'bg-white hover:bg-orange-50/50 border-orange-200 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  filterTier === 'average' ? 'text-orange-100' : 'text-orange-700'
                }`}>
                  Trung bình ({scaleConfig.tiers.averageMin} - {scaleConfig.tiers.fairMin - 1}đ)
                </span>
                <Clock className={`h-4 w-4 ${filterTier === 'average' ? 'text-orange-200' : 'text-orange-600'}`} />
              </div>
              <p className={`text-2xl font-black mt-2 ${filterTier === 'average' ? 'text-white' : 'text-orange-700'}`}>
                {stats.averageCount}{' '}
                <span className="text-xs font-semibold opacity-80">
                  ({stats.totalStudents > 0 ? Math.round((stats.averageCount / stats.totalStudents) * 100) : 0}%)
                </span>
              </p>
              <p className={`text-[10px] mt-1 ${filterTier === 'average' ? 'text-orange-100' : 'text-slate-500'}`}>
                Còn một số lỗi nề nếp
              </p>
            </div>

            {/* Cần rèn luyện */}
            <div
              onClick={() => setFilterTier(filterTier === 'needs_improvement' ? 'all' : 'needs_improvement')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer col-span-2 sm:col-span-1 ${
                filterTier === 'needs_improvement'
                  ? 'bg-rose-500 text-white shadow-md border-rose-600'
                  : 'bg-white hover:bg-rose-50/50 border-rose-200 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  filterTier === 'needs_improvement' ? 'text-rose-100' : 'text-rose-700'
                }`}>
                  Cần rèn luyện (&lt; {scaleConfig.tiers.averageMin}đ)
                </span>
                <AlertTriangle className={`h-4 w-4 ${filterTier === 'needs_improvement' ? 'text-rose-200' : 'text-rose-600'}`} />
              </div>
              <p className={`text-2xl font-black mt-2 ${filterTier === 'needs_improvement' ? 'text-white' : 'text-rose-700'}`}>
                {stats.needsImprovementCount}{' '}
                <span className="text-xs font-semibold opacity-80">
                  ({stats.totalStudents > 0 ? Math.round((stats.needsImprovementCount / stats.totalStudents) * 100) : 0}%)
                </span>
              </p>
              <p className={`text-[10px] mt-1 ${filterTier === 'needs_improvement' ? 'text-rose-100' : 'text-slate-500'}`}>
                Cần phối hợp phụ huynh
              </p>
            </div>
          </div>

          {/* Visual Progress Stacked Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center space-x-1.5">
                <Sliders className="h-4 w-4 text-blue-600" />
                <span>Thanh Phân Bổ Xếp Loại Thi Đua Của Lớp</span>
              </span>
              <span className="text-[11px] text-slate-500">
                Điểm trung bình thi đua: <strong className="text-blue-700 font-bold">{stats.averageScore} điểm</strong> • Cao nhất: <strong className="text-emerald-700 font-bold">{stats.highestScore} điểm</strong>
              </span>
            </div>

            {/* The multi-colored bar */}
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              {stats.totalStudents > 0 && stats.excellentCount > 0 && (
                <div
                  style={{ width: `${(stats.excellentCount / stats.totalStudents) * 100}%` }}
                  className="bg-emerald-500 h-full transition-all"
                  title={`Xuất sắc: ${stats.excellentCount} HS`}
                />
              )}
              {stats.totalStudents > 0 && stats.goodCount > 0 && (
                <div
                  style={{ width: `${(stats.goodCount / stats.totalStudents) * 100}%` }}
                  className="bg-blue-500 h-full transition-all"
                  title={`Tốt: ${stats.goodCount} HS`}
                />
              )}
              {stats.totalStudents > 0 && stats.fairCount > 0 && (
                <div
                  style={{ width: `${(stats.fairCount / stats.totalStudents) * 100}%` }}
                  className="bg-amber-400 h-full transition-all"
                  title={`Khá: ${stats.fairCount} HS`}
                />
              )}
              {stats.totalStudents > 0 && stats.averageCount > 0 && (
                <div
                  style={{ width: `${(stats.averageCount / stats.totalStudents) * 100}%` }}
                  className="bg-orange-400 h-full transition-all"
                  title={`Trung bình: ${stats.averageCount} HS`}
                />
              )}
              {stats.totalStudents > 0 && stats.needsImprovementCount > 0 && (
                <div
                  style={{ width: `${(stats.needsImprovementCount / stats.totalStudents) * 100}%` }}
                  className="bg-rose-500 h-full transition-all"
                  title={`Cần rèn luyện: ${stats.needsImprovementCount} HS`}
                />
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between pt-1 text-[11px] text-slate-500">
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                  <span>Xuất sắc</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="h-2 w-2 rounded-full bg-blue-500 inline-block" />
                  <span>Tốt</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="h-2 w-2 rounded-full bg-amber-400 inline-block" />
                  <span>Khá</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="h-2 w-2 rounded-full bg-orange-400 inline-block" />
                  <span>Trung bình</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="h-2 w-2 rounded-full bg-rose-500 inline-block" />
                  <span>Cần rèn luyện</span>
                </span>
              </div>
              <span className="font-semibold text-slate-600">
                Thang chuẩn: Xuất phát {scaleConfig.baseScore} điểm • Cộng thưởng / Trừ phạt
              </span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm học sinh theo tên, mã HS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Class Filter */}
              <div className="flex items-center space-x-2 w-full md:w-auto">
                <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">Lớp:</span>
                <select
                  value={filterClassId}
                  onChange={(e) => setFilterClassId(e.target.value)}
                  className="text-xs rounded-xl border border-slate-200 py-2 px-3 bg-white text-slate-800 font-bold"
                >
                  <option value="all">Tất cả các lớp</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.classname || c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tier Filter */}
              <div className="flex items-center space-x-2 w-full md:w-auto">
                <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">Xếp loại:</span>
                <select
                  value={filterTier}
                  onChange={(e) => setFilterTier(e.target.value)}
                  className="text-xs rounded-xl border border-slate-200 py-2 px-3 bg-white text-slate-800 font-bold"
                >
                  <option value="all">Tất cả xếp loại</option>
                  <option value="excellent">Xuất sắc (≥ {scaleConfig.tiers.excellentMin}đ)</option>
                  <option value="good">Tốt ({scaleConfig.tiers.goodMin} - {scaleConfig.tiers.excellentMin - 1}đ)</option>
                  <option value="fair">Khá ({scaleConfig.tiers.fairMin} - {scaleConfig.tiers.goodMin - 1}đ)</option>
                  <option value="average">Trung bình ({scaleConfig.tiers.averageMin} - {scaleConfig.tiers.fairMin - 1}đ)</option>
                  <option value="needs_improvement">Cần rèn luyện (&lt; {scaleConfig.tiers.averageMin}đ)</option>
                </select>
              </div>
            </div>

            {/* Time Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-semibold flex items-center mr-1">
                <Clock className="h-3.5 w-3.5 mr-1 text-slate-400" />
                Thời gian xét thi đua:
              </span>
              <button
                onClick={() => setTimeFilter('month')}
                className={`px-2.5 py-1 rounded-lg font-semibold ${
                  timeFilter === 'month' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Tháng này (Tháng 10/2026)
              </button>
              <button
                onClick={() => setTimeFilter('week')}
                className={`px-2.5 py-1 rounded-lg font-semibold ${
                  timeFilter === 'week' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Tuần này (Tuần 05)
              </button>
              <button
                onClick={() => setTimeFilter('today')}
                className={`px-2.5 py-1 rounded-lg font-semibold ${
                  timeFilter === 'today' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Hôm nay (07/10)
              </button>
              <button
                onClick={() => setTimeFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold ${
                  timeFilter === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Toàn học kỳ
              </button>
              <button
                onClick={() => setTimeFilter('custom')}
                className={`px-2.5 py-1 rounded-lg font-semibold ${
                  timeFilter === 'custom' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Khoảng ngày tùy chọn
              </button>

              {timeFilter === 'custom' && (
                <div className="flex items-center space-x-1 ml-auto">
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="p-1 rounded border border-slate-200 text-xs"
                  />
                  <span>-</span>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="p-1 rounded border border-slate-200 text-xs"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Table: Student Emulation Leaderboard with Visual Meters */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 text-center w-16">Hạng</th>
                    <th className="py-3 px-4">Học Sinh</th>
                    <th className="py-3 px-3 text-center">Điểm Gốc</th>
                    <th className="py-3 px-3 text-center">Điểm Cộng (+)</th>
                    <th className="py-3 px-3 text-center">Điểm Trừ (-)</th>
                    <th className="py-3 px-4 text-center font-black text-slate-800">Tổng Điểm</th>
                    <th className="py-3 px-4 min-w-[180px]">Thanh Điểm Thi Đua (Scale Meter)</th>
                    <th className="py-3 px-4 text-center">Xếp Loại</th>
                    <th className="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedRankedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        Không tìm thấy học sinh nào phù hợp với bộ lọc hiện tại.
                      </td>
                    </tr>
                  ) : (
                    displayedRankedStudents.map((item) => {
                      const isTop1 = item.rank === 1;
                      const isTop2 = item.rank === 2;
                      const isTop3 = item.rank === 3;

                      // Calculate meter fill % (capped at 120 max points for display)
                      const meterPercentage = Math.min(100, Math.max(5, (item.netScore / 120) * 100));

                      return (
                        <tr
                          key={item.studentId}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isTop1 ? 'bg-amber-50/20' : ''
                          }`}
                        >
                          {/* Hạng */}
                          <td className="py-3 px-4 text-center">
                            {isTop1 ? (
                              <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-white font-black shadow-xs text-xs">
                                🥇 1
                              </span>
                            ) : isTop2 ? (
                              <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-gradient-to-tr from-slate-300 to-slate-200 text-slate-700 font-black shadow-xs text-xs">
                                🥈 2
                              </span>
                            ) : isTop3 ? (
                              <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-gradient-to-tr from-amber-600 to-amber-700 text-white font-black shadow-xs text-xs">
                                🥉 3
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-slate-100 text-slate-600 font-bold text-xs">
                                #{item.rank}
                              </span>
                            )}
                          </td>

                          {/* Học sinh */}
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={
                                  item.student.avatar ||
                                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                                }
                                alt={item.studentName}
                                className="h-9 w-9 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                              <div>
                                <span className="font-bold text-slate-900 block text-xs hover:text-blue-600 cursor-pointer"
                                  onClick={() => setSelectedStudentForDetail(item)}>
                                  {item.studentName}
                                </span>
                                <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 mt-0.5">
                                  <span className="font-semibold text-blue-600">{item.studentCode}</span>
                                  <span>•</span>
                                  <span>Lớp {classes.find((c) => c.id === item.classId)?.name || '12A1'}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Điểm khởi điểm */}
                          <td className="py-3 px-3 text-center text-slate-500 font-semibold">
                            {item.baseScore}
                          </td>

                          {/* Điểm cộng */}
                          <td className="py-3 px-3 text-center font-bold text-emerald-600">
                            {item.praisePoints > 0 ? (
                              <span className="inline-flex items-center bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-lg text-[11px]">
                                +{item.praisePoints}
                                <span className="text-[9px] text-emerald-500 ml-1">({item.praiseCount})</span>
                              </span>
                            ) : (
                              <span className="text-slate-300">0</span>
                            )}
                          </td>

                          {/* Điểm trừ */}
                          <td className="py-3 px-3 text-center font-bold text-rose-600">
                            {item.warnPoints < 0 ? (
                              <span className="inline-flex items-center bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-lg text-[11px]">
                                {item.warnPoints}
                                <span className="text-[9px] text-rose-500 ml-1">({item.warnCount})</span>
                              </span>
                            ) : (
                              <span className="text-slate-300">0</span>
                            )}
                          </td>

                          {/* Tổng điểm */}
                          <td className="py-3 px-4 text-center">
                            <span className="text-base font-black text-slate-900">
                              {item.netScore}
                            </span>
                            <span className="text-[10px] text-slate-400 block">điểm</span>
                          </td>

                          {/* Visual Meter Bar */}
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10px] text-slate-500">
                                <span className="font-medium">Mức điểm: {item.netScore}/120</span>
                                <span className="font-bold text-slate-700">{Math.round(meterPercentage)}%</span>
                              </div>
                              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
                                {/* Base marker line at 100 points */}
                                <div
                                  className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10"
                                  style={{ left: `${(100 / 120) * 100}%` }}
                                  title="Mốc chuẩn 100 điểm"
                                />
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${item.tier.badgeBg}`}
                                  style={{ width: `${meterPercentage}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Xếp Loại Badge */}
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex items-center space-x-1 text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-2xs ${item.tier.badgeClass}`}
                            >
                              {item.tier.id === 'excellent' && <Star className="h-3 w-3 fill-amber-400 text-amber-500 mr-0.5" />}
                              <span>{item.tier.name}</span>
                            </span>
                          </td>

                          {/* Thao tác */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => setSelectedStudentForDetail(item)}
                                className="px-2 py-1 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-semibold transition-colors"
                                title="Xem lịch sử điểm thi đua"
                              >
                                Chi tiết
                              </button>
                              <button
                                onClick={() => openCreateBehaviorModal(item.studentId, 'PRAISE')}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Cộng điểm khen thưởng"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openCreateBehaviorModal(item.studentId, 'WARN')}
                                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                title="Trừ điểm nhắc nhở"
                              >
                                <AlertTriangle className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SỔ GHI NHẬN THI ĐUA (LỊCH SỬ KHEN/NHẮC) */}
      {activeTab === 'records' && (
        <div className="space-y-6">
          {/* Summary KPI Mini Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Tổng số lượt ghi nhận</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{filteredBehaviors.length}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-2xs">
              <span className="text-[11px] font-bold text-emerald-700 uppercase">Tổng điểm khen thưởng</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">
                +
                {filteredBehaviors
                  .filter((b) => String(b.type).toUpperCase() === 'PRAISE')
                  .reduce((sum, b) => sum + Number(b.points || 0), 0)}{' '}
                điểm
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-amber-100 bg-amber-50/20 shadow-2xs">
              <span className="text-[11px] font-bold text-amber-700 uppercase">Số lần nhắc nhở vi phạm</span>
              <p className="text-2xl font-black text-amber-700 mt-1">
                {filteredBehaviors.filter((b) => String(b.type).toUpperCase() !== 'PRAISE').length} lần
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-purple-100 bg-purple-50/20 shadow-2xs">
              <span className="text-[11px] font-bold text-purple-700 uppercase">Ghi nhận nhạy cảm (ẩn App)</span>
              <p className="text-2xl font-black text-purple-700 mt-1">
                {filteredBehaviors.filter((b) => b.isSensitive).length} mục
              </p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm theo tên học sinh, nội dung tiêu chí thi đua..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Class Filter */}
              <div className="flex items-center space-x-2 w-full md:w-auto">
                <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">Lớp:</span>
                <select
                  value={filterClassId}
                  onChange={(e) => setFilterClassId(e.target.value)}
                  className="text-xs rounded-xl border border-slate-200 py-2 px-3 bg-white text-slate-800 font-bold"
                >
                  <option value="all">Tất cả các lớp</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.classname || c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div className="flex items-center space-x-1.5 w-full md:w-auto">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterType === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setFilterType('PRAISE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterType === 'PRAISE'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  Khen (+)
                </button>
                <button
                  onClick={() => setFilterType('WARN')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterType === 'WARN'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                  }`}
                >
                  Nhắc (-)
                </button>
              </div>
            </div>

            {/* Time filters */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-semibold flex items-center mr-1">
                <Clock className="h-3.5 w-3.5 mr-1 text-slate-400" />
                Thời gian:
              </span>
              <button
                onClick={() => setTimeFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold ${
                  timeFilter === 'all' ? 'bg-blue-100 text-blue-800' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setTimeFilter('today')}
                className={`px-2.5 py-1 rounded-lg font-semibold ${
                  timeFilter === 'today' ? 'bg-blue-100 text-blue-800' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Hôm nay (07/10)
              </button>
              <button
                onClick={() => setTimeFilter('week')}
                className={`px-2.5 py-1 rounded-lg font-semibold ${
                  timeFilter === 'week' ? 'bg-blue-100 text-blue-800' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Tuần này (Tuần 05)
              </button>
              <button
                onClick={() => setTimeFilter('month')}
                className={`px-2.5 py-1 rounded-lg font-semibold ${
                  timeFilter === 'month' ? 'bg-blue-100 text-blue-800' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Tháng này (Tháng 10)
              </button>
              <button
                onClick={() => setTimeFilter('custom')}
                className={`px-2.5 py-1 rounded-lg font-semibold ${
                  timeFilter === 'custom' ? 'bg-blue-100 text-blue-800' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Khoảng ngày
              </button>

              {timeFilter === 'custom' && (
                <div className="flex items-center space-x-1 ml-auto">
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="p-1 rounded border border-slate-200 text-xs"
                  />
                  <span>-</span>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="p-1 rounded border border-slate-200 text-xs"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Records List */}
          <div className="space-y-3">
            {filteredBehaviors.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
                Không tìm thấy ghi nhận thi đua nào phù hợp với bộ lọc.
              </div>
            ) : (
              filteredBehaviors.map((item) => {
                const student = students.find((s) => s.id === item.studentId);
                const isPraise = String(item.type).toUpperCase() === 'PRAISE';
                const contentDisplay = item.content || item.description || item.title || 'Ghi nhận thi đua';
                const studentNameDisplay = item.studentName || student?.fullname || student?.fullName || 'Học sinh';

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl border p-4 shadow-xs transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      isPraise ? 'border-emerald-200 hover:border-emerald-300' : 'border-amber-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                      <div
                        className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                          isPraise ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {isPraise ? <ThumbsUp className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-bold text-slate-900 text-sm">{studentNameDisplay}</span>
                          {student?.studentCode && (
                            <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                              {student.studentCode}
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isPraise
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {isPraise ? 'KHEN THƯỞNG (+)' : 'NHẮC NHỞ (-)'}
                          </span>

                          {item.isSensitive && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center space-x-1">
                              <EyeOff className="h-3 w-3 mr-0.5" />
                              <span>Ẩn nhạy cảm trên App</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed break-words font-medium">
                          {contentDisplay}
                        </p>

                        <p className="text-[11px] text-slate-400 mt-1 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Ngày ghi nhận: {new Date(item.date).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>

                    {/* Points & Actions */}
                    <div className="flex items-center space-x-3 self-end md:self-center shrink-0">
                      <span
                        className={`text-xs font-black px-3 py-1.5 rounded-xl ${
                          item.points >= 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {item.points >= 0 ? `+${item.points}` : item.points} điểm thi đua
                      </span>

                      <div className="flex items-center space-x-1 border-l border-slate-200 pl-2">
                        <button
                          onClick={() => openEditBehaviorModal(item)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Sửa ghi nhận thi đua"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBehavior(item.id, contentDisplay)}
                          disabled={deletingId === item.id}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa ghi nhận"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TIÊU CHÍ THI ĐUA (THÊM / SỬA / XÓA) */}
      {activeTab === 'criteria' && (
        <div className="space-y-6">
          {/* Top Banner & Quick Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-emerald-50/50 border border-emerald-200/80 p-4 rounded-2xl">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Danh Mục Tiêu Chí Thi Đua Chuẩn
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Thầy/cô có thể tạo mới, chỉnh sửa mức điểm (+/-) hoặc xóa các tiêu chí theo quy chế thi đua của trường.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleResetDefaultCriteria}
                className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center space-x-1.5"
                title="Khôi phục danh mục tiêu chí chuẩn ban đầu"
              >
                <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                <span>Khôi phục mặc định</span>
              </button>

              <button
                onClick={openCreateCriteriaModal}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>Thêm Tiêu Chí Mới</span>
              </button>
            </div>
          </div>

          {/* Filter & Search Bar for Criteria */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm tiêu chí theo tên, mã (HT-01, KL-02...)..."
                value={critSearch}
                onChange={(e) => setCritSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">Nhóm:</span>
              <select
                value={critFilterCategory}
                onChange={(e) => setCritFilterCategory(e.target.value)}
                className="text-xs rounded-xl border border-slate-200 py-2 px-3 bg-white text-slate-800 font-bold"
              >
                <option value="all">Tất cả các nhóm ({criteria.length})</option>
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center space-x-1.5 w-full md:w-auto">
              <button
                onClick={() => setCritFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  critFilterType === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setCritFilterType('PRAISE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  critFilterType === 'PRAISE'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                Cộng điểm (+)
              </button>
              <button
                onClick={() => setCritFilterType('WARN')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  critFilterType === 'WARN'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                }`}
              >
                Trừ điểm (-)
              </button>
            </div>
          </div>

          {/* Criteria Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedCriteria.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
                Không tìm thấy tiêu chí thi đua nào phù hợp với bộ lọc.
              </div>
            ) : (
              displayedCriteria.map((item) => {
                const isPraise = item.type === 'PRAISE';

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl border p-4 shadow-xs transition-all flex flex-col justify-between hover:shadow-md ${
                      isPraise ? 'border-emerald-200/80 hover:border-emerald-300' : 'border-rose-200/80 hover:border-rose-300'
                    }`}
                  >
                    <div>
                      {/* Top Code & Category */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-black text-xs px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                          {item.code}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {item.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-sm font-bold text-slate-900 leading-snug mb-1">
                        {item.title}
                      </h4>

                      {/* Description */}
                      {item.description && (
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Bottom Points & Actions */}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-xl ${
                          isPraise
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {item.points > 0 ? `+${item.points}` : item.points} điểm thi đua
                      </span>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => openCreateBehaviorModal(undefined, item.type)}
                          className="px-2 py-1 text-[11px] font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Áp dụng ghi điểm cho học sinh"
                        >
                          Áp dụng
                        </button>
                        <button
                          onClick={() => openEditCriteriaModal(item)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Sửa tiêu chí"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCriterion(item.id, item.title)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa tiêu chí"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: GHI ĐIỂM THI ĐUA (Khen / Nhắc) kèm Chọn Tiêu Chí Nhanh */}
      {isBehaviorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Award className="h-5 w-5 text-amber-500" />
                <span>{editingBehavior ? 'Sửa Ghi Nhận Thi Đua' : 'Ghi Điểm Thi Đua Học Sinh'}</span>
              </h3>
              <button
                onClick={() => setIsBehaviorModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleBehaviorSubmit} className="space-y-4">
              {/* Chọn học sinh */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Chọn học sinh <span className="text-red-500">*</span>
                </label>
                <select
                  value={formStudentId}
                  onChange={(e) => setFormStudentId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800 font-medium"
                  required
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.studentCode} - {st.fullname || st.fullName} (Lớp {classes.find((c) => c.id === st.classId)?.name || '12A1'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Chọn nhanh từ tiêu chí thi đua có sẵn */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>Chọn nhanh từ Tiêu chí thi đua có sẵn:</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Tự điền loại, điểm & nội dung</span>
                </div>
                <select
                  value={selectedCriterionId}
                  onChange={(e) => handleSelectCriterionInModal(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800 bg-slate-50 font-medium"
                >
                  <option value="">-- Chọn tiêu chí thi đua chuẩn --</option>
                  {criteria.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.code}] {c.title} ({c.type === 'PRAISE' ? `+${c.points}` : `${c.points}`} điểm)
                    </option>
                  ))}
                </select>
              </div>

              {/* Loại & Điểm */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Phân loại <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => {
                      const t = e.target.value as 'PRAISE' | 'WARN';
                      setFormType(t);
                      if (t === 'PRAISE' && formPoints < 0) setFormPoints(5);
                      if (t === 'WARN' && formPoints > 0) setFormPoints(-2);
                    }}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800 font-bold"
                  >
                    <option value="PRAISE">PRAISE (Cộng điểm thưởng +)</option>
                    <option value="WARN">WARN (Trừ điểm nhắc nhở -)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Điểm thi đua (+ / -) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formPoints}
                    onChange={(e) => setFormPoints(Number(e.target.value))}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800 font-bold"
                    required
                  />
                </div>
              </div>

              {/* Ngày */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Ngày ghi nhận <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800"
                  required
                />
              </div>

              {/* Nội dung */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nội dung chi tiết / Lý do <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Mô tả cụ thể hành vi gương mẫu hoặc vi phạm cần chấn chỉnh..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800"
                  required
                />
              </div>

              {/* Cờ nhạy cảm */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="chkSensitive"
                  checked={formIsSensitive}
                  onChange={(e) => setFormIsSensitive(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="chkSensitive" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Đánh dấu là thông tin nhạy cảm (ẩn chi tiết trên giao diện phụ huynh/học sinh)
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBehaviorModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  {isSubmitting ? 'Đang lưu...' : editingBehavior ? 'Lưu Thay Đổi' : 'Ghi Điểm Thi Đua'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: THÊM / SỬA TIÊU CHÍ THI ĐUA */}
      {isCriteriaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-emerald-600" />
                <span>{editingCriterion ? 'Sửa Tiêu Chí Thi Đua' : 'Thêm Tiêu Chí Thi Đua Mới'}</span>
              </h3>
              <button
                onClick={() => setIsCriteriaModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCriteriaSubmit} className="space-y-4">
              {/* Mã & Nhóm */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Mã tiêu chí <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={critCode}
                    onChange={(e) => setCritCode(e.target.value)}
                    placeholder="HT-01"
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800 font-bold uppercase"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nhóm danh mục <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    list="categoryList"
                    value={critCategory}
                    onChange={(e) => setCritCategory(e.target.value)}
                    placeholder="Học tập, Kỷ luật, Chuyên cần..."
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800 font-medium"
                    required
                  />
                  <datalist id="categoryList">
                    <option value="Học tập & Chuyên môn" />
                    <option value="Kỷ luật & Tác phong" />
                    <option value="Chuyên cần & Nề nếp" />
                    <option value="Phong trào & Hoạt động" />
                    <option value="Đạo đức & Việc tốt" />
                  </datalist>
                </div>
              </div>

              {/* Tên tiêu chí */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tên tiêu chí thi đua <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={critTitle}
                  onChange={(e) => setCritTitle(e.target.value)}
                  placeholder="Ví dụ: Phát biểu xây dựng bài sôi nổi..."
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800 font-bold"
                  required
                />
              </div>

              {/* Loại & Điểm */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Loại điểm <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={critType}
                    onChange={(e) => {
                      const t = e.target.value as 'PRAISE' | 'WARN';
                      setCritType(t);
                      if (t === 'PRAISE' && critPoints <= 0) setCritPoints(5);
                      if (t === 'WARN' && critPoints >= 0) setCritPoints(-2);
                    }}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800 font-bold"
                  >
                    <option value="PRAISE">Cộng điểm (+)</option>
                    <option value="WARN">Trừ điểm (-)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Mức điểm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={critPoints}
                    onChange={(e) => setCritPoints(Number(e.target.value))}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800 font-bold"
                    required
                  />
                </div>
              </div>

              {/* Mô tả */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Hướng dẫn chi tiết / Điều kiện áp dụng
                </label>
                <textarea
                  rows={2}
                  value={critDesc}
                  onChange={(e) => setCritDesc(e.target.value)}
                  placeholder="Mô tả tiêu chí và lưu ý khi chấm điểm thi đua..."
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCriteriaModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  {editingCriterion ? 'Lưu Thay Đổi' : 'Thêm Tiêu Chí'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CÀI ĐẶT THANG ĐIỂM & NGƯỠNG XẾP LOẠI THI ĐUA */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Settings className="h-5 w-5 text-blue-600" />
                <span>Cài Đặt Thang Điểm Xếp Loại Thi Đua</span>
              </h3>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-800 leading-relaxed">
                Mỗi học sinh sẽ có <strong>Điểm khởi điểm</strong> (mặc định 100 điểm). Điểm thi đua cuối = Điểm khởi điểm + Tổng điểm cộng - Tổng điểm trừ.
              </div>

              {/* Base Score */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Điểm khởi điểm ban đầu (baseScore) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={tempScaleConfig.baseScore}
                  onChange={(e) =>
                    setTempScaleConfig({ ...tempScaleConfig, baseScore: Number(e.target.value) })
                  }
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800 font-bold"
                  required
                />
              </div>

              {/* Tiers thresholds */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Ngưỡng điểm các bậc xếp loại:
                </h4>

                <div>
                  <label className="text-xs font-bold text-emerald-700 block mb-1">
                    1. Mức Xuất sắc: Đạt từ (≥ điểm)
                  </label>
                  <input
                    type="number"
                    value={tempScaleConfig.tiers.excellentMin}
                    onChange={(e) =>
                      setTempScaleConfig({
                        ...tempScaleConfig,
                        tiers: { ...tempScaleConfig.tiers, excellentMin: Number(e.target.value) },
                      })
                    }
                    className="w-full text-xs rounded-xl border border-emerald-300 p-2 text-slate-800 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-blue-700 block mb-1">
                    2. Mức Tốt: Đạt từ (≥ điểm)
                  </label>
                  <input
                    type="number"
                    value={tempScaleConfig.tiers.goodMin}
                    onChange={(e) =>
                      setTempScaleConfig({
                        ...tempScaleConfig,
                        tiers: { ...tempScaleConfig.tiers, goodMin: Number(e.target.value) },
                      })
                    }
                    className="w-full text-xs rounded-xl border border-blue-300 p-2 text-slate-800 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-amber-700 block mb-1">
                    3. Mức Khá: Đạt từ (≥ điểm)
                  </label>
                  <input
                    type="number"
                    value={tempScaleConfig.tiers.fairMin}
                    onChange={(e) =>
                      setTempScaleConfig({
                        ...tempScaleConfig,
                        tiers: { ...tempScaleConfig.tiers, fairMin: Number(e.target.value) },
                      })
                    }
                    className="w-full text-xs rounded-xl border border-amber-300 p-2 text-slate-800 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-orange-700 block mb-1">
                    4. Mức Trung bình: Đạt từ (≥ điểm)
                  </label>
                  <input
                    type="number"
                    value={tempScaleConfig.tiers.averageMin}
                    onChange={(e) =>
                      setTempScaleConfig({
                        ...tempScaleConfig,
                        tiers: { ...tempScaleConfig.tiers, averageMin: Number(e.target.value) },
                      })
                    }
                    className="w-full text-xs rounded-xl border border-orange-300 p-2 text-slate-800 font-bold"
                    required
                  />
                </div>

                <p className="text-[11px] text-slate-500 italic">
                  * Dưới {tempScaleConfig.tiers.averageMin} điểm sẽ tự động xếp vào mức: <strong>Cần rèn luyện</strong>.
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleResetDefaultConfig}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Mặc định (100-85-70-50)
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsConfigModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    Lưu Thang Điểm
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CHI TIẾT LỊCH SỬ THI ĐUA CỦA HỌC SINH */}
      {selectedStudentForDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-3">
                <img
                  src={
                    selectedStudentForDetail.student.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                  }
                  alt={selectedStudentForDetail.studentName}
                  className="h-10 w-10 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedStudentForDetail.studentName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mã HS: <strong className="text-blue-600">{selectedStudentForDetail.studentCode}</strong> • Thứ hạng: #{selectedStudentForDetail.rank}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentForDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Point Summary Card */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-4 rounded-xl border border-blue-100 mb-4">
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Điểm gốc</span>
                  <span className="text-lg font-black text-slate-700">{selectedStudentForDetail.baseScore}</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-600 block uppercase font-bold">Cộng (+)</span>
                  <span className="text-lg font-black text-emerald-600">+{selectedStudentForDetail.praisePoints}</span>
                </div>
                <div>
                  <span className="text-[10px] text-rose-600 block uppercase font-bold">Trừ (-)</span>
                  <span className="text-lg font-black text-rose-600">{selectedStudentForDetail.warnPoints}</span>
                </div>
                <div>
                  <span className="text-[10px] text-blue-600 block uppercase font-bold">Tổng điểm</span>
                  <span className="text-xl font-black text-blue-700">{selectedStudentForDetail.netScore}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-blue-200/60 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">Xếp loại hiện tại:</span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${selectedStudentForDetail.tier.badgeClass}`}>
                  {selectedStudentForDetail.tier.name}
                </span>
              </div>
            </div>

            {/* List of events for this student */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Lịch sử các lần cộng / trừ điểm:</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {selectedStudentForDetail.behaviors.length} lượt ghi nhận
                </span>
              </h4>

              {selectedStudentForDetail.behaviors.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
                  Học sinh chưa có lượt ghi nhận cộng hoặc trừ điểm nào trong khoảng thời gian này.
                </div>
              ) : (
                selectedStudentForDetail.behaviors.map((b) => {
                  const isPraise = String(b.type).toUpperCase() === 'PRAISE';
                  return (
                    <div
                      key={b.id}
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                        isPraise ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/40 border-rose-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              isPraise ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isPraise ? 'Khen thưởng (+)' : 'Nhắc nhở (-)'}
                          </span>
                          <span className="text-slate-400 text-[11px]">{b.date}</span>
                        </div>
                        <p className="font-semibold text-slate-800 mt-1">
                          {b.content || b.description || b.title}
                        </p>
                      </div>

                      <span
                        className={`text-xs font-black px-2 py-1 rounded-lg shrink-0 ml-2 ${
                          isPraise ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {b.points > 0 ? `+${b.points}` : b.points}đ
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const sid = selectedStudentForDetail.studentId;
                    setSelectedStudentForDetail(null);
                    openCreateBehaviorModal(sid, 'PRAISE');
                  }}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl font-bold text-xs"
                >
                  + Khen thưởng
                </button>
                <button
                  onClick={() => {
                    const sid = selectedStudentForDetail.studentId;
                    setSelectedStudentForDetail(null);
                    openCreateBehaviorModal(sid, 'WARN');
                  }}
                  className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl font-bold text-xs"
                >
                  - Nhắc nhở
                </button>
              </div>

              <button
                onClick={() => setSelectedStudentForDetail(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
