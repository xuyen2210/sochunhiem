import React, { useState, useEffect } from 'react';
import {
  CalendarCheck2,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  Filter,
  User,
  GraduationCap,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';
import { Attendance, AttendanceStatus, Student } from '../../core/types';
import defaultProvider from '../../core/provider';

interface AppAttendanceProps {
  students: Student[];
  currentStudentId?: string;
  onSelectStudent?: (studentId: string) => void;
}

export const AppAttendance: React.FC<AppAttendanceProps> = ({
  students,
  currentStudentId,
  onSelectStudent,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    currentStudentId || students[0]?.id || 'std-01'
  );

  // Filter mode: 'month' | 'range'
  const [filterMode, setFilterMode] = useState<'month' | 'range'>('month');
  const [selectedMonth, setSelectedMonth] = useState<number>(10); // Tháng 10
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [fromDate, setFromDate] = useState<string>('2026-10-01');
  const [toDate, setToDate] = useState<string>('2026-10-07');

  const [attendanceList, setAttendanceList] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Sync prop student
  useEffect(() => {
    if (currentStudentId && currentStudentId !== selectedStudentId) {
      setSelectedStudentId(currentStudentId);
    }
  }, [currentStudentId]);

  // Fetch attendance records using provider.listAttendanceByStudent(studentId, range)
  const fetchAttendance = async () => {
    if (!selectedStudentId) return;
    setLoading(true);
    try {
      let rangeParam: any;
      if (filterMode === 'month') {
        rangeParam = {
          month: selectedMonth,
          year: selectedYear,
        };
      } else {
        rangeParam = {
          from: fromDate,
          to: toDate,
        };
      }

      const res = await defaultProvider.listAttendanceByStudent(selectedStudentId, rangeParam);
      setAttendanceList(res);
    } catch (err) {
      console.error('Error fetching attendance by student', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedStudentId, filterMode, selectedMonth, selectedYear, fromDate, toDate]);

  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  // Calculate statistics for the fetched period
  const totalDays = attendanceList.length;
  const presentDays = attendanceList.filter((a) => {
    const s = String(a.status).toUpperCase();
    return s === 'PRESENT';
  }).length;

  const lateDays = attendanceList.filter((a) => {
    const s = String(a.status).toUpperCase();
    return s === 'LATE';
  }).length;

  const absentDays = attendanceList.filter((a) => {
    const s = String(a.status).toUpperCase();
    return s === 'ABSENT' || s === 'EXCUSED';
  }).length;

  const rate = totalDays > 0 ? Math.round(((presentDays + lateDays * 0.5) / totalDays) * 100) : 100;

  const getStatusBadge = (status: AttendanceStatus) => {
    const s = String(status).toUpperCase();
    if (s === 'PRESENT') {
      return {
        label: 'PRESENT (Có mặt)',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: CheckCircle2,
      };
    }
    if (s === 'LATE') {
      return {
        label: 'LATE (Đi trễ)',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: Clock,
      };
    }
    return {
      label: 'ABSENT (Vắng mặt)',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: XCircle,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header Profile */}
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
              Lịch sử chuyên cần & điểm danh học tập
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

      {/* Filter by Month / Week / Range */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilterMode('month')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'month'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Xem theo Tháng
          </button>
          <button
            onClick={() => setFilterMode('range')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'range'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Xem theo Khoảng ngày / Tuần
          </button>
        </div>

        {filterMode === 'month' ? (
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-600">Tháng:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="text-xs font-bold rounded-xl border border-slate-200 py-1.5 px-3 bg-white text-slate-800"
            >
              {[9, 10, 11, 12, 1, 2, 3, 4, 5].map((m) => (
                <option key={m} value={m}>
                  Tháng {m} / {selectedYear}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-600">Từ ngày:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="text-xs font-bold rounded-xl border border-slate-200 p-1.5 bg-white text-slate-800"
            />
            <span className="text-xs font-semibold text-slate-600">đến:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="text-xs font-bold rounded-xl border border-slate-200 p-1.5 bg-white text-slate-800"
            />
          </div>
        )}
      </div>

      {/* KPI Stats Summary Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-blue-100 bg-blue-50/20">
          <p className="text-[11px] font-bold text-blue-600 uppercase">Tỉ lệ chuyên cần</p>
          <p className="text-2xl font-black text-blue-700 mt-1">{rate}%</p>
          <span className="text-[10px] text-slate-400">Dựa trên {totalDays} buổi học</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 bg-emerald-50/30">
          <p className="text-[11px] font-bold text-emerald-700 uppercase">PRESENT (Có mặt)</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{presentDays} <span className="text-xs text-slate-500 font-normal">buổi</span></p>
          <span className="text-[10px] text-emerald-600 font-semibold">Đúng giờ</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-100 bg-amber-50/30">
          <p className="text-[11px] font-bold text-amber-700 uppercase">LATE (Đi trễ)</p>
          <p className="text-2xl font-black text-amber-700 mt-1">{lateDays} <span className="text-xs text-slate-500 font-normal">buổi</span></p>
          <span className="text-[10px] text-amber-600 font-semibold">Cần chấn chỉnh</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-100 bg-rose-50/30">
          <p className="text-[11px] font-bold text-rose-700 uppercase">ABSENT (Vắng mặt)</p>
          <p className="text-2xl font-black text-rose-700 mt-1">{absentDays} <span className="text-xs text-slate-500 font-normal">buổi</span></p>
          <span className="text-[10px] text-rose-600 font-semibold">Có phép / không phép</span>
        </div>
      </div>

      {/* History Timeline / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <CalendarCheck2 className="h-4 w-4 text-blue-600" />
            <span>Chi Tiết Nhật Ký Chuyên Cần Theo Ngày</span>
          </h3>
          <span className="text-xs text-slate-500">
            Tổng cộng: <strong>{attendanceList.length}</strong> ngày ghi nhận
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Đang tải lịch sử chuyên cần...
            </div>
          ) : attendanceList.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Chưa có dữ liệu điểm danh trong giai đoạn này.
            </div>
          ) : (
            attendanceList.map((record) => {
              const badge = getStatusBadge(record.status);
              const Icon = badge.icon;

              return (
                <div
                  key={record.id}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 flex flex-col items-center justify-center font-bold text-xs shrink-0">
                      <span className="text-[10px] text-slate-400 leading-none">Ngày</span>
                      <span className="text-sm leading-none mt-0.5">{record.date.split('-')[2]}</span>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">
                          {new Date(record.date).toLocaleDateString('vi-VN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      {record.note ? (
                        <p className="text-slate-600 mt-0.5 text-[11px] bg-slate-50 p-1.5 rounded-md border border-slate-100 inline-block">
                          <strong>Ghi chú từ GVCN:</strong> {record.note}
                        </p>
                      ) : (
                        <p className="text-slate-400 mt-0.5 text-[11px]">Không có ghi chú thêm</p>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="self-end sm:self-center">
                    <span
                      className={`font-bold px-3 py-1 rounded-xl flex items-center space-x-1 border ${badge.badgeClass}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{badge.label}</span>
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
