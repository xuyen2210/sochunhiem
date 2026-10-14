import React, { useState, useEffect } from 'react';
import {
  Award,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  Eye,
  EyeOff,
  User,
  ShieldCheck,
  CheckCircle2,
  Filter,
  MessageSquare,
} from 'lucide-react';
import { Behavior, Student } from '../../core/types';
import defaultProvider from '../../core/provider';

interface AppBehaviorProps {
  students: Student[];
  currentStudentId?: string;
  onSelectStudent?: (studentId: string) => void;
  onNavigate?: (route: string) => void;
}

export const AppBehavior: React.FC<AppBehaviorProps> = ({
  students,
  currentStudentId,
  onSelectStudent,
  onNavigate,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    currentStudentId || students[0]?.id || 'std-01'
  );
  const [filterType, setFilterType] = useState<'all' | 'PRAISE' | 'WARN'>('all');
  const [behaviorList, setBehaviorList] = useState<Behavior[]>([]);
  const [loading, setLoading] = useState(false);

  // Sync prop student
  useEffect(() => {
    if (currentStudentId && currentStudentId !== selectedStudentId) {
      setSelectedStudentId(currentStudentId);
    }
  }, [currentStudentId]);

  // Load behaviors for the chosen student
  const fetchStudentBehaviors = async () => {
    if (!selectedStudentId) return;
    setLoading(true);
    try {
      const res = await defaultProvider.listBehaviorsByStudent(selectedStudentId);
      setBehaviorList(res);
    } catch (err) {
      console.error('Failed to fetch behaviors by student', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentBehaviors();
  }, [selectedStudentId]);

  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  // Stats calculation
  const totalPoints = behaviorList.reduce((sum, b) => sum + Number(b.points || 0), 0);
  const praisesCount = behaviorList.filter((b) => String(b.type).toUpperCase() === 'PRAISE').length;
  const warnsCount = behaviorList.filter((b) => {
    const t = String(b.type).toUpperCase();
    return t === 'WARN' || t === 'WARNING' || t === 'VIOLATION';
  }).length;

  const filteredList = behaviorList.filter((b) => {
    const t = String(b.type).toUpperCase();
    if (filterType === 'PRAISE') return t === 'PRAISE';
    if (filterType === 'WARN') return t === 'WARN' || t === 'WARNING' || t === 'VIOLATION';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Student Profile Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <img
            src={currentStudent?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80'}
            alt={currentStudent?.fullname || currentStudent?.fullName}
            className="h-14 w-14 rounded-2xl object-cover border border-slate-200 shadow-2xs"
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                {currentStudent?.studentCode}
              </span>
              <span className="text-xs text-slate-500">Lớp 12A1</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">
              {currentStudent?.fullname || currentStudent?.fullName}
            </h2>
            <p className="text-xs text-slate-500">
              Sổ theo dõi nề nếp, hạnh kiểm & rèn luyện đạo đức
            </p>
          </div>
        </div>

        {/* Persona Switcher */}
        <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
            Chọn học sinh:
          </span>
          <select
            value={selectedStudentId}
            onChange={(e) => {
              setSelectedStudentId(e.target.value);
              if (onSelectStudent) onSelectStudent(e.target.value);
            }}
            className="text-xs font-bold rounded-lg border-slate-200 bg-white p-2 text-slate-800"
          >
            {students.map((st) => (
              <option key={st.id} value={st.id}>
                {st.studentCode} - {st.fullname || st.fullName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-blue-100 bg-blue-50/20 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-700 uppercase">Tổng điểm thi đua rèn luyện</span>
          <p className="text-3xl font-black text-blue-700 mt-1">
            {totalPoints >= 0 ? `+${totalPoints}` : totalPoints} <span className="text-xs font-normal text-slate-500">điểm</span>
          </p>
          <span className="text-[10px] text-emerald-700 font-semibold">Xếp loại hạnh kiểm: Tốt</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 bg-emerald-50/20 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 uppercase">Khen thưởng (PRAISE)</span>
            <ThumbsUp className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-700 mt-1">
            {praisesCount} <span className="text-xs font-normal text-slate-500">lần</span>
          </p>
          <span className="text-[10px] text-slate-500">Ghi nhận tích cực</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-100 bg-amber-50/20 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 uppercase">Nhắc nhở (WARN)</span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-3xl font-black text-amber-700 mt-1">
            {warnsCount} <span className="text-xs font-normal text-slate-500">lần</span>
          </p>
          <span className="text-[10px] text-slate-500">Cần rút kinh nghiệm</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <span className="text-xs font-semibold text-slate-500 mr-2 flex items-center">
          <Filter className="h-3.5 w-3.5 mr-1" />
          Bộ lọc:
        </span>
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filterType === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Tất cả ({behaviorList.length})
        </button>
        <button
          onClick={() => setFilterType('PRAISE')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filterType === 'PRAISE'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
          }`}
        >
          Khen thưởng ({praisesCount})
        </button>
        <button
          onClick={() => setFilterType('WARN')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filterType === 'WARN'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
          }`}
        >
          Nhắc nhở ({warnsCount})
        </button>
      </div>

      {/* History Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Award className="h-4 w-4 text-blue-600" />
            <span>Lịch Sử Khen Thưởng & Nhắc Nhở</span>
          </h3>
          <span className="text-xs text-slate-400">
            Cập nhật bởi Giáo viên chủ nhiệm
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Đang tải dữ liệu nề nếp...
            </div>
          ) : filteredList.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Chưa có ghi nhận nề nếp nào trong danh mục này.
            </div>
          ) : (
            filteredList.map((item) => {
              const isPraise = String(item.type).toUpperCase() === 'PRAISE';
              const isSensitive = !!item.isSensitive;
              const contentText = item.content || item.description || item.title || 'Ghi nhận';

              return (
                <div
                  key={item.id}
                  className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isPraise
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {isPraise ? (
                        <ThumbsUp className="h-5 w-5" />
                      ) : (
                        <AlertTriangle className="h-5 w-5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            isPraise
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {isPraise ? 'KHEN THƯỞNG (PRAISE)' : 'NHẮC NHỞ (WARN)'}
                        </span>

                        <span className="text-[11px] text-slate-400 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(item.date).toLocaleDateString('vi-VN')}
                        </span>
                      </div>

                      {/* Display content or hide sensitive info */}
                      {isSensitive ? (
                        <div className="mt-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
                          <div className="flex items-center space-x-1.5 text-purple-700 font-bold mb-1">
                            <EyeOff className="h-3.5 w-3.5" />
                            <span>Thông tin bảo mật riêng tư học sinh</span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-slate-500">
                            Chi tiết ghi chú này đã được ẩn theo chính sách bảo mật thông tin nội bộ. Quý phụ huynh vui lòng liên hệ trực tiếp với Thầy/Cô chủ nhiệm nếu cần trao đổi cụ thể.
                          </p>
                          {onNavigate && (
                            <button
                              onClick={() => onNavigate('/app/messages')}
                              className="mt-2 text-xs font-bold text-blue-600 hover:underline flex items-center space-x-1"
                            >
                              <MessageSquare className="h-3 w-3" />
                              <span>Nhắn tin cho GVCN</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <p className="text-slate-800 text-xs leading-relaxed font-medium mt-1">
                          {contentText}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Points Badge */}
                  <div className="self-end sm:self-center shrink-0">
                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl ${
                        item.points >= 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {item.points >= 0 ? `+${item.points}` : item.points} điểm
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
