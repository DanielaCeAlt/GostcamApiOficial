import React, { useState, useEffect } from 'react';
import { useContrastValidation } from '@/hooks/useAccessibility';

interface AccessibilityIssue {
  type: 'contrast' | 'missing-alt' | 'no-label' | 'focus-order' | 'heading-structure';
  severity: 'error' | 'warning' | 'info';
  element: string;
  description: string;
  recommendation: string;
  wcagReference: string;
}

interface AccessibilityValidatorProps {
  autoCheck?: boolean;
  showResults?: boolean;
}

const AccessibilityValidator: React.FC<AccessibilityValidatorProps> = ({
  autoCheck = false,
  showResults = false
}) => {
  const [issues, setIssues] = useState<AccessibilityIssue[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const { auditPageContrast, validateContrast } = useContrastValidation();

  // Auditar contraste de colores
  const checkColorContrast = (): AccessibilityIssue[] => {
    const contrastIssues: AccessibilityIssue[] = [];
    
    // Colores comunes a verificar (simplificado para demo)
    const colorTests = [
      { fg: '#6b7280', bg: '#ffffff', context: 'Texto gris en fondo blanco' }, // gray-500
      { fg: '#374151', bg: '#f3f4f6', context: 'Texto oscuro en fondo gris claro' }, // gray-700 / gray-100
      { fg: '#1f2937', bg: '#ffffff', context: 'Texto principal en fondo blanco' }, // gray-800
      { fg: '#3b82f6', bg: '#ffffff', context: 'Enlaces azules en fondo blanco' }, // blue-500
      { fg: '#ffffff', bg: '#3b82f6', context: 'Texto blanco en botón azul' }, // white / blue-500
    ];

    colorTests.forEach(test => {
      const result = validateContrast(test.fg, test.bg);
      
      if (!result.aa) {
        contrastIssues.push({
          type: 'contrast',
          severity: result.ratio < 3 ? 'error' : 'warning',
          element: test.context,
          description: `Ratio de contraste ${result.ratio}:1 no cumple WCAG AA (4.5:1)`,
          recommendation: 'Usar colores con mayor contraste o aumentar el grosor de la fuente',
          wcagReference: 'WCAG 1.4.3 - Contrast (Minimum)'
        });
      }
    });

    return contrastIssues;
  };

  // Verificar imágenes sin texto alternativo
  const checkImageAlt = (): AccessibilityIssue[] => {
    const altIssues: AccessibilityIssue[] = [];
    const images = document.querySelectorAll('img');
    
    images.forEach((img, index) => {
      const alt = img.getAttribute('alt');
      const src = img.getAttribute('src') || '';
      
      if (alt === null || alt === '') {
        // Verificar si es decorativa
        const isDecorative = img.getAttribute('role') === 'presentation' || 
                           img.getAttribute('aria-hidden') === 'true';
        
        if (!isDecorative) {
          altIssues.push({
            type: 'missing-alt',
            severity: 'error',
            element: `Imagen ${index + 1}: ${src.substring(0, 50)}...`,
            description: 'Imagen sin texto alternativo',
            recommendation: 'Añadir atributo alt descriptivo o role="presentation" si es decorativa',
            wcagReference: 'WCAG 1.1.1 - Non-text Content'
          });
        }
      }
    });

    return altIssues;
  };

  // Verificar elementos sin etiquetas
  const checkMissingLabels = (): AccessibilityIssue[] => {
    const labelIssues: AccessibilityIssue[] = [];
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach((input, index) => {
      const hasLabel = input.getAttribute('aria-label') ||
                     input.getAttribute('aria-labelledby') ||
                     document.querySelector(`label[for="${input.id}"]`);
      
      if (!hasLabel && input.getAttribute('type') !== 'hidden') {
        labelIssues.push({
          type: 'no-label',
          severity: 'error',
          element: `${input.tagName} ${index + 1} (${input.getAttribute('type') || 'text'})`,
          description: 'Elemento de formulario sin etiqueta accesible',
          recommendation: 'Añadir aria-label, aria-labelledby o elemento <label>',
          wcagReference: 'WCAG 1.3.1 - Info and Relationships'
        });
      }
    });

    return labelIssues;
  };

  // Verificar estructura de encabezados
  const checkHeadingStructure = (): AccessibilityIssue[] => {
    const headingIssues: AccessibilityIssue[] = [];
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    let previousLevel = 0;
    
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      
      // Verificar salto de niveles
      if (level - previousLevel > 1) {
        headingIssues.push({
          type: 'heading-structure',
          severity: 'warning',
          element: `${heading.tagName} ${index + 1}: "${heading.textContent?.substring(0, 50)}..."`,
          description: `Salto en jerarquía de encabezados (de h${previousLevel} a h${level})`,
          recommendation: 'Usar encabezados en orden jerárquico sin saltar niveles',
          wcagReference: 'WCAG 1.3.1 - Info and Relationships'
        });
      }
      
      previousLevel = level;
    });

    return headingIssues;
  };

  // Verificar orden de focus
  const checkFocusOrder = (): AccessibilityIssue[] => {
    const focusIssues: AccessibilityIssue[] = [];
    const focusableElements = document.querySelectorAll(
      'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
    );
    
    const elementsWithNegativeTabIndex = document.querySelectorAll('[tabindex^="-"]');
    const elementsWithHighTabIndex = document.querySelectorAll('[tabindex]:not([tabindex="0"]):not([tabindex^="-"])');
    
    if (elementsWithHighTabIndex.length > 0) {
      focusIssues.push({
        type: 'focus-order',
        severity: 'warning',
        element: `${elementsWithHighTabIndex.length} elementos con tabindex > 0`,
        description: 'Uso de tabindex positivos puede crear orden de foco confuso',
        recommendation: 'Usar orden DOM natural y tabindex="0" o "-1" únicamente',
        wcagReference: 'WCAG 2.4.3 - Focus Order'
      });
    }

    return focusIssues;
  };

  // Ejecutar todas las validaciones
  const runAccessibilityCheck = async () => {
    setIsChecking(true);
    
    try {
      const allIssues: AccessibilityIssue[] = [
        ...checkColorContrast(),
        ...checkImageAlt(),
        ...checkMissingLabels(),
        ...checkHeadingStructure(),
        ...checkFocusOrder()
      ];
      
      setIssues(allIssues);
      setLastCheck(new Date());
    } catch (error) {
      console.error('Error during accessibility check:', error);
    } finally {
      setIsChecking(false);
    }
  };

  // Auto-check cuando se monta el componente
  useEffect(() => {
    if (autoCheck) {
      // Delay para permitir que el DOM se renderice completamente
      const timer = setTimeout(() => {
        runAccessibilityCheck();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [autoCheck]);

  const getIssueIcon = (severity: AccessibilityIssue['severity']) => {
    switch (severity) {
      case 'error': return '🔴';
      case 'warning': return '🟡';
      case 'info': return '🔵';
      default: return '⚪';
    }
  };

  const getIssuePriority = (type: AccessibilityIssue['type']) => {
    const priorities = {
      'contrast': 1,
      'missing-alt': 2,
      'no-label': 3,
      'heading-structure': 4,
      'focus-order': 5
    };
    return priorities[type] || 999;
  };

  const sortedIssues = issues.sort((a, b) => {
    if (a.severity !== b.severity) {
      const severityOrder = { error: 1, warning: 2, info: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    return getIssuePriority(a.type) - getIssuePriority(b.type);
  });

  const errorCount = issues.filter(issue => issue.severity === 'error').length;
  const warningCount = issues.filter(issue => issue.severity === 'warning').length;

  if (!showResults && !autoCheck) {
    return (
      <button
        onClick={runAccessibilityCheck}
        disabled={isChecking}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-50"
        aria-label="Ejecutar validación de accesibilidad"
        title="Validar accesibilidad de la página"
      >
        {isChecking ? '⏳' : '🔍'} A11y
      </button>
    );
  }

  if (!showResults && issues.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-white border border-gray-300 rounded-lg shadow-lg z-50">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            🔍 Validación de Accesibilidad
          </h3>
          <button
            onClick={runAccessibilityCheck}
            disabled={isChecking}
            className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Ejecutar nueva validación"
          >
            {isChecking ? '⏳' : '🔄'}
          </button>
        </div>
        
        {lastCheck && (
          <div className="text-xs text-gray-500 mt-1">
            Última validación: {lastCheck.toLocaleTimeString()}
          </div>
        )}
        
        <div className="flex items-center space-x-3 mt-2 text-xs">
          <span className="flex items-center">
            🔴 {errorCount} errores
          </span>
          <span className="flex items-center">
            🟡 {warningCount} advertencias
          </span>
        </div>
      </div>

      {/* Results */}
      <div className="max-h-96 overflow-y-auto">
        {issues.length === 0 ? (
          <div className="px-4 py-6 text-center text-gray-500">
            <div className="text-2xl mb-2">✅</div>
            <p className="text-sm">¡Sin problemas de accesibilidad detectados!</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {sortedIssues.map((issue, index) => (
              <div
                key={index}
                className={`p-3 rounded-md border ${
                  issue.severity === 'error'
                    ? 'bg-red-50 border-red-200'
                    : issue.severity === 'warning'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start space-x-2">
                  <span className="flex-shrink-0 mt-0.5">
                    {getIssueIcon(issue.severity)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900">
                      {issue.element}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {issue.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      💡 {issue.recommendation}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      📖 {issue.wcagReference}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessibilityValidator;