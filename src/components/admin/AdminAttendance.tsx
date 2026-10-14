import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  CalendarCheck2,
  CheckCircle2,
  Clock,
  XCircle,
  Save,
  Check,
  Calendar,
  GraduationCap,
  Sparkles,
  Search,
  Filter,
  FileSpreadsheet,
  Download,
  ExternalLink,
} from 'lucide-react';
import { Attendance, ClassInfo, Student } from '../../core/types';
import {
  getAccessToken,
  googleSignIn,
  exportAttendanceToGoogleSheet,
} from '../../services/googleWorkspace';

interface AdminAttendanceProps {
  students: Student[];
  classes: ClassInfo[];
  currentClassId: string;
  initialAttendance: Attendance[];
  onSaveAttendance: (
    classId: string,
    date: string,
    records: {
      studentId: string;
      studentName?: string;
      status: any;
      note?: string;
    }[]
  ) => Promise<void>;
}

export const AdminAttendance: React.FC<AdminAttendanceProps> = ({
  students,
  classes,
  currentClassId,
  initialAttendance,
  onSaveAttendance,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(currentClassId || classes[0]?.id || 'cls-12a1');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-07');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Filter students belonging to chosen class
  const classStudents = students.filter((st) => st.classId === selectedClassId);

  // Local state map for attendance statuses & notes for selectedDate
  const [records, setRecords] = useState<
    Record<
      string,
      {
        status: 'PRESENT' | 'ABSENT' | 'LATE';
        note: string;
      }
    >
  >({});

  // Sync records when selectedDate or selectedClassId changes or initialAttendance updates
  useEffect(() => {
    const map: Record<string, { status: 'PRESENT' | 'ABSENT' | 'LATE'; note: string }> = {};

    classStudents.forEach((st) => {
      const existing = initialAttendance.find(
        (a) => a.studentId === st.id && a.date === selectedDate
      );

      let statusValue: 'PRESENT' | 'ABSENT' | 'LATE' = 'PRESENT';
      if (existing) {
        const up = String(existing.status).toUpperCase();
        if (up === 'ABSENT' || up === 'EXCUSED') {
          statusValue = 'ABSENT';
        } else if (up === 'LATE') {
          statusValue = 'LATE';
        } else {
          statusValue = 'PRESENT';
        }
      }

      map[st.id] = {
        status: statusValue,
        note: existing?.note || '',
      };
    });

    setRecords(map);
  }, [selectedClassId, selectedDate, students, initialAttendance]);

  const handleStatusChange = (
    studentId: string,
    status: 'PRESENT' | 'ABSENT' | 'LATE'
  ) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        note,
      },
    }));
  };

  const markAllPresent = () => {
    setRecords((prev) => {
      const next = { ...prev };
      classStudents.forEach((st) => {
        next[st.id] = {
          ...next[st.id],
          status: 'PRESENT',
        };
      });
      return next;
    });
  };

  // Bulk Save handler calling provider markAttendance({ classId, date, items[] })
  const handleBulkSave = async () => {
    setIsSaving(true);
    try {
      const items = classStudents.map((st) => ({
        studentId: st.id,
        studentName: st.fullname || st.fullName || 'Học sinh',
        status: records[st.id]?.status || 'PRESENT',
        note: records[st.id]?.note || '',
      }));

      await onSaveAttendance(selectedClassId, selectedDate, items);
      const chosenClass = classes.find((c) => c.id === selectedClassId);
      setSaveMessage(`Đã lưu hàng loạt (Bulk Save) chuyên cần ngày ${selectedDate} cho lớp ${chosenClass?.classname || chosenClass?.name || ''} thành công!`);
      setTimeout(() => setSaveMessage(null), 3500);
    } catch (err) {
      console.error(err);
      setSaveMessage('Lỗi khi lưu chuyên cần hàng loạt.');
    } finally {
      setIsSaving(false);
    }
  };

  // Stats calculation
  const totalInClass = classStudents.length;
  const presentCount = classStudents.filter((st) => (records[st.id]?.status || 'PRESENT') === 'PRESENT').length;
  const lateCount = classStudents.filter((st) => records[st.id]?.status === 'LATE').length;
  const absentCount = classStudents.filter((st) => records[st.id]?.status === 'ABSENT').length;
  const attendanceRate = totalInClass > 0 ? Math.round(((presentCount + lateCount * 0.5) / totalInClass) * 100) : 100;

  // Filter students by search term in table
  const displayedStudents = classStudents.filter((st) => {
    const nameMatch = (st.fullname || st.fullName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const codeMatch = (st.studentCode || '').toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || codeMatch;
  });

  const activeClassName = classes.find((c) => c.id === selectedClassId)?.classname || classes.find((c) => c.id === selectedClassId)?.name || 'Lớp';

  // Xuất file Excel (.xlsx) chuẩn định dạng
  const handleExportExcel = () => {
    try {
      const sanitizedClassName = (activeClassName || 'Lop').replace(/[^a-zA-Z0-9_\-]/g, '_');

      // 1. Dòng tiêu đề và thông tin chung
      const titleRow = [`SỔ ĐIỂM DANH CHUYÊN CẦN - LỚP ${(activeClassName || '').toUpperCase()}`];
      const metaRow = [
        `Ngày điểm danh: ${selectedDate}`,
        `Tổng sĩ số: ${totalInClass} học sinh`,
        `Có mặt: ${presentCount}`,
        `Vắng mặt: ${absentCount}`,
        `Đi muộn: ${lateCount}`,
        `Tỉ lệ chuyên cần: ${attendanceRate}%`,
      ];
      const emptyRow: any[] = [];

      // 2. Tiêu đề các cột dữ liệu
      const headers = [
        'STT',
        'Mã Học Sinh',
        'Họ Và Tên',
        'Lớp',
        'Ngày Điểm Danh',
        'Trạng Thái',
        'Ghi Chú',
      ];

      // 3. Dữ liệu từng học sinh
      const rows = classStudents.map((st, idx) => {
        const rec = records[st.id] || { status: 'PRESENT', note: '' };
        const statusText =
          rec.status === 'PRESENT'
            ? 'Có mặt'
            : rec.status === 'ABSENT'
            ? 'Vắng mặt'
            : 'Đi muộn';

        return [
          idx + 1,
          st.studentCode || st.id,
          st.fullname || st.fullName || 'Học sinh',
          activeClassName,
          selectedDate,
          statusText,
          rec.note || '',
        ];
      });

      // 4. Dòng tổng kết cuối bảng
      const summaryRow = [
        'Tổng kết',
        '',
        `Sĩ số: ${totalInClass} học sinh`,
        activeClassName,
        selectedDate,
        `Có mặt: ${presentCount} | Vắng: ${absentCount} | Đi muộn: ${lateCount}`,
        `Tỉ lệ chuyên cần: ${attendanceRate}%`,
      ];

      const wsData = [
        titleRow,
        metaRow,
        emptyRow,
        headers,
        ...rows,
        emptyRow,
        summaryRow,
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(wsData);

      // Định dạng độ rộng cột (Column widths)
      worksheet['!cols'] = [
        { wch: 8 },  // STT
        { wch: 18 }, // Mã Học Sinh
        { wch: 28 }, // Họ Và Tên
        { wch: 14 }, // Lớp
        { wch: 18 }, // Ngày Điểm Danh
        { wch: 16 }, // Trạng Thái
        { wch: 32 }, // Ghi Chú
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'DiemDanh');

      const fileName = `Diem_danh_${sanitizedClassName}_${selectedDate}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      setSaveMessage(`Đã xuất thành công tệp Excel (.xlsx): ${fileName}`);
      setTimeout(() => setSaveMessage(null), 4500);
    } catch (err) {
      console.error('Lỗi khi xuất file Excel:', err);
      setSaveMessage('Lỗi khi tạo tệp Excel (.xlsx). Vui lòng thử lại.');
      setTimeout(() => setSaveMessage(null), 4500);
    }
  };

  const handleExportCSV = () => {
    const headers = ['STT', 'Mã Học Sinh', 'Họ Và Tên', 'Lớp', 'Ngày Điểm Danh', 'Trạng Thái', 'Ghi Chú'];
    const rows = classStudents.map((st, idx) => {
      const rec = records[st.id] || { status: 'PRESENT', note: '' };
      const statusText = rec.status === 'PRESENT' ? 'Có mặt' : rec.status === 'ABSENT' ? 'Vắng mặt' : 'Đi muộn';
      const note = (rec.note || '').replace(/"/g, '""');
      return [
        idx + 1,
        `"${st.studentCode || st.id}"`,
        `"${st.fullname || st.fullName || 'Học sinh'}"`,
        `"${activeClassName}"`,
        `"${selectedDate}"`,
        `"${statusText}"`,
        `"${note}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Diem_danh_${activeClassName}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const [isExportingSheets, setIsExportingSheets] = useState(false);

  // Xuất Sổ Điểm Danh lên Google Sheets
  const handleExportGoogleSheet = async () => {
    setIsExportingSheets(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        const signRes = await googleSignIn();
        if (!signRes) {
          setSaveMessage('Chưa đăng nhập Google để xuất bảng tính');
          setIsExportingSheets(false);
          return;
        }
      }

      const currentAttendanceRecords: Attendance[] = classStudents.map((st) => {
        const rec = records[st.id];
        const status = rec?.status || 'PRESENT';
        return {
          id: `${st.id}_${selectedDate}`,
          classId: selectedClassId,
          studentId: st.id,
          studentName: st.fullname || st.fullName || 'Học sinh',
          date: selectedDate,
          status,
          note: rec?.note || '',
        };
      });

      const res = await exportAttendanceToGoogleSheet(
        currentAttendanceRecords,
        classStudents,
        activeClassName,
        selectedDate
      );
      setSaveMessage('Đã xuất sổ điểm danh lên Google Sheets thành công!');
      window.open(res.spreadsheetUrl, '_blank');
      setTimeout(() => setSaveMessage(null), 5000);
    } catch (err: any) {
      console.error('Lỗi khi xuất Google Sheets:', err);
      setSaveMessage(err.message || 'Lỗi khi tạo Google Sheet.');
      setTimeout(() => setSaveMessage(null), 5000);
    } finally {
      setIsExportingSheets(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <CalendarCheck2 className="h-6 w-6 text-blue-600" />
            <span>Sổ Điểm Danh Chuyên Cần (Bulk Save)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Chọn lớp + chọn ngày, ghi nhận trạng thái PRESENT / ABSENT / LATE và lưu hàng loạt
          </p>
        </div>

        {/* Buttons: Export Excel (.xlsx) & Bulk Save */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 whitespace-nowrap active:scale-[0.98]"
            title="Xuất danh sách điểm danh ra tệp Excel (.xlsx)"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-100" />
            <span>Xuất Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportGoogleSheet}
            disabled={isExportingSheets}
            className="px-4 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 whitespace-nowrap active:scale-[0.98] cursor-pointer disabled:opacity-50"
            title="Xuất trực tiếp lên Google Sheets trên Google Drive"
          >
            <ExternalLink className="h-4 w-4 text-teal-600" />
            <span>{isExportingSheets ? 'Đang tạo Sheet...' : 'Lưu Google Sheets'}</span>
          </button>

          <button
            onClick={handleBulkSave}
            disabled={isSaving || totalInClass === 0}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 whitespace-nowrap"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Đang lưu hàng loạt...' : 'Lưu Hàng Loạt (Bulk Save)'}</span>
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-semibold">{saveMessage}</span>
        </div>
      )}

      {/* Class & Date Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Chọn Lớp */}
          <div className="flex items-center space-x-2">
            <label className="text-xs font-bold text-slate-700 whitespace-nowrap flex items-center">
              <GraduationCap className="h-4 w-4 mr-1 text-blue-600" />
              Chọn lớp:
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="text-xs font-bold rounded-xl border border-slate-200 py-2 px-3 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500/20"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.classname || cls.name} ({students.filter((s) => s.classId === cls.id).length} HS)
                </option>
              ))}
            </select>
          </div>

          {/* Chọn Ngày */}
          <div className="flex items-center space-x-2">
            <label className="text-xs font-bold text-slate-700 whitespace-nowrap flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-indigo-600" />
              Chọn ngày:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-bold rounded-xl border border-slate-200 p-2 text-slate-800 bg-white focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Quick Batch Helper */}
        <div className="flex items-center space-x-2">
          <button
            onClick={markAllPresent}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl transition-colors whitespace-nowrap flex items-center space-x-1"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Tất cả có mặt (PRESENT)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Counter for the Day */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-blue-100 bg-blue-50/20">
          <p className="text-[11px] font-bold text-blue-600 uppercase">Sĩ số lớp {activeClassName}</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalInClass} <span className="text-xs text-slate-500 font-normal">học sinh</span></p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/30">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-emerald-700 uppercase">PRESENT (Có mặt)</p>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-1">{presentCount}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-100 bg-amber-50/30">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-amber-700 uppercase">LATE (Đi trễ)</p>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700 mt-1">{lateCount}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-100 bg-rose-50/30">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-rose-700 uppercase">ABSENT (Vắng mặt)</p>
            <XCircle className="h-4 w-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-700 mt-1">{absentCount}</p>
        </div>
      </div>

      {/* Search Bar in Table */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center">
        <Search className="h-4 w-4 text-slate-400 mr-2" />
        <input
          type="text"
          placeholder={`Tìm học sinh trong ${activeClassName}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs outline-none text-slate-700"
        />
      </div>

      {/* Attendance Table with Status Toggle (PRESENT / ABSENT / LATE) and Note */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">STT</th>
                <th className="py-3.5 px-4">Học Sinh</th>
                <th className="py-3.5 px-4 text-center">Trạng Thái (PRESENT / ABSENT / LATE)</th>
                <th className="py-3.5 px-4">Ghi Chú Lý Do (note)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {displayedStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-slate-400">
                    Lớp chưa có học sinh hoặc không tìm thấy kết quả.
                  </td>
                </tr>
              ) : (
                displayedStudents.map((st, idx) => {
                  const current = records[st.id] || { status: 'PRESENT', note: '' };
                  const nameDisplay = st.fullname || st.fullName || 'Học sinh';

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* STT */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400 text-xs">
                        {idx + 1}
                      </td>

                      {/* Student Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={st.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80'}
                            alt={nameDisplay}
                            className="h-9 w-9 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{nameDisplay}</p>
                            <p className="text-[11px] text-blue-600 font-semibold">{st.studentCode}</p>
                          </div>
                        </div>
                      </td>

                      {/* Status Toggle Buttons: PRESENT / ABSENT / LATE */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center space-x-1.5">
                          {/* PRESENT */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.id, 'PRESENT')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                              current.status === 'PRESENT'
                                ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>PRESENT (Có mặt)</span>
                          </button>

                          {/* LATE */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.id, 'LATE')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                              current.status === 'LATE'
                                ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                            }`}
                          >
                            <Clock className="h-3.5 w-3.5" />
                            <span>LATE (Đi trễ)</span>
                          </button>

                          {/* ABSENT */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.id, 'ABSENT')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                              current.status === 'ABSENT'
                                ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                            }`}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>ABSENT (Vắng)</span>
                          </button>
                        </div>
                      </td>

                      {/* Note Field */}
                      <td className="py-3.5 px-4">
                        <input
                          type="text"
                          placeholder="Lý do trễ/vắng, phép nghỉ học..."
                          value={current.note}
                          onChange={(e) => handleNoteChange(st.id, e.target.value)}
                          className="w-full text-xs py-1.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Đang điểm danh <strong>{classStudents.length}</strong> học sinh thuộc <strong>{activeClassName}</strong> ngày <strong>{selectedDate}</strong>
        </span>

        <button
          onClick={handleBulkSave}
          disabled={isSaving || totalInClass === 0}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
        >
          <Save className="h-4 w-4" />
          <span>Lưu Điểm Danh Hàng Loạt</span>
        </button>
      </div>
    </div>
  );
};
