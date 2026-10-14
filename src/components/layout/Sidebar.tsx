import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck2,
  Award,
  ListTodo,
  Megaphone,
  MessageSquare,
  FileText,
  BarChart3,
  Camera,
  Sparkles,
  UserCheck,
  GraduationCap,
  Sparkle,
  FolderOpen,
} from 'lucide-react';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  isAdmin: boolean;
  unreadMessagesCount?: number;
  pendingTasksCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  isAdmin,
  unreadMessagesCount = 1,
  pendingTasksCount = 3,
}) => {
  const adminNavItems = [
    {
      id: '/admin/dashboard',
      label: 'Tổng quan (Dashboard)',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: '/admin/classes',
      label: 'Lớp học (ClassInfo)',
      icon: GraduationCap,
      badge: 'Lớp 12A1',
    },
    {
      id: '/admin/students',
      label: 'Học sinh (Students)',
      icon: Users,
      badge: null,
    },
    {
      id: '/admin/parents',
      label: 'Phụ huynh (Parents)',
      icon: UserCheck,
      badge: null,
    },
    {
      id: '/admin/attendance',
      label: 'Sổ Điểm danh',
      icon: CalendarCheck2,
      badge: 'Hôm nay',
    },
    {
      id: '/admin/behavior',
      label: 'Thi đua',
      icon: Award,
      badge: null,
    },
    {
      id: '/admin/tasks',
      label: 'Bài tập & Nhắc việc',
      icon: ListTodo,
      badge: pendingTasksCount > 0 ? `${pendingTasksCount}` : null,
    },
    {
      id: '/admin/announcements',
      label: 'Thông báo lớp',
      icon: Megaphone,
      badge: null,
    },
    {
      id: '/admin/messages',
      label: 'Tin nhắn Phụ huynh',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? `${unreadMessagesCount} mới` : null,
    },
    {
      id: '/admin/documents',
      label: 'Tài liệu & Biểu mẫu',
      icon: FileText,
      badge: null,
    },
    {
      id: '/admin/reports',
      label: 'Báo cáo Tuần & Tháng',
      icon: BarChart3,
      badge: 'Tuần 05',
    },
    {
      id: '/admin/workspace',
      label: 'Google Drive & Sheets',
      icon: FolderOpen,
      badge: 'Mới',
    },
  ];

  const appNavItems = [
    {
      id: '/app/portal',
      label: 'Sổ liên lạc học sinh',
      icon: UserCheck,
      badge: null,
    },
    {
      id: '/app/attendance',
      label: 'Chuyên cần (Attendance)',
      icon: CalendarCheck2,
      badge: 'Lịch sử',
    },
    {
      id: '/app/behavior',
      label: 'Nề nếp (Khen/Nhắc)',
      icon: Award,
      badge: null,
    },
    {
      id: '/app/tasks',
      label: 'Nhiệm vụ & Nộp bài',
      icon: ListTodo,
      badge: 'Cần làm',
    },
    {
      id: '/app/announcements',
      label: 'Bảng tin thông báo',
      icon: Megaphone,
      badge: null,
    },
    {
      id: '/app/messages',
      label: 'Nhắn tin với GVCN',
      icon: MessageSquare,
      badge: null,
    },
    {
      id: '/app/documents',
      label: 'Kho tài liệu & Đề cương',
      icon: FileText,
      badge: null,
    },
  ];

  const items = isAdmin ? adminNavItems : appNavItems;

  return (
    <aside className="w-64 bg-white/95 backdrop-blur-md text-slate-700 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-200/90 shadow-2xs transition-colors">
      {/* Role Banner Card */}
      <div className="p-3.5 m-3 rounded-2xl bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-slate-50 border border-blue-100/90 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1 text-[11px] font-bold tracking-wider uppercase text-blue-600">
              <Sparkle className="h-3 w-3 fill-blue-500 text-blue-500" />
              <span>{isAdmin ? 'Phân hệ Quản trị' : 'Cổng Thông tin Gia đình'}</span>
            </div>
            <h3 className="text-xs font-bold text-slate-900 mt-1">
              {isAdmin ? 'Giáo Viên Chủ Nhiệm' : 'Phụ Huynh & Học Sinh'}
            </h3>
          </div>
          <span
            className={`inline-block px-2.5 py-0.5 text-[10px] font-extrabold rounded-full shadow-2xs ${
              isAdmin
                ? 'bg-blue-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {isAdmin ? 'GVCN' : 'PH/HS'}
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
        <p className="px-3 pt-1 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {isAdmin ? 'Chức năng Quản lý Lớp' : 'Chức năng Học sinh & Phụ huynh'}
        </p>

        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentRoute === item.id ||
            (item.id === '/admin/behavior' && currentRoute === '/admin/behaviors') ||
            (item.id === '/admin/behaviors' && currentRoute === '/admin/behavior');

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-bold shadow-sm shadow-blue-500/25'
                  : 'text-slate-600 hover:text-blue-700 hover:bg-slate-100/80 font-medium'
              }`}
            >
              <div className="flex items-center space-x-2.5 truncate">
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ml-1.5 transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white border border-white/30 backdrop-blur-xs'
                      : 'bg-slate-100 text-slate-600 border border-slate-200/80 group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* AI Headshot Studio Promotion Widget */}
      <div className="p-3.5 m-3 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-purple-50/60 to-blue-50/70 border border-indigo-100/90 shadow-2xs text-left">
        <div className="flex items-center space-x-2 text-indigo-700 mb-1">
          <div className="p-1 rounded-lg bg-indigo-600 text-white shadow-2xs">
            <Camera className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-bold text-indigo-950">AI Headshot Studio</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed my-2">
          Tạo ảnh thẻ học sinh & chân dung nghề nghiệp chuẩn mực với các phong cách hiện đại.
        </p>
        <button
          onClick={() => onNavigate('/headshot')}
          className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-sm transition-all"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          <span>Mở Studio Chân Dung</span>
        </button>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-100 text-center text-[10px] text-slate-400 bg-slate-50/40">
        TT GDNN-GDTX Long Mỹ • Năm học 2026-2027
      </div>
    </aside>
  );
};
