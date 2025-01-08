import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface TooltipPortalProps {
  text: string;
  children: React.ReactNode;
  className?: string;
  arrowPosition?: 'bottom' | 'bottom-right';
}

const TooltipPortal = ({
  text,
  children,
  className = '',
  arrowPosition = 'bottom',
}: TooltipPortalProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTooltipPosition = () => {
      if (triggerRef.current && showTooltip) {
        const rect = triggerRef.current.getBoundingClientRect();
        const tooltipHeight = tooltipRef.current?.offsetHeight || 0;
        const tooltipWidth = tooltipRef.current?.offsetWidth || 0;

        // Check if tooltip would be cut off at the top
        const wouldBeCutOffAtTop = rect.top - tooltipHeight - 8 < 0;

        // Check if tooltip would be cut off at the right
        const wouldBeCutOffAtRight =
          rect.left + tooltipWidth / 2 > window.innerWidth - 16;

        // Check if tooltip would be cut off at the left
        const wouldBeCutOffAtLeft = rect.left - tooltipWidth / 2 < 16;

        let top = wouldBeCutOffAtTop
          ? rect.bottom + 8 // Position below if it would be cut off at top
          : rect.top - 8; // Position above by default

        let left = rect.left + rect.width / 2;

        // Adjust horizontal position if needed
        if (wouldBeCutOffAtRight) {
          left = window.innerWidth - tooltipWidth / 2 - 16;
        } else if (wouldBeCutOffAtLeft) {
          left = tooltipWidth / 2 + 16;
        }

        // Ensure tooltip doesn't go above viewport
        if (top < 16) {
          top = 16;
        }

        // Ensure tooltip doesn't go below viewport
        if (top + tooltipHeight > window.innerHeight - 16) {
          top = window.innerHeight - tooltipHeight - 16;
        }

        setTooltipPosition({ top, left });
      }
    };

    updateTooltipPosition();
    window.addEventListener('scroll', updateTooltipPosition, true);
    window.addEventListener('resize', updateTooltipPosition);

    return () => {
      window.removeEventListener('scroll', updateTooltipPosition, true);
      window.removeEventListener('resize', updateTooltipPosition);
    };
  }, [showTooltip]);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={className}
      >
        {children}
      </div>
      {showTooltip &&
        createPortal(
          <div
            ref={tooltipRef}
            className="fixed z-[9999] transform -translate-x-1/2 px-2 py-1 text-sm text-white bg-neutral rounded pointer-events-none whitespace-nowrap"
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              transform: `translate(-50%, ${
                tooltipPosition.top ===
                triggerRef.current?.getBoundingClientRect().top - 8
                  ? '-100%'
                  : '0%'
              })`,
            }}
          >
            {text}
            <div
              className={`absolute border-4 border-transparent ${
                arrowPosition === 'bottom-right'
                  ? 'right-2 bottom-[-8px] border-t-neutral'
                  : `-translate-x-1/2 left-1/2 ${
                      tooltipPosition.top ===
                      triggerRef.current?.getBoundingClientRect().top - 8
                        ? 'top-full -translate-y-1/3 border-t-neutral'
                        : 'bottom-full translate-y-1/3 border-b-neutral'
                    }`
              }`}
            />
          </div>,
          document.body
        )}
    </>
  );
};

export default TooltipPortal;
