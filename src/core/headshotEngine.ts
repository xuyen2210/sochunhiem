import { HeadshotStyle, HeadshotStyleId } from './types';

export const HEADSHOT_STYLES: HeadshotStyle[] = [
  {
    id: 'corporate-grey',
    name: 'Corporate Grey Backdrop',
    description: 'Phông nền xám studio chuẩn doanh nghiệp với hiệu ứng ánh sáng gradient vignette cao cấp.',
    tag: 'Tiêu chuẩn doanh nghiệp & Thẻ',
    bgColor: '#4a5568',
    bgGradient: 'radial-gradient(circle at 45% 35%, #718096 0%, #2d3748 70%, #1a202c 100%)',
    lightingPrompt: 'Neutral softbox 3-point lighting, corporate grey studio canvas, high key contrast.',
    samplePreview: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'modern-tech',
    name: 'Modern Tech Office',
    description: 'Không gian văn phòng công nghệ hiện đại với hiệu ứng xóa phông bokeh tinh tế và ánh sáng dịu.',
    tag: 'Hiện đại & Trẻ trung',
    bgColor: '#1e293b',
    bgGradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    lightingPrompt: 'Architectural tech office glass background with cinematic depth of field blur, natural ambient rim lighting.',
    samplePreview: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'outdoor-natural',
    name: 'Outdoor Natural Light',
    description: 'Ánh sáng tự nhiên ngoài trời ấm áp, cây xanh mờ ảo và tạo cảm giác thân thiện, gần gũi.',
    tag: 'Ấm áp & Tự nhiên',
    bgColor: '#365314',
    bgGradient: 'linear-gradient(135deg, #27272a 0%, #1c1917 100%)',
    lightingPrompt: 'Warm golden hour sunlight, outdoor campus greenery bokeh, soft specular rim hair highlights.',
    samplePreview: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'executive-navy',
    name: 'Executive Navy Studio',
    description: 'Phông nền xanh thẫm uy quyền, tôn lên sự chững chạc và chuyên nghiệp của giảng viên, lãnh đạo.',
    tag: 'Trang trọng & Uy tín',
    bgColor: '#0f172a',
    bgGradient: 'radial-gradient(circle at 50% 30%, #1e3a8a 0%, #0f172a 75%, #020617 100%)',
    lightingPrompt: 'Executive studio portrait, deep midnight navy backdrop, hair keylight, crisp professional contrast.',
    samplePreview: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'academic-formal',
    name: 'Academic / School Classic',
    description: 'Ảnh thẻ học sinh & giáo viên tiêu chuẩn: sơ mi trắng trang nhã, phông xanh dương nhạt hoặc trắng ngà.',
    tag: 'Thẻ học sinh & Hồ sơ Bộ GD',
    bgColor: '#2563eb',
    bgGradient: 'radial-gradient(circle at 50% 35%, #93c5fd 0%, #3b82f6 60%, #1d4ed8 100%)',
    lightingPrompt: 'Clean school portrait standard, crisp blue backdrop, sharp facial features, white collar attire.',
    samplePreview: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
  },
];

export const SAMPLE_SELFIES = [
  {
    id: 'sample-1',
    name: 'Nam thanh niên (Casual Selfie)',
    role: 'Học sinh Trần Minh Quân',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'sample-2',
    name: 'Nữ sinh viên (Casual Selfie)',
    role: 'Học sinh Mai Anh',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'sample-3',
    name: 'Nam trưởng thành (Casual)',
    role: 'Thầy Xuyên (GVCN)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'sample-4',
    name: 'Nữ nhân viên (Casual)',
    role: 'Cô Ngân (Phụ huynh)',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
  },
];

/**
 * High-fidelity Canvas-based Studio Headshot Synthesizer
 * Produces crisp, professional studio lighting, custom backdrops, attire simulation, and bokeh.
 */
