import React from 'react'
import { CardProps } from '../../types'
import { cn } from '../../utils/cn'

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  actions,
  hover = false,
  padding = 'md',
  className,
  ...props
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  const baseClasses = 'bg-white rounded-lg shadow-sm border border-gray-200'
  const hoverClasses = hover ? 'hover:shadow-md hover:border-gray-300 transition-all duration-200' : ''
  const cardClasses = cn(
    baseClasses,
    hoverClasses,
    paddingClasses[padding],
    className
  )

  return (
    <div className={cardClasses} {...props}>
      {(title || subtitle || actions) && (
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="ml-4 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

export default Card 
