import React from 'react';

/**
 * Skeleton component with shimmer effect for premium loading states.
 * 
 * @param {Object} props
 * @param {string} props.className - Custom Tailwind classes for shape and size
 * @param {string} props.width - Width of the skeleton
 * @param {string} props.height - Height of the skeleton
 * @param {boolean} props.circle - If true, the skeleton will be circular
 */
export default function Skeleton({ 
    className = '', 
    width = 'full', 
    height = '4', 
    circle = false,
    ...props 
}) {
    const baseClasses = "relative overflow-hidden bg-on-surface/10 border border-outline-variant";
    const shapeClasses = circle ? "rounded-full" : "rounded-xl";
    
    // Width and height mapping for basic utility if passed as props
    const wClass = width.startsWith('w-') ? width : `w-${width}`;
    const hClass = height.startsWith('h-') ? height : `h-${height}`;

    return (
        <div 
            className={`${baseClasses} ${shapeClasses} ${wClass} ${hClass} ${className}`}
            {...props}
        >
            {/* Shimmer overlay */}
            <div className="absolute inset-0 shimmer" />
        </div>
    );
}

/**
 * Pre-defined skeleton patterns for common UI elements
 */
Skeleton.Avatar = ({ size = "10", className = "" }) => (
    <Skeleton circle width={size} height={size} className={className} />
);

Skeleton.Line = ({ className = "", lines = 1 }) => (
    <div className={`space-y-3 w-full ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton key={i} height="4" width={i === lines - 1 && lines > 1 ? "3/4" : "full"} />
        ))}
    </div>
);

Skeleton.Card = ({ className = "" }) => (
    <div className={`bg-surface p-6 rounded-[2rem] border-2 border-outline-variant space-y-4 ${className}`}>
        <div className="flex items-center gap-4">
            <Skeleton.Avatar size="12" />
            <div className="space-y-2 flex-1">
                <Skeleton width="1/2" height="4" />
                <Skeleton width="1/4" height="2" />
            </div>
        </div>
        <Skeleton.Line lines={2} className="mt-4" />
    </div>
);
