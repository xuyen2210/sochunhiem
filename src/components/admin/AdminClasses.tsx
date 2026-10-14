import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Search,
  Users,
  CheckCircle2,
  AlertTriangle,
  School,
  X,
  Check,
} from 'lucide-react';
import { ClassInfo, Student } from '../../core/types';

interface AdminClassesProps {
  classes: ClassInfo[];
  students: Student[];
  currentClassId: string;
  onSelectCurrentClass: (classId: string) => void;
  onCreateClass: (data: Omit<ClassInfo, 'id'>) => Promise<void>;
  onUpdateClass: (id: string, data: Partial<ClassInfo>) => Promise<void>;
  onDeleteClass: (id: string) => Promise<void>;
}

export const AdminClasses: React.FC<AdminClassesProps> = ({
  classes,
  students,
  currentClassId,
  onSelectCurrentClass,
  onCreateClass,
  onUpdateClass,
  onDeleteClass,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassInfo | null>(null);

  // Form state according to exact spec: { id, classname, schoolYear, homeroomTeacher, note }
  const [classname, setClassname] = useState('');
  const [schoolYear, setSchoolYear] = useState('2026 - 2027');
  const [homeroomTeacher, setHomeroomTeacher] = useState('');
  const [note, setNote] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingClass(null);
    setClassname('');
    setSchoolYear('2026 - 2027');
    setHomeroomTeacher('');
    setNote('');
    setIsModalOpen(true);
  };

  const openEditModal = (cls: ClassInfo) => {
    setEditingClass(cls);
    setClassname(cls.classname || cls.name || '');
    setSchoolYear(cls.schoolYear || '2026 - 2027');
    setHomeroomTeacher(cls.homeroomTeacher || cls.homeroomTeacherName || '');
    setNote(cls.note || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classname.trim() || !homeroomTeacher.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingClass) {
        await onUpdateClass(editingClass.id, {
          classname: classname.trim(),
          name: classname.trim(),
          schoolYear: schoolYear.trim(),
          homeroomTeacher: homeroomTeacher.trim(),
          homeroomTeacherName: homeroomTeacher.trim(),
          note: note.trim(),
        });
        setFeedbackMsg(`Cập nhật lớp ${classname} thành công!`);
      } else {
        await onCreateClass({
          classname: classname.trim(),
          name: classname.trim(),
          schoolYear: schoolYear.trim(),
          homeroomTeacher: homeroomTeacher.trim(),
          homeroomTeacherName: homeroomTeacher.trim(),
          note: note.trim(),
          totalStudents: 0,
        });
        setFeedbackMsg(`Thêm mới lớp ${classname} thành công!`);
      }
      setIsModalOpen(false);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error(err);
      setFeedbackMsg('Đã có lỗi xảy ra khi lưu thông tin lớp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const studentCount = students.filter((s) => s.classId === id).length;
    if (studentCount > 0) {
      if (!window.confirm(`Lớp "${name}" đang có ${studentCount} học sinh. Bạn có chắc chắn muốn xóa không?`)) {
        return;
      }
    } else {
      if (!window.confirm(`Xác nhận xóa lớp "${name}"?`)) {
        return;
      }
    }

    try {
      setDeletingId(id);
      await onDeleteClass(id);
      setFeedbackMsg(`Đã xóa lớp "${name}" thành công!`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredClasses = classes.filter((cls) => {
    const nameStr = (cls.classname || cls.name || '').toLowerCase();
    const teacherStr = (cls.homeroomTeacher || cls.homeroomTeacherName || '').toLowerCase();
    const noteStr = (cls.note || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    return nameStr.includes(q) || teacherStr.includes(q) || noteStr.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            <span>Quản Lý Lớp Học (ClassInfo CRUD)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Danh sách các lớp, phân công GVCN, năm học và ghi chú quản lý
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm Lớp Học Mới</span>
        </button>
      </div>

      {feedbackMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-semibold">{feedbackMsg}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo tên lớp, giáo viên chủ nhiệm, ghi chú..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Classes Table / Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.map((cls) => {
          const classNameDisplay = cls.classname || cls.name || 'Chưa đặt tên';
          const teacherDisplay = cls.homeroomTeacher || cls.homeroomTeacherName || 'Chưa phân công';
          const studentCount = students.filter((s) => s.classId === cls.id).length;
          const isCurrent = cls.id === currentClassId;

          return (
            <div
              key={cls.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between space-y-4 ${
                isCurrent
                  ? 'border-blue-500 ring-2 ring-blue-100 shadow-md'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs">
                      {classNameDisplay.substring(0, 3)}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">
                        {classNameDisplay}
                      </h3>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Năm học: {cls.schoolYear}
                      </span>
                    </div>
                  </div>

                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                      Đang chọn
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Giáo viên chủ nhiệm:</span>
                    <span className="font-bold text-slate-800">{teacherDisplay}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 flex items-center">
                      <Users className="h-3.5 w-3.5 mr-1 text-slate-400" />
                      Sĩ số hiện tại:
                    </span>
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                      {studentCount} học sinh
                    </span>
                  </div>

                  {cls.note && (
                    <div className="bg-slate-50 p-2 rounded-lg text-[11px] text-slate-600 border border-slate-100">
                      <strong className="text-slate-700">Ghi chú:</strong> {cls.note}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectCurrentClass(cls.id)}
                  disabled={isCurrent}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-colors ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-400 cursor-default'
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                  }`}
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>{isCurrent ? 'Lớp làm việc' : 'Chọn lớp'}</span>
                </button>

                <button
                  onClick={() => openEditModal(cls)}
                  className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Chỉnh sửa thông tin lớp"
                >
                  <Edit2 className="h-4 w-4" />
                </button>

                <button
                  onClick={() => handleDelete(cls.id, classNameDisplay)}
                  disabled={deletingId === cls.id}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Xóa lớp học"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create / Edit ClassInfo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingClass ? 'Cập Nhật Lớp Học' : 'Thêm Lớp Học Mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tên lớp học (classname) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 12A1, 11B2..."
                  value={classname}
                  onChange={(e) => setClassname(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Năm học (schoolYear) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="2026 - 2027"
                  value={schoolYear}
                  onChange={(e) => setSchoolYear(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Giáo viên chủ nhiệm (homeroomTeacher) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Thầy Nguyễn Văn Xuyên"
                  value={homeroomTeacher}
                  onChange={(e) => setHomeroomTeacher(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Ghi chú (note)
                </label>
                <textarea
                  rows={3}
                  placeholder="Mô tả lớp, phòng học, định hướng ban học..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  {isSubmitting ? 'Đang lưu...' : editingClass ? 'Lưu Thay Đổi' : 'Tạo Lớp Học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
