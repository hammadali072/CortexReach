import PropTypes from 'prop-types'
import clsx from 'clsx'

const Badge = ({ children, variant = 'default', className = '' }) => {
    const variantClasses = {
        default: 'bg-slate-100 text-slate-800',
        primary: 'bg-gradient-brand text-white-tint shadow-sm',
        accent: 'bg-purple-tint text-primary',
        success: 'bg-emerald-100 text-emerald-800',
        warning: 'bg-amber-100 text-amber-800',
        danger: 'bg-rose-100 text-rose-800',
        info: 'bg-cyan-100 text-cyan-800',
        secondary: 'bg-white-tint text-primary border border-purple-tint/20',
        outline: 'border border-primary/20 text-primary bg-transparent'
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
