import React from 'react';
import DOMPurify from 'dompurify';
import PropTypes from 'prop-types';

/**
 * A safe component to render HTML content sanitized via DOMPurify.
 * This centralizes the 'dangerouslySetInnerHTML' usage and suppression.
 * 
 * @param {string} html - The raw HTML string to sanitize and render.
 * @param {string} className - Optional CSS classes for the wrapper div.
 * @param {string} tag - The HTML tag to use for the wrapper (default: 'div').
 */
const SanitizedHTML = ({ html, className, tag: Tag = 'div', ...props }) => {
    if (!html) return null;

    const sanitizedContent = DOMPurify.sanitize(html);

    return (
        <Tag
            className={className}
            {...props}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
    );
};

SanitizedHTML.propTypes = {
    html: PropTypes.string,
    className: PropTypes.string,
    tag: PropTypes.string
};

export default SanitizedHTML;
