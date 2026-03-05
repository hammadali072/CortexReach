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
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-[8px] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'

    const variantClasses = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500 disabled:bg-gray-100',
        outline: 'bg-transparent border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 disabled:bg-green-300'
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
