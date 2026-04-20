import PropTypes from 'prop-types'
import clsx from 'clsx'

const Button = ({
    children,
    variant = 'primary',
    size = 'medium',
    className = '',
    onClick,
    disabled = false,
    type = 'button'
}) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'

    const variantClasses = {
        primary: 'bg-gradient-brand text-white-tint hover:opacity-90 focus:ring-primary/20 disabled:bg-primary/50 shadow-button transition-all hover:-translate-y-0.5',
        secondary: 'bg-purple-tint text-primary hover:bg-purple-tint/80 focus:ring-purple-tint/20 disabled:bg-purple-tint/30',
        outline: 'bg-transparent border-2 border-primary/20 text-primary hover:bg-white-tint focus:ring-primary/20',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300',
        success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 disabled:bg-emerald-300 shadow-sm'
    }

    const sizeClasses = {
        small: 'px-3 py-1.5 text-sm',
        medium: 'px-4 py-2 text-base',
        large: 'px-6 py-3 text-lg'
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={clsx(
                baseClasses,
                variantClasses[variant],
                sizeClasses[size],
                disabled && 'cursor-not-allowed opacity-60',
                className
            )}
        >
            {children}
        </button>
    )
}

Button.propTypes = {
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'danger', 'success']),
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    className: PropTypes.string,
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
    type: PropTypes.oneOf(['button', 'submit', 'reset'])
}

export default Button
