import React, { useState, useEffect, useMemo } from 'react';
import { usePerformanceMonitor, useViewportOptimization } from '@/hooks/usePerformance';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  domContentLoaded: number;
  loadComplete: number;
  memoryUsage?: {
    used: number;
    total: number;
    limit: number;
  };
}

interface PerformanceAnalyzerProps {
  showMetrics?: boolean;
  autoReport?: boolean;
  threshold?: {
    fcp: number;
    lcp: number;
    fid: number;
    cls: number;
  };
}

const PerformanceAnalyzer: React.FC<PerformanceAnalyzerProps> = ({
  showMetrics = false,
  autoReport = true,
  threshold = {
    fcp: 1800, // 1.8s
    lcp: 2500, // 2.5s
    fid: 100,  // 100ms
    cls: 0.1   // 0.1
  }
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isCollecting, setIsCollecting] = useState(false);
  const { viewport, isVisible } = useViewportOptimization();

  // Función para obtener Core Web Vitals
  const collectWebVitals = (): Promise<PerformanceMetrics> => {
    return new Promise((resolve) => {
      const perfData: Partial<PerformanceMetrics> = {};
      
      // Usar Web Vitals API si está disponible
      if ('web-vitals' in window) {
        // En un proyecto real, usaríamos la librería web-vitals
        console.log('Web Vitals API disponible');
      }

      // Performance Observer para LCP
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1] as any;
            
            if (lastEntry) {
              perfData.lcp = lastEntry.renderTime || lastEntry.loadTime;
            }
          });
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
          
          // FID Observer
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              perfData.fid = entry.processingStart - entry.startTime;
            });
          });
          fidObserver.observe({ entryTypes: ['first-input'] });

        } catch (error) {
          console.warn('Performance Observer no soportado completamente');
        }
      }

      // Navigation Timing
      if ('performance' in window && window.performance.timing) {
        const timing = window.performance.timing;
        const navigation = window.performance.navigation;
        
        perfData.ttfb = timing.responseStart - timing.requestStart;
        perfData.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
        perfData.loadComplete = timing.loadEventEnd - timing.navigationStart;
        perfData.fcp = timing.domInteractive - timing.navigationStart;
      }

      // Memory Usage (si está disponible)
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        perfData.memoryUsage = {
          used: memory.usedJSHeapSize / (1024 * 1024), // MB
          total: memory.totalJSHeapSize / (1024 * 1024), // MB
          limit: memory.jsHeapSizeLimit / (1024 * 1024) // MB
        };
      }

      // CLS calculation (simplificado)
      if ('PerformanceObserver' in window) {
        try {
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            });
            perfData.cls = clsValue;
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (error) {
          console.warn('CLS measurement not supported');
        }
      }

      // Establecer valores por defecto para métricas no disponibles
      setTimeout(() => {
        resolve({
          fcp: perfData.fcp || 0,
          lcp: perfData.lcp || 0,
          fid: perfData.fid || 0,
          cls: perfData.cls || 0,
          ttfb: perfData.ttfb || 0,
          domContentLoaded: perfData.domContentLoaded || 0,
          loadComplete: perfData.loadComplete || 0,
          memoryUsage: perfData.memoryUsage
        } as PerformanceMetrics);
      }, 2000); // Esperar 2s para obtener métricas
    });
  };

  // Evaluar performance
  const evaluateMetrics = (metrics: PerformanceMetrics) => {
    const scores = {
      fcp: metrics.fcp <= threshold.fcp ? 'good' : metrics.fcp <= threshold.fcp * 1.5 ? 'needs-improvement' : 'poor',
      lcp: metrics.lcp <= threshold.lcp ? 'good' : metrics.lcp <= threshold.lcp * 1.2 ? 'needs-improvement' : 'poor',
      fid: metrics.fid <= threshold.fid ? 'good' : metrics.fid <= threshold.fid * 3 ? 'needs-improvement' : 'poor',
      cls: metrics.cls <= threshold.cls ? 'good' : metrics.cls <= threshold.cls * 2.5 ? 'needs-improvement' : 'poor'
    };

    return scores;
  };

  // Generar recomendaciones
  const generateRecommendations = (metrics: PerformanceMetrics, scores: any) => {
    const recommendations: string[] = [];

    if (scores.fcp !== 'good') {
      recommendations.push('• Optimizar recursos críticos (CSS, JS) para mejorar First Contentful Paint');
      recommendations.push('• Implementar code splitting para reducir bundle inicial');
    }

    if (scores.lcp !== 'good') {
      recommendations.push('• Optimizar imágenes above-the-fold con lazy loading');
      recommendations.push('• Usar CDN para servir recursos estáticos');
    }

    if (scores.fid !== 'good') {
      recommendations.push('• Minimizar JavaScript de bloqueo');
      recommendations.push('• Usar web workers para tareas pesadas');
    }

    if (scores.cls !== 'good') {
      recommendations.push('• Definir dimensiones para imágenes y elementos');
      recommendations.push('• Evitar insertar contenido dinámico above-the-fold');
    }

    if (metrics.memoryUsage && metrics.memoryUsage.used > metrics.memoryUsage.total * 0.8) {
      recommendations.push('• Optimizar uso de memoria, considerar limpieza de referencias');
    }

    return recommendations;
  };

  // Recopilar métricas automáticamente
  useEffect(() => {
    if (autoReport && isVisible) {
      setIsCollecting(true);
      collectWebVitals().then((data) => {
        setMetrics(data);
        setIsCollecting(false);
      });
    }
  }, [autoReport, isVisible]);

  // Análisis memoizado
  const analysis = useMemo(() => {
    if (!metrics) return null;

    const scores = evaluateMetrics(metrics);
    const recommendations = generateRecommendations(metrics, scores);
    
    const overallScore = Object.values(scores).filter(score => score === 'good').length / 4;
    const grade = overallScore >= 0.75 ? 'A' : overallScore >= 0.5 ? 'B' : overallScore >= 0.25 ? 'C' : 'D';

    return { scores, recommendations, grade, overallScore };
  }, [metrics]);

  const formatTime = (time: number) => `${Math.round(time)}ms`;
  const formatScore = (score: string) => {
    const colors = {
      good: 'text-green-600 bg-green-100',
      'needs-improvement': 'text-yellow-600 bg-yellow-100', 
      poor: 'text-red-600 bg-red-100'
    };
    const labels = {
      good: 'Bueno',
      'needs-improvement': 'Mejorable',
      poor: 'Pobre'
    };
    return { color: colors[score as keyof typeof colors], label: labels[score as keyof typeof labels] };
  };

  if (!showMetrics) {
    return (
      <button
        onClick={() => collectWebVitals().then(setMetrics)}
        disabled={isCollecting}
        className="fixed bottom-4 left-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 z-50"
        aria-label="Analizar performance"
        title="Analizar performance de la página"
      >
        {isCollecting ? '⏳' : '📊'} Perf
      </button>
    );
  }

  return (
    <div className="fixed top-4 left-4 max-w-sm bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            📊 Análisis de Performance
          </h3>
          <button
            onClick={() => collectWebVitals().then(setMetrics)}
            disabled={isCollecting}
            className="text-green-600 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 rounded text-sm"
          >
            {isCollecting ? '⏳' : '🔄'}
          </button>
        </div>
        
        {analysis && (
          <div className="flex items-center mt-2 space-x-2">
            <span className={`text-2xl font-bold ${
              analysis.grade === 'A' ? 'text-green-600' :
              analysis.grade === 'B' ? 'text-yellow-600' :
              analysis.grade === 'C' ? 'text-orange-600' : 'text-red-600'
            }`}>
              {analysis.grade}
            </span>
            <span className="text-xs text-gray-500">
              Puntuación: {Math.round(analysis.overallScore * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Métricas */}
      <div className="p-4">
        {isCollecting && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Recopilando métricas...</p>
          </div>
        )}

        {metrics && analysis && (
          <>
            {/* Core Web Vitals */}
            <div className="space-y-3 mb-4">
              <h4 className="text-sm font-medium text-gray-900">Core Web Vitals</h4>
              
              {[
                { key: 'lcp', label: 'LCP', value: formatTime(metrics.lcp), description: 'Largest Contentful Paint' },
                { key: 'fid', label: 'FID', value: formatTime(metrics.fid), description: 'First Input Delay' },
                { key: 'cls', label: 'CLS', value: metrics.cls.toFixed(3), description: 'Cumulative Layout Shift' },
                { key: 'fcp', label: 'FCP', value: formatTime(metrics.fcp), description: 'First Contentful Paint' }
              ].map((metric) => {
                const scoreInfo = formatScore(analysis.scores[metric.key as keyof typeof analysis.scores]);
                return (
                  <div key={metric.key} className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-medium text-gray-900">{metric.label}</span>
                      <span className="text-gray-500 ml-1">{metric.value}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${scoreInfo.color}`}>
                      {scoreInfo.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Otras métricas */}
            <div className="space-y-2 mb-4 text-xs">
              <h4 className="text-sm font-medium text-gray-900">Otras Métricas</h4>
              <div className="flex justify-between">
                <span>TTFB:</span>
                <span>{formatTime(metrics.ttfb)}</span>
              </div>
              <div className="flex justify-between">
                <span>DOM Ready:</span>
                <span>{formatTime(metrics.domContentLoaded)}</span>
              </div>
              <div className="flex justify-between">
                <span>Load Complete:</span>
                <span>{formatTime(metrics.loadComplete)}</span>
              </div>
              {metrics.memoryUsage && (
                <div className="flex justify-between">
                  <span>Memory:</span>
                  <span>{Math.round(metrics.memoryUsage.used)} MB</span>
                </div>
              )}
            </div>

            {/* Información del dispositivo */}
            <div className="space-y-1 mb-4 text-xs border-t pt-3">
              <h4 className="text-sm font-medium text-gray-900">Dispositivo</h4>
              <div className="flex justify-between">
                <span>Viewport:</span>
                <span>{viewport.width}x{viewport.height}</span>
              </div>
              <div className="flex justify-between">
                <span>Tipo:</span>
                <span>{viewport.isMobile ? 'Móvil' : viewport.isTablet ? 'Tablet' : 'Desktop'}</span>
              </div>
            </div>

            {/* Recomendaciones */}
            {analysis.recommendations.length > 0 && (
              <div className="border-t pt-3">
                <h4 className="text-sm font-medium text-gray-900 mb-2">💡 Recomendaciones</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  {analysis.recommendations.slice(0, 3).map((rec, index) => (
                    <p key={index}>{rec}</p>
                  ))}
                  {analysis.recommendations.length > 3 && (
                    <p className="text-gray-500">+ {analysis.recommendations.length - 3} más...</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PerformanceAnalyzer;