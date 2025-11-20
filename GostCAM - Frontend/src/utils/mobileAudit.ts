// Auditoría de Touch Targets y UX Móvil
// Este script verifica que todos los elementos interactivos cumplan con las pautas móviles

export interface TouchTargetAudit {
  file: string;
  line: number;
  element: string;
  issue: 'small-touch-target' | 'missing-touch-target' | 'insufficient-spacing' | 'missing-mobile-optimization';
  description: string;
  suggestion: string;
}

export const MOBILE_GUIDELINES = {
  MIN_TOUCH_TARGET: 44, // 44px mínimo según Apple/Google
  RECOMMENDED_TOUCH_TARGET: 48, // 48px recomendado
  MIN_SPACING: 8, // 8px mínimo entre elementos tocables
  RECOMMENDED_SPACING: 12, // 12px recomendado entre elementos
};

export const TOUCH_TARGET_PATTERNS = [
  // Botones que necesitan touch targets
  /className="[^"]*\b(button|btn)\b[^"]*"/g,
  /onClick=/g,
  /onTouchStart=/g,
  /role="button"/g,
  
  // Inputs y elementos interactivos
  /type="(text|email|password|search|tel|url|number)"/g,
  /type="(checkbox|radio)"/g,
  /type="(submit|button|reset)"/g,
  /<select/g,
  /<textarea/g,
  
  // Links y navegación
  /<a\s+[^>]*href/g,
  /role="link"/g,
  
  // Elementos personalizados interactivos
  /onKeyDown=/g,
  /onKeyPress=/g,
  /tabIndex=/g,
];

export const REQUIRED_MOBILE_CLASSES = [
  'min-h-[44px]',
  'min-w-[44px]', 
  'h-11', // 44px
  'h-12', // 48px
  'py-2', // Padding vertical mínimo
  'px-3', // Padding horizontal mínimo
  'touch-manipulation', // CSS para optimizar touch
];

export const MOBILE_RESPONSIVE_PATTERNS = [
  /sm:/g, // Small screens
  /md:/g, // Medium screens  
  /lg:/g, // Large screens
  /xl:/g, // Extra large screens
  /2xl:/g, // 2XL screens
];

export function auditTouchTargets(content: string, fileName: string): TouchTargetAudit[] {
  const issues: TouchTargetAudit[] = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    
    // Verificar botones sin touch targets adecuados
    if (/className="[^"]*button[^"]*"/g.test(line) || /onClick=/.test(line)) {
      if (!/min-h-\[(44|48|11|12)\]|h-(11|12)|py-[2-9]/.test(line)) {
        issues.push({
          file: fileName,
          line: lineNumber,
          element: line.trim(),
          issue: 'small-touch-target',
          description: 'Elemento interactivo sin touch target mínimo de 44px',
          suggestion: 'Agregar min-h-[44px] o h-11 (44px) a la clase'
        });
      }
    }
    
    // Verificar inputs sin padding adecuado
    if (/<input|<select|<textarea/.test(line)) {
      if (!/h-(10|11|12)|py-[2-9]|p-[2-9]/.test(line)) {
        issues.push({
          file: fileName,
          line: lineNumber,
          element: line.trim(),
          issue: 'small-touch-target',
          description: 'Input sin altura/padding mínimo para touch',
          suggestion: 'Agregar h-10, h-11 o py-2 mínimo'
        });
      }
    }
    
    // Verificar responsividad móvil
    if (/className="[^"]*"/.test(line) && !/\b(sm:|md:|lg:)/.test(line) && /flex|grid|w-/.test(line)) {
      issues.push({
        file: fileName,
        line: lineNumber,
        element: line.trim(),
        issue: 'missing-mobile-optimization',
        description: 'Elemento layout sin optimización móvil responsiva',
        suggestion: 'Considerar agregar breakpoints sm:, md: para mejor UX móvil'
      });
    }
  });
  
  return issues;
}

export function generateMobileOptimizationReport(issues: TouchTargetAudit[]): string {
  const report = `
# 📱 Reporte de Optimización Móvil

## Resumen
- Total de issues encontrados: ${issues.length}
- Touch targets pequeños: ${issues.filter(i => i.issue === 'small-touch-target').length}
- Falta optimización móvil: ${issues.filter(i => i.issue === 'missing-mobile-optimization').length}

## Issues por Archivo:
${issues.reduce((acc, issue) => {
  if (!acc[issue.file]) acc[issue.file] = [];
  acc[issue.file].push(issue);
  return acc;
}, {} as Record<string, TouchTargetAudit[]>)}

## Recomendaciones:
1. ✅ Asegurar touch targets mínimos de 44px
2. ✅ Usar breakpoints responsive (sm:, md:, lg:)
3. ✅ Agregar padding adecuado en elementos interactivos
4. ✅ Implementar gesture-friendly navigation
5. ✅ Verificar orientación landscape

`;

  return report;
}