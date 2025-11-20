import React from 'react';

interface SkipLink {
  href: string;
  label: string;
  description?: string;
}

interface AccessibilitySkipLinksProps {
  links?: SkipLink[];
}

const defaultSkipLinks: SkipLink[] = [
  {
    href: '#main-content',
    label: 'Saltar al contenido principal',
    description: 'Ir directamente al contenido principal de la página'
  },
  {
    href: '#navigation',
    label: 'Saltar a la navegación',
    description: 'Ir al menú de navegación principal'
  },
  {
    href: '#search',
    label: 'Saltar a la búsqueda',
    description: 'Ir al campo de búsqueda'
  },
  {
    href: '#footer',
    label: 'Saltar al pie de página',
    description: 'Ir a la información del pie de página'
  }
];

const AccessibilitySkipLinks: React.FC<AccessibilitySkipLinksProps> = ({
  links = defaultSkipLinks
}) => {
  const handleSkipLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    
    const targetElement = document.querySelector(href) as HTMLElement;
    if (targetElement) {
      // Hacer el elemento focuseable temporalmente si no lo es
      const originalTabIndex = targetElement.getAttribute('tabindex');
      if (!targetElement.hasAttribute('tabindex')) {
        targetElement.setAttribute('tabindex', '-1');
      }
      
      // Enfocar el elemento
      targetElement.focus();
      
      // Restaurar el tabindex original después de un tiempo
      if (originalTabIndex === null) {
        setTimeout(() => {
          targetElement.removeAttribute('tabindex');
        }, 1000);
      }

      // Scroll suave al elemento
      targetElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  return (
    <>
      {/* Skip links que aparecen solo cuando tienen foco */}
      <nav 
        className="sr-only-focusable fixed top-0 left-0 z-[9999] bg-blue-600 text-white p-2 rounded-br-lg shadow-lg"
        aria-label="Enlaces de salto para accesibilidad"
        role="navigation"
      >
        <div className="flex flex-col space-y-1">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.href}
              onClick={(e) => handleSkipLinkClick(e, link.href)}
              className="block px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium rounded focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-colors"
              aria-describedby={link.description ? `skip-desc-${index}` : undefined}
            >
              {link.label}
              {link.description && (
                <span id={`skip-desc-${index}`} className="sr-only">
                  {link.description}
                </span>
              )}
            </a>
          ))}
        </div>
      </nav>

      {/* Estilos CSS necesarios para sr-only-focusable */}
      <style jsx>{`
        .sr-only-focusable {
          position: fixed !important;
          top: -40px;
          left: 6px;
          width: auto;
          height: auto;
          overflow: visible;
          clip: auto;
          white-space: normal;
          transform: translateY(-100%);
          transition: transform 0.3s ease;
        }

        .sr-only-focusable:focus,
        .sr-only-focusable:focus-within {
          transform: translateY(0);
        }

        .sr-only-focusable a:focus {
          position: relative;
          z-index: 10000;
        }
      `}</style>
    </>
  );
};

// Hook para manejar landmarks de accesibilidad
export function useAccessibilityLandmarks() {
  const setMainContent = (element: HTMLElement | null) => {
    if (element && !element.getAttribute('id')) {
      element.setAttribute('id', 'main-content');
      element.setAttribute('role', 'main');
      element.setAttribute('aria-label', 'Contenido principal');
    }
  };

  const setNavigation = (element: HTMLElement | null) => {
    if (element && !element.getAttribute('id')) {
      element.setAttribute('id', 'navigation');
      element.setAttribute('role', 'navigation');
      element.setAttribute('aria-label', 'Navegación principal');
    }
  };

  const setSearch = (element: HTMLElement | null) => {
    if (element && !element.getAttribute('id')) {
      element.setAttribute('id', 'search');
      element.setAttribute('role', 'search');
      element.setAttribute('aria-label', 'Búsqueda');
    }
  };

  const setFooter = (element: HTMLElement | null) => {
    if (element && !element.getAttribute('id')) {
      element.setAttribute('id', 'footer');
      element.setAttribute('role', 'contentinfo');
      element.setAttribute('aria-label', 'Información del sitio');
    }
  };

  return {
    setMainContent,
    setNavigation,
    setSearch,
    setFooter
  };
}

export default AccessibilitySkipLinks;