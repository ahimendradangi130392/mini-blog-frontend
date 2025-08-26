import React from 'react'
import { cn } from '../../utils/cn'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded'
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded'
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  )
}

// Predefined skeleton components
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 1,
  className
}) => (
  <div className={className}>
    {Array.from({ length: lines }).map((_, index) => (
      <div key={index} className={index < lines - 1 ? 'mb-2' : ''}>
        <Skeleton
          variant="text"
          className={index === lines - 1 ? 'w-3/4' : 'w-full'}
        />
      </div>
    ))}
  </div>
)

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-6 space-y-4', className)}>
    <Skeleton variant="text" className="w-3/4" />
    <Skeleton variant="text" className="w-full" />
    <Skeleton variant="text" className="w-1/2" />
  </div>
)

export const SkeletonAvatar: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className
}) => (
  <Skeleton
    variant="circular"
    width={size}
    height={size}
    className={className}
  />
)

export default Skeleton 
