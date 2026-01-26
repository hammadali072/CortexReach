import PropTypes from 'prop-types'
import clsx from 'clsx'

const Card = ({ children, className = '', padding = 'default' }) => {
    const paddingClasses = {
        none: '',
        small: 'p-4',
        default: 'p-6',
        large: 'p-8'
    }

    return (
        <div className={clsx(
            'bg-white rounded-lg shadow-sm border border-gray-200',
            paddingClasses[padding],
            className
        )}>
            {children}
        </div>
    )
}

Card.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    padding: PropTypes.oneOf(['none', 'small', 'default', 'large'])
}

export default Card
