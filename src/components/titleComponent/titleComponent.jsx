import PropTypes from 'prop-types'
import clsx from 'clsx'

const getHeadingClasses = (type) => {
    switch (type) {
        case 'h1':
            return '2xl:text-7xl lg:text-[50px] md:text-[40px] text-3xl leading-normal font-bold'
        case 'h2':
            return '2xl:text-[44px] lg:text-4xl md:text-3xl text-2xl leading-normal font-bold'
        case 'h3':
            return '2xl:text-4xl xl:text-3xl md:text-2xl text-xl leading-normal font-bold'
        case 'h4':
            return 'lg:text-2xl md:text-xl text-lg leading-normal font-bold'
        case 'h5':
            return 'lg:text-xl md:text-lg text-base leading-normal font-medium'
        case 'h6':
            return 'lg:text-lg text-base leading-normal font-medium'
        default:
            return '2xl:text-[44px] lg:text-4xl md:text-3xl text-2xl leading-normal font-bold'
    }
}

const getParagraphClasses = (size) => {
    switch (size) {
        case 'extra-small':
            return 'text-xs font-normal'
        case 'extra-small-medium':
            return 'text-xs font-medium'
        case 'extra-small-semibold':
            return 'text-xs font-semibold'
        case 'extra-small-bold':
            return 'text-xs font-bold'
        case 'small':
            return 'text-sm font-normal'
        case 'small-medium':
            return 'text-sm font-medium'
        case 'small-semibold':
            return 'text-sm font-semibold'
        case 'small-bold':
            return 'text-sm font-bold'
        case 'base':
            return 'text-base font-normal'
        case 'base-medium':
            return 'text-base font-medium'
        case 'base-semibold':
            return 'text-base font-semibold'
        case 'base-bold':
            return 'text-base font-bold'
        case 'large':
            return 'lg:text-lg text-base font-normal'
        case 'large-medium':
            return 'lg:text-lg text-base font-medium'
        case 'large-semibold':
            return 'lg:text-lg text-base font-semibold'
        case 'large-bold':
            return 'lg:text-lg text-base font-bold'
        case 'extra-large':
            return 'lg:text-xl md:text-lg text-base font-normal '
        case 'extra-large-medium':
            return 'lg:text-xl md:text-lg text-base font-medium '
        case 'extra-large-semibold':
            return 'lg:text-xl md:text-lg text-base font-semibold '
        case 'extra-large-bold':
            return 'lg:text-xl md:text-lg text-base font-bold '
        default:
            return 'text-base'
    }
}

const TitleComponent = ({ type = 'p', size = 'base', children, className = '' }) => {
    const finalClass = clsx(
        className,
        type !== 'p' ? getHeadingClasses(type) : getParagraphClasses(size)
    )

    const Tag = type

    return <Tag className={finalClass}>{children}</Tag>
}

TitleComponent.propTypes = {
    type: PropTypes.oneOf(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p']),
    size: PropTypes.oneOf([
        'extra-small', 'extra-small-medium', 'extra-small-semibold', 'extra-small-bold',
        'small', 'small-medium', 'small-semibold', 'small-bold',
        'base', 'base-medium', 'base-semibold', 'base-bold',
        'large', 'large-medium', 'large-semibold', 'large-bold',
        'extra-large', 'extra-large-medium', 'extra-large-semibold', 'extra-large-bold'
    ]),
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
}

export default TitleComponent