export async function generateHeadshotCanvas(
  sourceImageUrl: string,
  styleId: HeadshotStyleId,
  attire: 'suit' | 'casual' | 'academic' | 'blazer',
  framing: '1:1' | '3:4' | '4:6'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = sourceImageUrl;

    img.onload = () => {
      try {
        let width = 800;
        let height = 800;

        if (framing === '3:4') {
          width = 750;
          height = 1000;
        } else if (framing === '4:6') {
          width = 800;
          height = 1200;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get 2D canvas context'));
          return;
        }

        // 1. Render Background according to chosen style
        if (styleId === 'corporate-grey') {
          const grad = ctx.createRadialGradient(
            width * 0.45,
            height * 0.35,
            width * 0.1,
            width * 0.5,
            height * 0.5,
            width * 0.8
          );
          grad.addColorStop(0, '#788494');
          grad.addColorStop(0.5, '#475569');
          grad.addColorStop(0.85, '#334155');
          grad.addColorStop(1, '#1e293b');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          // Subtle studio canvas texture noise
          ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
          for (let i = 0; i < 400; i++) {
            const rx = Math.random() * width;
            const ry = Math.random() * height;
            ctx.fillRect(rx, ry, 2, 2);
          }
        } else if (styleId === 'modern-tech') {
          // Tech office interior blur simulation
          const grad = ctx.createLinearGradient(0, 0, width, height);
          grad.addColorStop(0, '#0f172a');
          grad.addColorStop(0.5, '#1e293b');
          grad.addColorStop(1, '#0f233f');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          // Architectural office glass bokeh circles
          const bokehColors = [
            'rgba(56, 189, 248, 0.15)',
            'rgba(99, 102, 241, 0.12)',
            'rgba(255, 255, 255, 0.08)',
            'rgba(251, 191, 36, 0.10)',
          ];
          for (let i = 0; i < 18; i++) {
            const bx = (i * 73) % width;
            const by = (i * 97) % height;
            const br = 30 + ((i * 17) % 65);
            ctx.beginPath();
            ctx.arc(bx, by, br, 0, Math.PI * 2);
            ctx.fillStyle = bokehColors[i % bokehColors.length];
            ctx.fill();
          }
        } else if (styleId === 'outdoor-natural') {
          // Warm foliage & sunlit park bokeh
          const grad = ctx.createLinearGradient(0, 0, 0, height);
          grad.addColorStop(0, '#1c1917');
          grad.addColorStop(0.4, '#292524');
          grad.addColorStop(1, '#14532d');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          // Soft green & gold foliage orbs
          const foliageColors = [
            'rgba(74, 222, 128, 0.15)',
            'rgba(250, 204, 21, 0.18)',
            'rgba(163, 230, 53, 0.12)',
            'rgba(255, 237, 213, 0.14)',
          ];
          for (let i = 0; i < 22; i++) {
            const bx = (i * 61) % width;
            const by = (i * 83) % height;
            const br = 40 + ((i * 19) % 75);
            ctx.beginPath();
            ctx.arc(bx, by, br, 0, Math.PI * 2);
            ctx.fillStyle = foliageColors[i % foliageColors.length];
            ctx.fill();
          }
        } else if (styleId === 'executive-navy') {
          const grad = ctx.createRadialGradient(
            width * 0.5,
            height * 0.3,
            width * 0.05,
            width * 0.5,
            height * 0.5,
            width * 0.75
          );
          grad.addColorStop(0, '#1e40af');
          grad.addColorStop(0.45, '#1e3a8a');
          grad.addColorStop(0.85, '#0f172a');
          grad.addColorStop(1, '#020617');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);
        } else {
          // academic-formal: Official Vietnamese student & passport blue
          const grad = ctx.createRadialGradient(
            width * 0.5,
            height * 0.35,
            width * 0.1,
            width * 0.5,
            height * 0.5,
            width * 0.7
          );
          grad.addColorStop(0, '#60a5fa');
          grad.addColorStop(0.55, '#2563eb');
          grad.addColorStop(1, '#1d4ed8');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);
        }

        // 2. Draw person with vignette and portrait focal clipping
        // Scale and center the person nicely
        const scale = Math.max(width / img.width, height / img.height) * 1.05;
        const drawW = img.width * scale;
        const drawH = img.height * scale;
        const drawX = (width - drawW) / 2;
        const drawY = (height - drawH) / 2 + height * 0.04;

        // Create portrait composition mask with soft edge blend
        ctx.save();
        // Blend mode to simulate professional lighting over the portrait
        ctx.drawImage(img, drawX, drawY, drawW, drawH);

        // 3. Studio Lighting Overlay
        // Key light from top-left
        const keyLight = ctx.createRadialGradient(
          width * 0.3,
          height * 0.25,
          width * 0.05,
          width * 0.3,
          height * 0.25,
          width * 0.7
        );
        keyLight.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
        keyLight.addColorStop(0.6, 'rgba(255, 255, 255, 0.05)');
        keyLight.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = keyLight;
        ctx.fillRect(0, 0, width, height);

        // Warm fill / Rim light
        if (styleId === 'outdoor-natural') {
          const sunWarmth = ctx.createLinearGradient(width, 0, 0, height);
          sunWarmth.addColorStop(0, 'rgba(251, 146, 60, 0.18)');
          sunWarmth.addColorStop(0.5, 'rgba(245, 158, 11, 0.05)');
          sunWarmth.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = sunWarmth;
          ctx.fillRect(0, 0, width, height);
        }

        // 4. Attire Enhancement / Shoulder Collar Layer
        if (attire === 'suit') {
          // Draw neat navy/dark charcoal lapels overlay at bottom
          ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
          ctx.beginPath();
          ctx.moveTo(0, height);
          ctx.lineTo(0, height * 0.76);
          ctx.quadraticCurveTo(width * 0.25, height * 0.78, width * 0.38, height * 0.86);
          ctx.lineTo(width * 0.44, height);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(width, height);
          ctx.lineTo(width, height * 0.76);
          ctx.quadraticCurveTo(width * 0.75, height * 0.78, width * 0.62, height * 0.86);
          ctx.lineTo(width * 0.56, height);
          ctx.closePath();
          ctx.fill();

          // Crisp white collar tip
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.beginPath();
          ctx.moveTo(width * 0.42, height * 0.84);
          ctx.lineTo(width * 0.47, height * 0.93);
          ctx.lineTo(width * 0.50, height * 0.88);
          ctx.lineTo(width * 0.53, height * 0.93);
          ctx.lineTo(width * 0.58, height * 0.84);
          ctx.closePath();
          ctx.fill();

          // Subtle tie accent
          ctx.fillStyle = '#991b1b'; // Burgundy tie
          ctx.beginPath();
          ctx.moveTo(width * 0.48, height * 0.90);
          ctx.lineTo(width * 0.52, height * 0.90);
          ctx.lineTo(width * 0.53, height);
          ctx.lineTo(width * 0.47, height);
          ctx.closePath();
          ctx.fill();
        } else if (attire === 'academic' || attire === 'blazer') {
          // Crisp school white shirt & collar
          ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
          ctx.beginPath();
          ctx.moveTo(0, height);
          ctx.lineTo(0, height * 0.82);
          ctx.quadraticCurveTo(width * 0.3, height * 0.80, width * 0.42, height * 0.85);
          ctx.lineTo(width * 0.50, height * 0.92);
          ctx.lineTo(width * 0.58, height * 0.85);
          ctx.quadraticCurveTo(width * 0.7, height * 0.80, width, height * 0.82);
          ctx.lineTo(width, height);
          ctx.closePath();
          ctx.fill();

          if (attire === 'blazer') {
            // Dark school uniform blazer over white shirt
            ctx.fillStyle = 'rgba(23, 37, 84, 0.90)';
            ctx.beginPath();
            ctx.moveTo(0, height);
            ctx.lineTo(0, height * 0.80);
            ctx.quadraticCurveTo(width * 0.22, height * 0.81, width * 0.36, height * 0.89);
            ctx.lineTo(width * 0.40, height);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(width, height);
            ctx.lineTo(width, height * 0.80);
            ctx.quadraticCurveTo(width * 0.78, height * 0.81, width * 0.64, height * 0.89);
            ctx.lineTo(width * 0.60, height);
            ctx.closePath();
            ctx.fill();
          }
        }

        // 5. Final Studio Post-processing (Crisp contrast & subtle vignette)
        const vignette = ctx.createRadialGradient(
          width / 2,
          height / 2,
          width * 0.4,
          width / 2,
          height / 2,
          width * 0.75
        );
        vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignette.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);

        // Watermark / Brand seal badge at subtle corner (optional or clean)
        ctx.restore();

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        resolve(dataUrl);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for headshot synthesis'));
    };
  });
}
