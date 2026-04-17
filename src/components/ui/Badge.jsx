import PropTypes from 'prop-types'
import clsx from 'clsx'

const Badge = ({ children, variant = 'default', className = '' }) => {
    const variantClasses = {
        default: 'bg-gray-100 text-gray-800',
        primary: 'bg-blue-100 text-blue-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
        info: 'bg-cyan-100 text-cyan-800',
        secondary: 'bg-slate-100 text-slate-600',
        outline: 'border border-slate-200 text-slate-600 bg-transparent'
    }

    return (
        <span className={clsx(
            'inline-flex items-center px-4 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-widest',
            variantClasses[variant],
            className
        )}>
            {children}
        </span>
    )
}

Badge.propTypes = {
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf(['default', 'primary', 'success', 'warning', 'danger', 'info', 'outline', 'secondary']),
    className: PropTypes.string
}

export default Badge
