#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

function generateSVGIcon(size) {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f97316;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#fb923c;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)"/>
  <text x="50%" y="50%" font-size="${size * 0.5}" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif">🦉</text>
</svg>`;
}

console.log('Генерация иконок Master Owl...\n');

sizes.forEach(size => {
  const svgContent = generateSVGIcon(size);
  const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);

  fs.writeFileSync(svgPath, svgContent);
  console.log(`✓ Создана иконка: icon-${size}x${size}.svg`);
});

console.log('\n✅ Все SVG иконки успешно созданы!');
console.log('\n📝 Для создания PNG версий:');
console.log('   1. Откройте public/icons/generate-icons.html в браузере');
console.log('   2. ИЛИ используйте онлайн конвертер: https://cloudconvert.com/svg-to-png');
console.log('   3. ИЛИ используйте ImageMagick/Inkscape для конвертации\n');
console.log('Примеры команд для конвертации с помощью ImageMagick:');
sizes.forEach(size => {
  console.log(`   convert public/icons/icon-${size}x${size}.svg public/icons/icon-${size}x${size}.png`);
});
