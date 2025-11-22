import React, { forwardRef } from "react";
import PropTypes from "prop-types";

/**
 * Button component
 * - supports rendered element override via `as` or `href` (link)
 * - accessible handling for disabled links
 * - variants and sizes with inline defaults (easy to override via className/style)
 */

const VARIANTS = {
    primary: {
        background: "#2563eb",
        color: "#fff",
        border: "1px solid transparent",
    },
    secondary: {
        background: "#e5e7eb",
        color: "#111827",
        border: "1px solid #d1d5db",
    },
    ghost: {
        background: "transparent",
        color: "#2563eb",
        border: "1px solid transparent",
    },
    danger: {
        background: "#dc2626",
        color: "#fff",
        border: "1px solid transparent",
    },
};

const SIZES = {
    sm: { padding: "6px 10px", fontSize: "0.875rem" },
    md: { padding: "8px 14px", fontSize: "1rem" },
    lg: { padding: "12px 18px", fontSize: "1.125rem" },
};

const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 6,
    lineHeight: 1,
    userSelect: "none",
    textDecoration: "none",
    transition: "background-color 120ms ease, opacity 120ms ease, transform 120ms ease",
};

/* Button implementation */
const Button = forwardRef(function Button(
    {
        as: As,
        href,
        children,
        variant = "primary",
        size = "md",
        disabled = false,
        className = "",
        style = {},
        type = "button",
        onClick,
        ...rest
    },
    ref
) {
    const element = href ? "a" : As || "button";
    const variantStyle = VARIANTS[variant] || VARIANTS.primary;
    const sizeStyle = SIZES[size] || SIZES.md;

    const computedStyle = {
        ...baseStyle,
        background: variantStyle.background,
        color: variantStyle.color,
        border: variantStyle.border,
        padding: sizeStyle.padding,
        fontSize: sizeStyle.fontSize,
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
    };

    const handleClick = (e) => {
        if (disabled) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        if (typeof onClick === "function") onClick(e);
    };

    // props to spread onto the element
    const elementProps = {
        ref,
        className,
        style: computedStyle,
        onClick: handleClick,
        ...rest,
    };

    if (element === "button") {
        elementProps.type = type;
        elementProps.disabled = disabled;
    } else if (element === "a") {
        elementProps.href = href;
        // Make link accessible when "disabled"
        if (disabled) {
            elementProps["aria-disabled"] = "true";
            elementProps.tabIndex = -1;
        }
    }

    return React.createElement(element, elementProps, children);
});

Button.propTypes = {
    as: PropTypes.elementType,
    href: PropTypes.string,
    children: PropTypes.node,
    variant: PropTypes.oneOf(["primary", "secondary", "ghost", "danger"]),
    size: PropTypes.oneOf(["sm", "md", "lg"]),
    disabled: PropTypes.bool,
    className: PropTypes.string,
    style: PropTypes.object,
    type: PropTypes.oneOf(["button", "submit", "reset"]),
    onClick: PropTypes.func,
};

export default Button;