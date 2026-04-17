import PropTypes from 'prop-types'
import clsx from 'clsx'
import { useEffect } from 'react'

const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!isOpen) return null

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-xl',
        lg: 'max-w-3xl',
        xl: 'max-w-5xl'
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={clsx(
                "relative bg-white rounded-lg shadow-2xl border border-slate-100 w-full overflow-hidden transition-all animate-in zoom-in-95 duration-200",
                sizeClasses[size]
            )}>
                {/* Header */}
                <div className="flex items-center justify-between px-10 py-8 border-b border-slate-50">
                    <h3 className="text-2xl font-black text-slate-900 font-idGrotesk">{title}</h3>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all"
                    >
                        <i className="fas fa-times text-xl" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-10 py-8 overflow-y-auto max-h-[70vh]">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="px-10 py-8 border-t border-slate-50 bg-slate-50/50 flex justify-end gap-4">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    )
}

Modal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    footer: PropTypes.node,
    size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl'])
}

export default Modal
