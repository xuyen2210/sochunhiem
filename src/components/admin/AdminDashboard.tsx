import React from 'react';
import {
  Users,
  CalendarCheck2,
  Megaphone,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  ListTodo,
  MessageSquare,
  Camera,
  Sparkles,
  ChevronRight,
  GraduationCap,
  Calendar,
  Award,
  ThumbsUp,
  ThumbsDown,
  Database,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  Announcement,
  Attendance,
  Behavior,
  ClassInfo,
  Student,
  Task,
} from '../../core/types';

interface AdminDashboardProps {
  classInfo: ClassInfo;
  students: Student[];
  attendance: Attendance[];
  behaviors: Behavior[];
  announcements: Announcement[];
  tasks: Task[];
  onNavigate: (route: string) => void;
  onOpenDataManagement?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  classInfo,
  students,
  attendance,
  behaviors,
  announcements,
  tasks,
  onNavigate,
  onOpenDataManagement,
}) => {
  // 1. Số HS
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status !== 'transferred' && s.status !== 'deferred').length;

  // 2. Tỉ lệ chuyên cần tuần này
  // In our mock, weekly rate is 98.2%
  const today = '2026-10-07';
  const todayAttendance = attendance.filter((a) => a.date === today);
  const presentToday = todayAttendance.filter((a) => a.status === 'present').length;
  const lateToday = todayAttendance.filter((a) => a.status === 'late').length;
  const absentToday = todayAttendance.filter((a) => a.status === 'absent' || a.status === 'excused').length;
  const weeklyAttendanceRate = 98.2;

  // 3. Thông báo mới
  const recentAnnouncements = announcements.slice(0, 3);

  // Thống kê Nề nếp / Hành vi (Prompt 1.4: tổng điểm khen, số lần nhắc trong tuần/tháng)
  let totalPraisePoints = 0;
  let warnCountWeek = 0;
  let warnCountMonth = 0;
  let totalPraises = 0;
  let totalWarnings = 0;

  behaviors.forEach((b) => {
    const t = String(b.type).toUpperCase();
    const isPraise = t === 'PRAISE';
    const isWarn = t === 'WARN' || t === 'WARNING' || t === 'VIOLATION';
    if (isPraise) {
      totalPraises++;
      totalPraisePoints += Number(b.points) || 0;
    }
    if (isWarn) {
      totalWarnings++;
      if (b.date >= '2026-10-05') {
        warnCountWeek++;
      }
      if (b.date.startsWith('2026-10')) {
        warnCountMonth++;
      }
    }
  });

  // 4. Việc cần xử lý (Action items)
  const pendingActionItems = [
    {
      id: 'act-1',
      title: 'Học sinh vắng / trễ hôm nay',
      desc:
        absentToday > 0 || lateToday > 0
          ? `${absentToday} học sinh vắng & ${lateToday} học sinh trễ cần theo dõi.`
          : 'Hôm nay lớp chuyên cần tốt, không có học sinh vắng hoặc trễ.',
      tag: 'Điểm danh',
      severity: absentToday > 0 ? 'high' : 'low',
      route: '/admin/attendance',
      actionText: 'Kiểm tra điểm danh',
    },
    {
      id: 'act-2',
      title: 'Thu nộp nhiệm vụ & bài tập',
      desc:
        tasks.length > 0
          ? `Có ${tasks.length} nhiệm vụ / bài tập đang triển khai cho học sinh.`
          : 'Chưa có nhiệm vụ mới được giao.',
      tag: 'Nhiệm vụ',
      severity: tasks.length > 0 ? 'medium' : 'low',
      route: '/admin/tasks',
      actionText: 'Xem nhiệm vụ',
    },
    {
      id: 'act-3',
      title: 'Hồ sơ học sinh thực tế',
      desc:
        totalStudents > 0
          ? `Đang quản lý ${totalStudents} học sinh trong danh sách chính thức.`
          : 'Lớp hiện chưa có học sinh. Nhập dữ liệu thực tế từ Excel hoặc Google Sheets.',
      tag: 'Hồ sơ',
      severity: totalStudents === 0 ? 'high' : 'low',
      route: '/admin/students',
      actionText: totalStudents === 0 ? 'Nhập học sinh ngay' : 'Xem danh sách',
    },
    {
      id: 'act-4',
      title: 'Ảnh thẻ học sinh & Chân dung AI',
      desc: 'Sử dụng Studio AI Headshot để tạo ảnh thẻ chuẩn kích thước cho học sinh.',
      tag: 'AI Studio',
      severity: 'low',
      route: '/headshot',
      actionText: 'Mở AI Headshot',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-blue-100 border border-white/20">
                Năm học {classInfo.schoolYear} • {classInfo.room || 'Phòng học 12A1'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">
                Bảng Điều Khiển: {classInfo.classname || classInfo.name}
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm mt-1">
                GVCN: <strong className="text-white">{classInfo.homeroomTeacher || classInfo.homeroomTeacherName}</strong> • {classInfo.note || 'Trung tâm GDNN - GDTX Thị xã Long Mỹ'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onOpenDataManagement && (
                <button
                  onClick={onOpenDataManagement}
                  className="px-3.5 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Xóa Mẫu & Nhập Thực</span>
                </button>
              )}

              <button
                onClick={() => onNavigate('/admin/attendance')}
                className="px-3.5 py-2 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center space-x-1.5"
              >
                <CalendarCheck2 className="h-4 w-4" />
                <span>Điểm danh</span>
              </button>

              <button
                onClick={() => onNavigate('/admin/students')}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/30 transition-colors flex items-center space-x-1.5"
              >
                <Users className="h-4 w-4" />
                <span>Quản lý Học sinh</span>
              </button>

              <button
                onClick={() => onNavigate('/headshot')}
                className="px-3.5 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center space-x-1.5"
              >
                <Camera className="h-4 w-4 text-amber-300" />
                <span>AI Headshot</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State Banner if no students */}
      {totalStudents === 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl shrink-0">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-950">
                Lớp học đang ở trạng thái sạch (Chưa có danh sách học sinh)
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Bạn đã xóa dữ liệu mẫu. Hãy nạp danh sách học sinh thực tế bằng file Excel, Google Sheets hoặc dán họ tên để bắt đầu sử dụng!
              </p>
            </div>
          </div>
          <button
            onClick={onOpenDataManagement}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center space-x-1.5 shrink-0"
          >
            <Upload className="h-4 w-4" />
            <span>Nhập danh sách học sinh ngay</span>
          </button>
        </div>
      )}

      {/* 4 Key Dashboard Cards: Số HS, Tỉ lệ chuyên cần tuần này, Thông báo mới, Việc cần xử lí */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Số HS */}
        <div
          onClick={() => onNavigate('/admin/students')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              1. Số Học Sinh (Số HS)
            </span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900">{totalStudents}</span>
            <span className="text-xs text-slate-500 font-medium">học sinh</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-emerald-600 font-semibold border-t border-slate-100 pt-2">
            <span>{activeStudents} đang theo học</span>
            <span className="text-blue-600 flex items-center hover:underline">
              Chi tiết <ChevronRight className="h-3 w-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Card 2: Tỉ lệ chuyên cần tuần này */}
        <div
          onClick={() => onNavigate('/admin/attendance')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              2. Chuyên Cần Tuần Này
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-emerald-600">{weeklyAttendanceRate}%</span>
            <span className="text-xs text-slate-500 font-medium">Tuần 05</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>Hôm nay: {presentToday} có mặt • {lateToday} trễ</span>
            <span className="text-emerald-700 font-semibold flex items-center">
              Xem sổ <ChevronRight className="h-3 w-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Card 3: Thông báo mới */}
        <div
          onClick={() => onNavigate('/admin/announcements')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              3. Thông Báo Mới
            </span>
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Megaphone className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-indigo-600">{announcements.length}</span>
            <span className="text-xs text-slate-500 font-medium">bản tin</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span className="text-red-600 font-semibold">1 tin ghim quan trọng</span>
            <span className="text-indigo-600 font-semibold flex items-center">
              Đăng tin <ChevronRight className="h-3 w-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Card 4: Việc cần xử lý */}
        <div
          onClick={() => onNavigate('/admin/tasks')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              4. Việc Cần Xử Lý
            </span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-amber-600">{pendingActionItems.length}</span>
            <span className="text-xs text-slate-500 font-medium">hạng mục</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-amber-700 font-semibold border-t border-slate-100 pt-2">
            <span>Cần giải quyết hôm nay</span>
            <span className="flex items-center text-amber-800">
              Xử lý <ChevronRight className="h-3 w-3 ml-0.5" />
            </span>
          </div>
        </div>
      </div>

      {/* 5. Thống Kê Nề Nếp & Hành Vi (Prompt 1.4: tổng điểm khen, số lần nhắc trong tuần/tháng) */}
      <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-900">
                Thống Kê Điểm Thi Đua & Nề Nếp Học Sinh
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Tháng 10/2026
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Theo dõi bảng điểm thi đua, khen thưởng và các lượt nhắc nhở theo tuần/tháng của lớp.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Tổng điểm khen */}
          <div className="bg-white px-3.5 py-2 rounded-xl border border-emerald-200 shadow-2xs flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ThumbsUp className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Tổng điểm khen</p>
              <p className="text-sm font-extrabold text-emerald-600">
                +{totalPraisePoints} điểm <span className="text-[11px] font-normal text-slate-500">({totalPraises} lượt)</span>
              </p>
            </div>
          </div>

          {/* Số lần nhắc trong tuần */}
          <div className="bg-white px-3.5 py-2 rounded-xl border border-amber-200 shadow-2xs flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <ThumbsDown className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Nhắc tuần này</p>
              <p className="text-sm font-extrabold text-amber-700">
                {warnCountWeek} lần <span className="text-[11px] font-normal text-slate-500">(Tuần 05)</span>
              </p>
            </div>
          </div>

          {/* Số lần nhắc trong tháng */}
          <div className="bg-white px-3.5 py-2 rounded-xl border border-rose-200 shadow-2xs flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Nhắc trong tháng</p>
              <p className="text-sm font-extrabold text-rose-600">
                {warnCountMonth} lần <span className="text-[11px] font-normal text-slate-500">(Tháng 10)</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('/admin/behavior')}
            className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm"
          >
            <span>Bảng Xếp Loại Thi Đua</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Two Columns: Section Việc Cần Xử Lý & Section Thông Báo Mới */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Việc Cần Xử Lý (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Danh Sách Việc Cần Xử Lý (Action Items)
                </h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                {pendingActionItems.length} việc chờ
              </span>
            </div>

            <div className="space-y-3">
              {pendingActionItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 bg-white shadow-2xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.severity === 'high'
                          ? 'bg-rose-100 text-rose-800'
                          : item.severity === 'medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.tag}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <button
                    onClick={() => onNavigate(item.route)}
                    className="shrink-0 py-1.5 px-3 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
                  >
                    <span>{item.actionText}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => onNavigate('/admin/classes')}
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-left transition-all shadow-xs"
            >
              <GraduationCap className="h-5 w-5 text-blue-600 mb-1" />
              <h4 className="text-xs font-bold text-slate-900">CRUD Lớp Học</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Quản lý ClassInfo, năm học, GVCN</p>
            </button>

            <button
              onClick={() => onNavigate('/admin/students')}
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-left transition-all shadow-xs"
            >
              <Users className="h-5 w-5 text-emerald-600 mb-1" />
              <h4 className="text-xs font-bold text-slate-900">CRUD Học Sinh</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Lọc theo lớp, trạng thái, phụ huynh</p>
            </button>

            <button
              onClick={() => onNavigate('/admin/parents')}
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-left transition-all shadow-xs"
            >
              <Users className="h-5 w-5 text-purple-600 mb-1" />
              <h4 className="text-xs font-bold text-slate-900">CRUD Phụ Huynh</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Thông tin liên lạc, quan hệ gia đình</p>
            </button>
          </div>
        </div>

        {/* Right Column: Thông Báo Mới (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Megaphone className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Thông Báo Mới Nhất
                </h3>
              </div>
              <button
                onClick={() => onNavigate('/admin/announcements')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="h-3 w-3 ml-1" />
              </button>
            </div>

            <div className="space-y-3">
              {recentAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      {(ann.pinned ?? ann.isPinned) && (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                          Ghim
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        {ann.target === 'parent' ? 'Phụ huynh' : ann.target === 'student' ? 'Học sinh' : 'Toàn lớp'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(ann.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {ann.title}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('/admin/announcements')}
              className="mt-3 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              + Đăng Thông Báo Mới
            </button>
          </div>

          {/* AI Headshot Quick Banner */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 rounded-2xl p-5 text-white border border-indigo-800 shadow-md space-y-2">
            <div className="flex items-center space-x-2 text-indigo-300">
              <Camera className="h-4 w-4 text-amber-300" />
              <span className="text-xs font-bold uppercase tracking-wider">AI Headshot Photographer</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tạo ảnh thẻ tiêu chuẩn cho hồ sơ học sinh và bằng cấp từ ảnh selfie thông thường.
            </p>
            <button
              onClick={() => onNavigate('/headshot')}
              className="w-full mt-2 py-2 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Mở Studio Ảnh Thẻ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
