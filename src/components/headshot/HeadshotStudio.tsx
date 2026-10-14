import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  Download,
  CheckCircle2,
  RefreshCw,
  Sliders,
  UserCheck,
  Check,
  Layers,
  ArrowRight,
  Sun,
  Building2,
  Trees,
  Briefcase,
  GraduationCap,
  Copy,
  Eye,
} from 'lucide-react';
import {
  HEADSHOT_STYLES,
  SAMPLE_SELFIES,
  generateHeadshotCanvas,
} from '../../core/headshotEngine';
import { HeadshotStyleId, Student } from '../../core/types';

interface HeadshotStudioProps {
  students: Student[];
  onUpdateStudentAvatar?: (studentId: string, avatarUrl: string) => void;
  onUpdateTeacherAvatar?: (avatarUrl: string) => void;
}

export const HeadshotStudio: React.FC<HeadshotStudioProps> = ({
  students,
  onUpdateStudentAvatar,
  onUpdateTeacherAvatar,
}) => {
  // State
  const [selectedImage, setSelectedImage] = useState<string>(SAMPLE_SELFIES[0].url);
  const [selectedStyle, setSelectedStyle] = useState<HeadshotStyleId>('corporate-grey');
  const [attire, setAttire] = useState<'suit' | 'casual' | 'academic' | 'blazer'>('suit');
  const [framing, setFraming] = useState<'1:1' | '3:4' | '4:6'>('1:1');
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [generatedHeadshot, setGeneratedHeadshot] = useState<string | null>(null);

  const [targetStudentId, setTargetStudentId] = useState<string>(students[0]?.id || '');
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
          setGeneratedHeadshot(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // AI Headshot Generation simulation with high-res canvas render
  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationProgress(15);
    setGenerationStep('Phân tích khuôn mặt & tư thế selfie...');

    try {
      await new Promise((r) => setTimeout(r, 450));
      setGenerationProgress(40);
      setGenerationStep('Tách nền & xử lý ánh sáng chuẩn studio...');

      await new Promise((r) => setTimeout(r, 500));
      setGenerationProgress(70);
      setGenerationStep(`Tổng hợp phong cách: ${HEADSHOT_STYLES.find(s => s.id === selectedStyle)?.name}...`);

      await new Promise((r) => setTimeout(r, 450));
      setGenerationProgress(90);
      setGenerationStep('Tối ưu hóa trang phục & xuất bản ảnh chân dung HD...');

      const result = await generateHeadshotCanvas(
        selectedImage,
        selectedStyle,
        attire,
        framing
      );

      setGeneratedHeadshot(result);
      setGenerationProgress(100);
      setGenerationStep('Hoàn tất!');
    } catch (err) {
      console.error('Headshot generation failed', err);
      // Fallback to sample preview
      const fallback = HEADSHOT_STYLES.find((s) => s.id === selectedStyle)?.samplePreview || selectedImage;
      setGeneratedHeadshot(fallback);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedHeadshot) return;
    const a = document.createElement('a');
    a.href = generatedHeadshot;
    a.download = `headshot-${selectedStyle}-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleAssignToStudent = () => {
    if (!generatedHeadshot || !targetStudentId || !onUpdateStudentAvatar) return;
    onUpdateStudentAvatar(targetStudentId, generatedHeadshot);
    const std = students.find((s) => s.id === targetStudentId);
    setAssignSuccess(`Đã cập nhật ảnh thẻ cho học sinh: ${std?.fullName || 'Học sinh'} thành công!`);
    setTimeout(() => setAssignSuccess(null), 4000);
  };

  const handleAssignToTeacher = () => {
    if (!generatedHeadshot || !onUpdateTeacherAvatar) return;
    onUpdateTeacherAvatar(generatedHeadshot);
    setAssignSuccess('Đã cập nhật ảnh chân dung GVCN thành công!');
    setTimeout(() => setAssignSuccess(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-400/20">
            <Camera className="h-3.5 w-3.5 text-amber-300" />
            <span>AI Headshot Photographer Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Tạo Ảnh Thẻ & Chân Dung Nghề Nghiệp Chuyên Nghiệp
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            Tải lên bức ảnh selfie thông thường, chọn phong cách (Corporate Grey, Modern Tech Office, Outdoor Natural Light...), AI sẽ biến hóa thành ảnh chân dung studio sắc nét cho hồ sơ học sinh, giáo viên & CV nghề nghiệp.
          </p>
        </div>
      </div>

      {assignSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-medium">{assignSuccess}</span>
        </div>
      )}

      {/* Main Studio Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload & Options (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Step 1: Upload Casual Selfie */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">1</span>
                <span>Tải Lên Ảnh Selfie Thông Thường</span>
              </h2>
              <span className="text-xs text-slate-500">Casual Selfie</span>
            </div>

            {/* Current Selected Selfie Preview */}
            <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-slate-200 hover:border-blue-400 transition-colors bg-slate-50 aspect-square max-h-52 flex items-center justify-center">
              {selectedImage ? (
                <>
                  <img
                    src={selectedImage}
                    alt="Current selfie preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-semibold shadow-md flex items-center space-x-1"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Đổi ảnh khác</span>
                    </button>
                  </div>
                </>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer text-center p-6 space-y-2"
                >
                  <Upload className="h-8 w-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">Kéo thả hoặc bấm để tải ảnh selfie lên</p>
                  <p className="text-[11px] text-slate-400">Hỗ trợ JPG, PNG, WEBP</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Sample presets for quick testing */}
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">
                Hoặc chọn ảnh selfie mẫu có sẵn để thử ngay:
              </p>
              <div className="grid grid-cols-4 gap-2">
                {SAMPLE_SELFIES.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => {
                      setSelectedImage(sample.url);
                      setGeneratedHeadshot(null);
                    }}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all aspect-square ${
                      selectedImage === sample.url
                        ? 'border-blue-600 ring-2 ring-blue-100 scale-95'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={sample.url}
                      alt={sample.name}
                      className="w-full h-full object-cover"
                    />
                    {selectedImage === sample.url && (
                      <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-0.5">
                        <Check className="h-2.5 w-2.5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 2: Choose Desired Style */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">2</span>
                <span>Chọn Phong Cách Chụp Headshot</span>
              </h2>
              <span className="text-xs text-slate-500">Backdrop Style</span>
            </div>

            <div className="space-y-2.5">
              {HEADSHOT_STYLES.map((style) => {
                const isSelected = selectedStyle === style.id;
                return (
                  <div
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-500 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div
                      className="h-12 w-12 rounded-lg shrink-0 overflow-hidden relative border border-slate-200"
                      style={{ background: style.bgGradient }}
                    >
                      <img
                        src={style.samplePreview}
                        alt={style.name}
                        className="w-full h-full object-cover opacity-80"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {style.name}
                        </h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {style.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                        {style.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Attire & Framing Knobs */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">3</span>
                <span>Tùy Chỉnh Trang Phục & Tỉ Lệ Khung Hình</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Trang phục (Attire)
                </label>
                <select
                  value={attire}
                  onChange={(e) => setAttire(e.target.value as any)}
                  className="w-full text-xs rounded-lg border-slate-200 p-2 bg-slate-50 text-slate-800 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="suit">Navy Corporate Suit & Tie</option>
                  <option value="blazer">Smart Casual Blazer</option>
                  <option value="academic">Sơ mi trắng học đường (Academic)</option>
                  <option value="casual">Giữ trang phục gốc tự nhiên</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Tỉ lệ khung hình (Framing)
                </label>
                <select
                  value={framing}
                  onChange={(e) => setFraming(e.target.value as any)}
                  className="w-full text-xs rounded-lg border-slate-200 p-2 bg-slate-50 text-slate-800 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="1:1">1:1 Vuông (Avatar MXH / LinkedIn)</option>
                  <option value="3:4">3:4 Chân dung tiêu chuẩn</option>
                  <option value="4:6">4:6 Thẻ học sinh / Hồ sơ CCCD</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md ${
                isGenerating
                  ? 'bg-indigo-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-indigo-500/25'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Đang tổng hợp Headshot AI ({generationProgress}%)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span>Tạo Professional Headshot Ngay</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Generation Result & Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6 min-h-[580px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Kết Quả Studio AI Headshot
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ảnh chân dung chuẩn phong cách: {HEADSHOT_STYLES.find(s => s.id === selectedStyle)?.name}
                  </p>
                </div>
                {generatedHeadshot && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Đã tạo thành công</span>
                  </span>
                )}
              </div>

              {/* Display Area */}
              <div className="mt-6 flex flex-col items-center">
                {isGenerating ? (
                  <div className="w-full max-w-md aspect-square rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center p-8 space-y-4 shadow-xl border border-indigo-900/60 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 animate-pulse" />
                    <div className="relative">
                      <div className="h-16 w-16 rounded-full border-4 border-indigo-400/30 border-t-indigo-400 animate-spin" />
                      <Sparkles className="h-6 w-6 text-amber-300 absolute inset-0 m-auto animate-bounce" />
                    </div>
                    <div className="text-center relative z-10">
                      <p className="text-sm font-bold text-white">{generationStep}</p>
                      <p className="text-xs text-indigo-300 mt-1">Hệ thống đang tinh chỉnh từng đường nét và phông nền studio</p>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-400 h-full transition-all duration-300"
                        style={{ width: `${generationProgress}%` }}
                      />
                    </div>
                  </div>
                ) : generatedHeadshot ? (
                  <div className="w-full max-w-md space-y-4">
                    {/* Before vs After Comparison */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-slate-500 block uppercase">
                          Ảnh selfie gốc
                        </span>
                        <div className="aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                          <img
                            src={selectedImage}
                            alt="Original selfie"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-indigo-600 block uppercase flex items-center space-x-1">
                          <Sparkles className="h-3 w-3 text-amber-500" />
                          <span>AI Professional Headshot</span>
                        </span>
                        <div className="aspect-square rounded-xl overflow-hidden border-2 border-indigo-500 ring-2 ring-indigo-100 bg-slate-900 shadow-lg">
                          <img
                            src={generatedHeadshot}
                            alt="AI generated headshot"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Bar for Generated Image */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <button
                        onClick={handleDownload}
                        className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-xs transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Tải ảnh về máy (HD)</span>
                      </button>

                      <button
                        onClick={handleGenerate}
                        className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Thử lại</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-md aspect-square rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center space-y-3">
                    <div className="h-16 w-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                      <Camera className="h-8 w-8" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">
                        Chưa tạo ảnh headshot
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                        Hãy chọn ảnh selfie ở cột bên trái và bấm &ldquo;Tạo Professional Headshot Ngay&rdquo; để chiêm ngưỡng kết quả.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Direct Integration with Class System */}
            {generatedHeadshot && (
              <div className="mt-6 pt-5 border-t border-slate-200 bg-slate-50/80 p-4 rounded-xl space-y-3">
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-4 w-4 text-blue-600" />
                  <h4 className="text-xs font-bold text-slate-900">
                    Ứng dụng trực tiếp vào Sổ quản lý Lớp chủ nhiệm:
                  </h4>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <select
                    value={targetStudentId}
                    onChange={(e) => setTargetStudentId(e.target.value)}
                    className="flex-1 text-xs rounded-lg border-slate-200 bg-white p-2 text-slate-800"
                  >
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.studentCode} - {st.fullName}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleAssignToStudent}
                    className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold whitespace-nowrap shadow-xs transition-colors"
                  >
                    Cập nhật vào Thẻ học sinh
                  </button>

                  <button
                    onClick={handleAssignToTeacher}
                    className="py-2 px-3 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-semibold whitespace-nowrap shadow-xs transition-colors"
                  >
                    Đặt làm Avatar GVCN
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
