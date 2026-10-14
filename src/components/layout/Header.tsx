import React, { useState } from 'react';
import {
  Camera,
  GraduationCap,
  Users,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Menu,
  X,
  CalendarCheck2,
  Award,
  ListTodo,
  Megaphone,
  MessageSquare,
  FileText,
  BarChart3,
  LayoutDashboard,
  FolderOpen,
  Database,
  Trash2,
} from 'lucide-react';

interface HeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onResetSeed: () => void;
  onOpenDataManagement?: () => void;
  classNameInfo?: string;
  teacherName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  onNavigate,
  onResetSeed,
  onOpenDataManagement,
  classNameInfo = 'Lớp 12A1',
  teacherName = 'Thầy Nguyễn Văn Xuyên',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigateAndClose = (route: string) => {
    onNavigate(route);
    setMobileMenuOpen(false);
  };

  const adminLinks = [
    { id: '/admin/dashboard', label: 'Tổng quan (Dashboard)', icon: LayoutDashboard },
    { id: '/admin/classes', label: 'Lớp học (ClassInfo)', icon: GraduationCap },
    { id: '/admin/students', label: 'Học sinh (Students)', icon: Users },
    { id: '/admin/parents', label: 'Phụ huynh (Parents)', icon: Users },
    { id: '/admin/attendance', label: 'Sổ Điểm danh (Bulk Save)', icon: CalendarCheck2 },
    { id: '/admin/behavior', label: 'Thi đua', icon: Award },
    { id: '/admin/tasks', label: 'Bài tập & Nhắc việc', icon: ListTodo },
    { id: '/admin/announcements', label: 'Thông báo lớp', icon: Megaphone },
    { id: '/admin/messages', label: 'Tin nhắn Phụ huynh', icon: MessageSquare },
    { id: '/admin/documents', label: 'Tài liệu & Biểu mẫu', icon: FileText },
    { id: '/admin/reports', label: 'Báo cáo Tuần & Tháng', icon: BarChart3 },
    { id: '/admin/workspace', label: 'Google Drive & Sheets', icon: FolderOpen },
  ];

  const appLinks = [
    { id: '/app/portal', label: 'Sổ liên lạc học sinh', icon: Users },
    { id: '/app/attendance', label: 'Chuyên cần (Attendance)', icon: CalendarCheck2 },
    { id: '/app/behavior', label: 'Nề nếp (Khen/Nhắc)', icon: Award },
    { id: '/app/tasks', label: 'Nhiệm vụ & Nộp bài', icon: ListTodo },
    { id: '/app/announcements', label: 'Bảng tin thông báo', icon: Megaphone },
    { id: '/app/messages', label: 'Nhắn tin với GVCN', icon: MessageSquare },
    { id: '/app/documents', label: 'Kho tài liệu', icon: FileText },
  ];

  const currentMobileLinks = currentRoute.startsWith('/app') ? appLinks : adminLinks;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & School Branding */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => onNavigate('/admin/dashboard')}
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                  EduMaster
                </span>
                <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {classNameInfo}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Sổ Quản Lý Lớp Chủ Nhiệm & AI Studio
              </p>
            </div>
          </div>

          {/* Mode Navigation Tabs */}
          <div className="hidden sm:flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/80">
            <button
              onClick={() => onNavigate('/admin/dashboard')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRoute.startsWith('/admin')
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>GVCN (/admin)</span>
            </button>

            <button
              onClick={() => onNavigate('/app/portal')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRoute.startsWith('/app')
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Phụ huynh / HS (/app)</span>
            </button>

            <button
              onClick={() => onNavigate('/headshot')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRoute === '/headshot'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs'
                  : 'text-indigo-600 hover:text-indigo-800'
              }`}
            >
              <Camera className="h-3.5 w-3.5 text-amber-300" />
              <span className="flex items-center">
                AI Headshot
                <Sparkles className="h-3 w-3 ml-1 text-amber-300" />
              </span>
            </button>
          </div>

          {/* Teacher Profile / Reset & Mobile Hamburger */}
          <div className="flex items-center space-x-2">
            {onOpenDataManagement && (
              <button
                onClick={onOpenDataManagement}
                title="Quản lý dữ liệu: Xóa dữ liệu mẫu & Nhập dữ liệu học sinh thực tế"
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 shadow-2xs"
              >
                <Trash2 className="h-4 w-4 text-rose-600" />
                <span className="hidden sm:inline">Xóa Mẫu & Nhập Thực</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('/admin/workspace')}
              title="Mở Trung tâm Google Drive & Google Sheets"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all border ${
                currentRoute === '/admin/workspace'
                  ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200/70'
              }`}
            >
              <FolderOpen className="h-4 w-4 text-emerald-600" />
              <span className="hidden sm:inline">Drive & Sheets</span>
            </button>

            <button
              onClick={onResetSeed}
              title="Đặt lại dữ liệu mẫu ban đầu (localStorage seedData)"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-xs flex items-center"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center space-x-2">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                  alt={teacherName}
                  className="h-8 w-8 rounded-full object-cover border border-blue-300 ring-2 ring-blue-50"
                />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-slate-800 leading-none">
                  {teacherName}
                </p>
                <p className="text-[10px] text-blue-600 font-medium mt-0.5">
                  GVCN 12A1
                </p>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white/95 backdrop-blur-md text-slate-800 p-4 space-y-4 border-b border-slate-200 shadow-xl animate-fadeIn">
          <div className="grid grid-cols-3 gap-2 pb-3 border-b border-slate-100">
            <button
              onClick={() => navigateAndClose('/admin/dashboard')}
              className={`p-2 rounded-xl text-center text-xs font-bold transition-all ${
                currentRoute.startsWith('/admin')
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              GVCN
            </button>
            <button
              onClick={() => navigateAndClose('/app/portal')}
              className={`p-2 rounded-xl text-center text-xs font-bold transition-all ${
                currentRoute.startsWith('/app')
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              PH / HS
            </button>
            <button
              onClick={() => navigateAndClose('/headshot')}
              className={`p-2 rounded-xl text-center text-xs font-bold transition-all ${
                currentRoute === '/headshot'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              AI Studio
            </button>
          </div>

          <div className="space-y-1">
            {onOpenDataManagement && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDataManagement();
                }}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 mb-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200"
              >
                <Trash2 className="h-4 w-4 text-rose-600" />
                <span>Xóa Mẫu & Nhập Thực Tế</span>
              </button>
            )}
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
              {currentRoute.startsWith('/app') ? 'Phân hệ Phụ huynh / Học sinh' : 'Phân hệ Giáo viên chủ nhiệm'}
            </p>
            {currentMobileLinks.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateAndClose(item.id)}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-blue-700'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
