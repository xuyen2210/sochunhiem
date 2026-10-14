import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  BarChart3,
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  FileCheck2,
  Printer,
  Sparkles,
  CheckCircle2,
  Clock,
  User,
  Users,
  CheckCheck,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  School,
  AlertCircle,
  HelpCircle,
  Filter,
} from 'lucide-react';
import {
  Attendance,
  Behavior,
  ClassInfo,
  Report,
  ReportStudentStat,
  ReportTaskStat,
  Student,
  Task,
  TaskReply,
  WeekComparisonItem,
} from '../../core/types';

interface AdminReportsProps {
  reports: Report[];
  classes?: ClassInfo[];
  currentClassId?: string;
  attendance?: Attendance[];
  behaviors?: Behavior[];
  tasks?: Task[];
  taskReplies?: TaskReply[];
  students?: Student[];
  onGenerateWeeklyReport: (classId: string, week: number, year: number) => Promise<Report>;
  onGenerateMonthlyReport: (classId: string, month: number, year: number) => Promise<Report>;
}

export const AdminReports: React.FC<AdminReportsProps> = ({
  reports,
  classes = [],
  currentClassId = 'cls-12a1',
  attendance = [],
  behaviors = [],
  tasks = [],
  taskReplies = [],
  students = [],
  onGenerateWeeklyReport,
  onGenerateMonthlyReport,
}) => {
  // Tabs: 'weekly' | 'monthly'
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');
  const [selectedClassId, setSelectedClassId] = useState<string>(currentClassId || 'cls-12a1');
  const [week, setWeek] = useState<number>(5);
  const [month, setMonth] = useState<number>(10);
  const [year, setYear] = useState<number>(2026);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeReport, setActiveReport] = useState<Report | null>(() => {
    return reports.find((r) => r.type === 'weekly') || reports[0] || null;
  });
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const selectedClass = classes.find((c) => c.id === selectedClassId) || {
    id: 'cls-12a1',
    name: 'Lớp 12A1',
    classname: 'Lớp 12A1',
    homeroomTeacher: 'Thầy Nguyễn Văn Xuyên',
  };

  // Find report matching current tab & period if available
  const currentTabReport = useMemo(() => {
    if (activeReport && activeReport.type === activeTab) {
      return activeReport;
    }
    const found = reports.find((r) => r.type === activeTab && (!r.classId || r.classId === selectedClassId));
    return found || activeReport || null;
  }, [reports, activeTab, selectedClassId, activeReport]);

  const handleTabChange = (tab: 'weekly' | 'monthly') => {
    setActiveTab(tab);
    const existing = reports.find((r) => r.type === tab && (!r.classId || r.classId === selectedClassId));
    if (existing) {
      setActiveReport(existing);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'weekly') {
        const res = await onGenerateWeeklyReport(selectedClassId, week, year);
        setActiveReport(res);
      } else {
        const res = await onGenerateMonthlyReport(selectedClassId, month, year);
        setActiveReport(res);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Export Excel (.xlsx) for Attendance
  const handleExportAttendanceExcel = () => {
    try {
      const classAttendance = attendance.filter((a) => !selectedClassId || a.classId === selectedClassId);
      const studentMap = new Map<string, string>();
      students.forEach((s) => studentMap.set(s.id, s.fullname || s.name || 'Học sinh'));

      const titleRow = [`BÁO CÁO CHUYÊN CẦN ĐIỂM DANH - ${(selectedClass.name || 'TẤT CẢ CÁC LỚP').toUpperCase()}`];
      const metaRow = [
        `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`,
        `Tổng số lượt điểm danh: ${classAttendance.length}`,
      ];
      const emptyRow: any[] = [];

      const headers = ['STT', 'Mã Học Sinh', 'Họ Và Tên', 'Lớp', 'Ngày Điểm Danh', 'Trạng Thái', 'Ghi Chú', 'Cập Nhật Lúc'];
      const rows = classAttendance.map((rec, idx) => {
        const studentName = rec.studentName || studentMap.get(rec.studentId) || 'Học sinh';
        const statusText =
          rec.status === 'PRESENT'
            ? 'Có mặt'
            : rec.status === 'ABSENT'
            ? 'Vắng mặt'
            : rec.status === 'LATE'
            ? 'Đi muộn'
            : rec.status;
        return [
          idx + 1,
          rec.studentId,
          studentName,
          selectedClass.name || 'Lớp 12A1',
          rec.date,
          statusText,
          rec.note || '',
          rec.updatedAt || '',
        ];
      });

      const wsData = [titleRow, metaRow, emptyRow, headers, ...rows];
      const worksheet = XLSX.utils.aoa_to_sheet(wsData);
      worksheet['!cols'] = [
        { wch: 8 },
        { wch: 18 },
        { wch: 28 },
        { wch: 14 },
        { wch: 16 },
        { wch: 16 },
        { wch: 28 },
        { wch: 22 },
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'DiemDanh');
      const sanitizedName = (selectedClass.name || '12A1').replace(/[^a-zA-Z0-9_\-]/g, '_');
      const fileName = `Diem_danh_${sanitizedName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      setExportNotice(`Đã xuất thành công tệp Excel: ${fileName}`);
      setTimeout(() => setExportNotice(null), 4000);
    } catch (err) {
      console.error('Lỗi khi xuất Excel điểm danh:', err);
      setExportNotice('Có lỗi xảy ra khi tạo tệp Excel.');
      setTimeout(() => setExportNotice(null), 4000);
    }
  };

  // Export CSV for Attendance
  const handleExportAttendanceCSV = () => {
    const classAttendance = attendance.filter((a) => !selectedClassId || a.classId === selectedClassId);
    const studentMap = new Map<string, string>();
    students.forEach((s) => studentMap.set(s.id, s.fullname || s.name || 'Học sinh'));

    const headers = ['STT', 'Mã Học Sinh', 'Họ Và Tên', 'Lớp', 'Ngày Điểm Danh', 'Trạng Thái', 'Ghi Chú', 'Cập Nhật Lúc'];
    const rows = classAttendance.map((rec, idx) => {
      const studentName = rec.studentName || studentMap.get(rec.studentId) || 'Học sinh';
      const statusText =
        rec.status === 'PRESENT'
          ? 'Có mặt'
          : rec.status === 'ABSENT'
          ? 'Vắng mặt'
          : rec.status === 'LATE'
          ? 'Đi muộn'
          : rec.status;
      const note = (rec.note || '').replace(/"/g, '""');

      return [
        idx + 1,
        `"${rec.studentId}"`,
        `"${studentName}"`,
        `"${selectedClass.name || 'Lớp 12A1'}"`,
        `"${rec.date}"`,
        `"${statusText}"`,
        `"${note}"`,
        `"${rec.updatedAt || ''}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const fileName = `Diem_danh_${selectedClass.name || '12A1'}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportNotice(`Đã xuất thành công tệp: ${fileName}`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  // Export Excel (.xlsx) for Behaviors
  const handleExportBehaviorExcel = () => {
    try {
      const classBehaviors = behaviors.filter((b) => !selectedClassId || b.classId === selectedClassId);
      const studentMap = new Map<string, string>();
      students.forEach((s) => studentMap.set(s.id, s.fullname || s.name || 'Học sinh'));

      const titleRow = [`BÁO CÁO NỀ NẾP & THI ĐUA HỌC SINH - LỚP ${(selectedClass.name || '12A1').toUpperCase()}`];
      const metaRow = [
        `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`,
        `Tổng số lượt ghi nhận: ${classBehaviors.length}`,
        `Giáo viên chủ nhiệm: ${selectedClass.homeroomTeacher || 'Thầy Nguyễn Văn Xuyên'}`,
      ];
      const emptyRow: any[] = [];

      const headers = [
        'STT',
        'Mã Học Sinh',
        'Họ Và Tên',
        'Lớp',
        'Ngày Ghi Nhận',
        'Phân Loại',
        'Tiêu Đề / Nội Dung',
        'Điểm Thi Đua',
        'Thời Gian Tạo',
      ];

      const rows = classBehaviors.map((rec, idx) => {
        const studentName = rec.studentName || studentMap.get(rec.studentId) || 'Học sinh';
        const typeText =
          rec.type === 'PRAISE'
            ? 'Khen thưởng (+)'
            : rec.type === 'WARN'
            ? 'Nhắc nhở (-)'
            : rec.type === 'violation'
            ? 'Vi phạm (-)'
            : rec.type;

        return [
          idx + 1,
          rec.studentId,
          studentName,
          selectedClass.name || 'Lớp 12A1',
          rec.date || '',
          typeText,
          rec.content || rec.title || '',
          rec.points ?? (rec.type === 'PRAISE' ? 5 : -2),
          rec.createdAt || '',
        ];
      });

      const wsData = [titleRow, metaRow, emptyRow, headers, ...rows];
      const worksheet = XLSX.utils.aoa_to_sheet(wsData);

      worksheet['!cols'] = [
        { wch: 8 },  // STT
        { wch: 16 }, // Mã Học Sinh
        { wch: 28 }, // Họ Và Tên
        { wch: 14 }, // Lớp
        { wch: 16 }, // Ngày Ghi Nhận
        { wch: 18 }, // Phân Loại
        { wch: 45 }, // Tiêu Đề / Nội Dung
        { wch: 14 }, // Điểm Thi Đua
        { wch: 24 }, // Thời Gian Tạo
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'ThiDuaNeNep');
      const sanitizedName = (selectedClass.name || '12A1').replace(/[^a-zA-Z0-9_\-]/g, '_');
      const fileName = `Thi_dua_ne_nep_${sanitizedName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      setExportNotice(`Đã xuất thành công tệp Excel: ${fileName}`);
      setTimeout(() => setExportNotice(null), 4000);
    } catch (err) {
      console.error('Lỗi khi xuất Excel thi đua:', err);
      setExportNotice('Có lỗi xảy ra khi tạo tệp Excel thi đua.');
      setTimeout(() => setExportNotice(null), 4000);
    }
  };

  // Export CSV for Behaviors
  const handleExportBehaviorCSV = () => {
    const classBehaviors = behaviors.filter((b) => !selectedClassId || b.classId === selectedClassId);
    const studentMap = new Map<string, string>();
    students.forEach((s) => studentMap.set(s.id, s.fullname || s.name || 'Học sinh'));

    const headers = [
      'STT',
      'Mã Học Sinh',
      'Họ Và Tên',
      'Lớp',
      'Ngày Ghi Nhận',
      'Phân Loại',
      'Tiêu Đề / Nội Dung',
      'Điểm Thi Đua',
      'Thời Gian Tạo',
    ];

    const rows = classBehaviors.map((rec, idx) => {
      const studentName = rec.studentName || studentMap.get(rec.studentId) || 'Học sinh';
      const typeText =
        rec.type === 'PRAISE'
          ? 'Khen thưởng (+)'
          : rec.type === 'WARN'
          ? 'Nhắc nhở (-)'
          : rec.type === 'violation'
          ? 'Vi phạm (-)'
          : rec.type;
      const content = (rec.content || rec.title || '').replace(/"/g, '""');

      return [
        idx + 1,
        `"${rec.studentId}"`,
        `"${studentName}"`,
        `"${selectedClass.name || 'Lớp 12A1'}"`,
        `"${rec.date || ''}"`,
        `"${typeText}"`,
        `"${content}"`,
        rec.points ?? (rec.type === 'PRAISE' ? 5 : -2),
        `"${rec.createdAt || ''}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const fileName = `Ne_nep_thi_dua_${selectedClass.name || '12A1'}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportNotice(`Đã xuất thành công tệp: ${fileName}`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  const report = currentTabReport;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <span>Báo Cáo Tổng Hợp & Đánh Giá Nề Nếp Lớp Học</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng hợp dữ liệu chuyên cần, nề nếp thi đua, tiến độ nhắc việc và xuất bảng tính CSV
          </p>
        </div>

        {/* Global actions: Export Excel / CSV & Print */}
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button
            onClick={handleExportAttendanceExcel}
            title="Tải bảng dữ liệu chuyên cần định dạng Excel (.xlsx)"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center space-x-1.5"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-100" />
            <span>Xuất Excel Chuyên Cần (.xlsx)</span>
          </button>

          <button
            onClick={handleExportAttendanceCSV}
            title="Tải bảng dữ liệu chuyên cần định dạng CSV"
            className="px-2.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-xl transition-colors flex items-center space-x-1 shadow-2xs"
          >
            <span>CSV Điểm Danh</span>
          </button>

          <button
            onClick={handleExportBehaviorExcel}
            title="Tải bảng dữ liệu nề nếp thi đua định dạng Excel (.xlsx)"
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center space-x-1.5"
          >
            <FileSpreadsheet className="h-4 w-4 text-indigo-100" />
            <span>Xuất Excel Thi Đua (.xlsx)</span>
          </button>

          <button
            onClick={handleExportBehaviorCSV}
            title="Tải bảng dữ liệu nề nếp thi đua định dạng CSV"
            className="px-2.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold rounded-xl transition-colors flex items-center space-x-1 shadow-2xs"
          >
            <span>CSV Thi Đua</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <Printer className="h-4 w-4" />
            <span>In / Xuất PDF</span>
          </button>
        </div>
      </div>

      {/* Export notification alert */}
      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between animate-fade-in print:hidden">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span>{exportNotice}</span>
          </div>
          <button onClick={() => setExportNotice(null)} className="text-emerald-600 hover:text-emerald-900 text-xs font-bold">
            Đóng
          </button>
        </div>
      )}

      {/* 2 Tabs: Weekly & Monthly and Selector Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* Prominent Tab Switcher */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => handleTabChange('weekly')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'weekly'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Báo Cáo Tuần (Weekly)</span>
            </button>

            <button
              onClick={() => handleTabChange('monthly')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'monthly'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Báo Cáo Tháng (Monthly)</span>
            </button>
          </div>

          {/* Class Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
              <School className="h-3.5 w-3.5 text-slate-400" />
              <span>Lớp:</span>
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="text-xs font-bold rounded-lg border border-slate-200 p-1.5 bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {classes.length > 0 ? (
                classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || c.classname}
                  </option>
                ))
              ) : (
                <option value="cls-12a1">Lớp 12A1</option>
              )}
            </select>
          </div>
        </div>

        {/* Filter controls by Period */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {activeTab === 'weekly' ? (
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-600">Chọn tuần:</span>
                <select
                  value={week}
                  onChange={(e) => setWeek(Number(e.target.value))}
                  className="text-xs font-semibold rounded-lg border border-slate-200 p-1.5 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((w) => (
                    <option key={w} value={w}>
                      Tuần {w < 10 ? '0' + w : w}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                  {week === 5 ? '05/10/2026 - 11/10/2026' : `Kỳ học 1 (Năm 2026)`}
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-600">Chọn tháng:</span>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="text-xs font-semibold rounded-lg border border-slate-200 p-1.5 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {[9, 10, 11, 12, 1, 2, 3, 4, 5].map((m) => (
                    <option key={m} value={m}>
                      Tháng {m < 10 ? '0' + m : m}
                    </option>
                  ))}
                </select>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="text-xs font-semibold rounded-lg border border-slate-200 p-1.5 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value={2026}>Năm 2026</option>
                  <option value={2027}>Năm 2027</option>
                </select>
              </div>
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center space-x-1.5"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isLoading ? 'Đang phân tích...' : 'Tổng Hợp Dữ Liệu'}</span>
          </button>
        </div>
      </div>

      {/* Main Report Document View */}
      {report ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 print:border-none print:shadow-none print:p-0">
          {/* Header */}
          <div className="border-b border-slate-200 pb-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center space-x-1.5">
                  <School className="h-3.5 w-3.5" />
                  <span>Trung Tâm GDNN - GDTX Long Mỹ • Năm Học 2026 - 2027</span>
                </p>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {report.periodLabel}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lớp: <strong className="text-slate-800">{selectedClass.name || '12A1'}</strong> • Sĩ số:{' '}
                  <strong className="text-slate-800">{report.totalStudents}</strong> học sinh • GVCN:{' '}
                  <strong className="text-slate-800">{selectedClass.homeroomTeacher || 'Thầy Nguyễn Văn Xuyên'}</strong>
                </p>
              </div>

              <div className="text-right">
                <span className="inline-block px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold text-[11px]">
                  {report.type === 'weekly' ? 'Báo Cáo Tuần' : 'Báo Cáo Tháng'}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Ngày xuất: {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          </div>

          {/* Key Metrics Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* 1. Tỉ lệ chuyên cần */}
            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
              <span className="text-[11px] font-semibold text-blue-700 block">Tỉ lệ chuyên cần</span>
              <p className="text-2xl font-black text-blue-800 mt-1">{report.attendanceRate}%</p>
              <div className="w-full bg-blue-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, report.attendanceRate)}%` }}
                />
              </div>
            </div>

            {/* 2. Số HS vắng */}
            <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100">
              <span className="text-[11px] font-semibold text-rose-700 block">Số lượt vắng</span>
              <p className="text-2xl font-black text-rose-700 mt-1">{report.absentCount}</p>
              <span className="text-[10px] text-rose-600">
                {report.absentStudents && report.absentStudents.length > 0
                  ? `${report.absentStudents.length} học sinh`
                  : 'Không có vắng'}
              </span>
            </div>

            {/* 3. Số HS đi trễ */}
            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100">
              <span className="text-[11px] font-semibold text-amber-700 block">Lượt đi học muộn</span>
              <p className="text-2xl font-black text-amber-700 mt-1">{report.lateCount}</p>
              <span className="text-[10px] text-amber-600">
                {report.lateStudents && report.lateStudents.length > 0
                  ? `${report.lateStudents.length} học sinh`
                  : 'Đúng giờ 100%'}
              </span>
            </div>

            {/* 4. Khen thưởng */}
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-[11px] font-semibold text-emerald-700 block">Khen thưởng thi đua</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">+{report.praisesCount}</p>
              <span className="text-[10px] text-emerald-600">Lượt biểu dương</span>
            </div>

            {/* 5. Nhắc nhở */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-600 block">Trường hợp nhắc nhở</span>
              <p className="text-2xl font-black text-slate-800 mt-1">{report.violationsCount}</p>
              <span className="text-[10px] text-slate-500">Cần theo dõi</span>
            </div>

            {/* 6. Task quá hạn & Phản hồi PH */}
            <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
              <span className="text-[11px] font-semibold text-indigo-700 block">Phụ huynh phản hồi</span>
              <p className="text-2xl font-black text-indigo-800 mt-1">
                {report.repliedParentsCount ?? 6}
                <span className="text-xs font-normal text-indigo-500">/{report.totalStudents}</span>
              </p>
              <span className="text-[10px] text-indigo-600">
                Quá hạn: <strong>{report.overdueTasksCount ?? (report.overdueTasks?.length || 0)}</strong> task
              </span>
            </div>
          </div>

          {/* MONTHLY ONLY: Weekly Comparison Section */}
          {report.type === 'monthly' && report.weekComparison && report.weekComparison.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span>Bảng So Sánh Chỉ Số Từng Tuần Trong Tháng</span>
                </h4>
                <span className="text-[11px] text-slate-500">Tổng hợp 4 tuần liên tiếp</span>
              </div>

              {/* Responsive Comparison Cards & Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-white border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px]">
                      <th className="py-2.5 px-3">Tuần</th>
                      <th className="py-2.5 px-3">Chuyên Cần</th>
                      <th className="py-2.5 px-3">Vắng</th>
                      <th className="py-2.5 px-3">Đi Muộn</th>
                      <th className="py-2.5 px-3">Khen Thưởng</th>
                      <th className="py-2.5 px-3">Nhắc Nhở</th>
                      <th className="py-2.5 px-3">PH Phản Hồi</th>
                      <th className="py-2.5 px-3 text-right">Xu Hướng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {report.weekComparison.map((w, idx) => (
                      <tr key={idx} className="bg-white hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-slate-800 flex items-center space-x-1.5">
                          <Calendar className="h-3.5 w-3.5 text-blue-500" />
                          <span>{w.weekLabel}</span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-blue-700">{w.attendanceRate}%</td>
                        <td className="py-2.5 px-3 font-semibold text-rose-600">{w.absentCount}</td>
                        <td className="py-2.5 px-3 font-semibold text-amber-600">{w.lateCount}</td>
                        <td className="py-2.5 px-3 font-semibold text-emerald-600">+{w.praisesCount}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-700">{w.violationsCount}</td>
                        <td className="py-2.5 px-3 font-semibold text-indigo-700">{w.repliesCount} lượt</td>
                        <td className="py-2.5 px-3 text-right">
                          {w.trend === 'up' ? (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <ArrowUpRight className="h-3 w-3" />
                              <span>Tích cực</span>
                            </span>
                          ) : w.trend === 'down' ? (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              <ArrowDownRight className="h-3 w-3" />
                              <span>Lưu ý</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                              <Minus className="h-3 w-3" />
                              <span>Ổn định</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section: Top Khen & Top Nhắc Nhở */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Top Khen */}
            <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-3">
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Award className="h-4 w-4 text-emerald-600" />
                <span>Top Khen Thưởng Thi Đua Nổi Bật</span>
              </h4>

              {report.topPraised && report.topPraised.length > 0 ? (
                <div className="space-y-2">
                  {report.topPraised.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-white rounded-xl border border-emerald-100 flex items-start justify-between gap-2 shadow-2xs"
                    >
                      <div className="flex items-start space-x-2.5">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{item.studentName}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {item.reasons && item.reasons.length > 0
                              ? item.reasons.slice(0, 2).join(' • ')
                              : 'Tích cực xây dựng bài học & gương mẫu'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 px-2 py-0.5 rounded-lg bg-emerald-50 flex-shrink-0">
                        +{item.points ?? 5}đ ({item.count} lượt)
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Chưa có ghi nhận khen thưởng trong kỳ báo cáo.</p>
              )}
            </div>

            {/* Top Nhắc */}
            <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100 space-y-3">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center space-x-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>Top Nhắc Nhở & Cần Lưu Ý Rèn Luyện</span>
              </h4>

              {report.topViolations && report.topViolations.length > 0 ? (
                <div className="space-y-2">
                  {report.topViolations.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-white rounded-xl border border-amber-100 flex items-start justify-between gap-2 shadow-2xs"
                    >
                      <div className="flex items-start space-x-2.5">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px] flex items-center justify-center mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{item.studentName}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {item.reasons && item.reasons.length > 0
                              ? item.reasons.slice(0, 2).join(' • ')
                              : 'Đi học muộn hoặc chưa chuẩn bị bài'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-700 px-2 py-0.5 rounded-lg bg-amber-50 flex-shrink-0">
                        {item.points ?? -2}đ ({item.count} lần)
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Không có trường hợp nhắc nhở nào trong kỳ này.</p>
              )}
            </div>
          </div>

          {/* Section: Chuyên Cần Chi Tiết (HS Vắng / Đi Trễ) & Task Quá Hạn */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Chi tiết Vắng & Đi muộn */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Clock className="h-4 w-4 text-rose-600" />
                <span>Danh Sách Học Sinh Vắng & Đi Học Muộn</span>
              </h4>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {/* Vắng */}
                {report.absentStudents && report.absentStudents.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase text-rose-600 block mb-1">
                      • Vắng mặt ({report.absentStudents.length} học sinh):
                    </span>
                    {report.absentStudents.map((st, i) => (
                      <div key={i} className="text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200 mb-1 flex items-center justify-between">
                        <div>
                          <strong className="text-slate-800">{st.studentName}</strong>
                          <span className="text-[11px] text-slate-500 ml-1.5">
                            ({st.dates?.join(', ') || 'Tuần này'})
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-rose-600 px-2 py-0.5 bg-rose-50 rounded">
                          {st.notes?.join('; ') || 'Vắng có phép'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Đi muộn */}
                {report.lateStudents && report.lateStudents.length > 0 && (
                  <div className="mt-2">
                    <span className="text-[10px] font-bold uppercase text-amber-600 block mb-1">
                      • Đi học muộn ({report.lateStudents.length} học sinh):
                    </span>
                    {report.lateStudents.map((st, i) => (
                      <div key={i} className="text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200 mb-1 flex items-center justify-between">
                        <div>
                          <strong className="text-slate-800">{st.studentName}</strong>
                          <span className="text-[11px] text-slate-500 ml-1.5">
                            ({st.dates?.join(', ') || 'Đầu giờ'})
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-amber-700 px-2 py-0.5 bg-amber-50 rounded">
                          {st.notes?.join('; ') || 'Đi muộn 5-10p'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {(!report.absentStudents || report.absentStudents.length === 0) &&
                  (!report.lateStudents || report.lateStudents.length === 0) && (
                    <p className="text-xs text-emerald-600 italic">100% học sinh tham gia học tập đúng giờ đầy đủ!</p>
                  )}
              </div>
            </div>

            {/* Task Quá Hạn & Tình Hình Phản Hồi */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <AlertCircle className="h-4 w-4 text-indigo-600" />
                  <span>Bài Tập Quá Hạn & Tiến Độ Phản Hồi</span>
                </h4>
                <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-bold">
                  {report.repliedParentsCount ?? 6}/{report.totalStudents} phụ huynh đã nộp
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {report.overdueTasks && report.overdueTasks.length > 0 ? (
                  report.overdueTasks.map((t, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-white rounded-xl border border-rose-200 flex items-start justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] px-1.5 py-0.5 bg-rose-100 text-rose-700 font-bold rounded">
                            QUÁ HẠN
                          </span>
                          <p className="text-xs font-bold text-slate-800">{t.title}</p>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Hạn chót: <strong>{t.dueDate}</strong> • Yêu cầu phản hồi:{' '}
                          {t.requireReply ? 'Có' : 'Không'}
                        </p>
                      </div>
                      <span className="text-[11px] text-indigo-600 font-semibold px-2 py-0.5 bg-indigo-50 rounded flex-shrink-0">
                        {t.repliesCount} phản hồi
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-emerald-700 flex items-center space-x-2">
                    <CheckCheck className="h-4 w-4 text-emerald-600" />
                    <span>Không có bài tập hay nhắc việc nào bị quá hạn!</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section: Điểm Nhấn Đánh Giá */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
              <FileCheck2 className="h-4 w-4 text-emerald-600" />
              <span>1. Đánh Giá Tình Hình Chung & Điểm Nhấn Nổi Bật</span>
            </h4>
            <div className="space-y-2">
              {report.summaryHighlights.map((hl, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs text-slate-800 leading-relaxed flex items-start space-x-2"
                >
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{hl}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Kiến Nghị & Kế Hoạch Trọng Tâm */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>2. Kiến Nghị & Kế Hoạch Trọng Tâm Thời Gian Tới</span>
            </h4>
            <div className="space-y-2">
              {report.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-xs text-slate-800 leading-relaxed flex items-start space-x-2"
                >
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Signature */}
          <div className="pt-8 border-t border-slate-200 flex justify-end text-center">
            <div className="space-y-1">
              <p className="text-xs text-slate-500">
                Long Mỹ, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
              </p>
              <p className="text-xs font-bold text-slate-900 uppercase">GIÁO VIÊN CHỦ NHIỆM</p>
              <div className="h-16 flex items-end justify-center">
                <span className="font-serif italic text-blue-800 text-base font-semibold">Nguyễn Văn Xuyên</span>
              </div>
              <p className="text-xs font-bold text-slate-800">
                {selectedClass.homeroomTeacher || 'Thầy Nguyễn Văn Xuyên'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
          Bấm &ldquo;Tổng Hợp Dữ Liệu&rdquo; để xem báo cáo chi tiết.
        </div>
      )}
    </div>
  );
};
