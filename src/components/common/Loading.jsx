import React from "react";

export default function Loading({
    size = 40,
    text = "Carregando...",
    inline = false,
    overlay = false,
    className = "",
}) {
    const spinner = (
        <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            className={className}
            style={{
                display: inline ? "inline-flex" : "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                color: "currentColor",
            }}
        >
            <svg
                width={size}
                height={size}
                viewBox="0 0 50 50"
                aria-hidden="true"
                focusable="false"
            >
                <circle
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeOpacity="0.25"
                />
                <path
                    fill="currentColor"
                    d="M43.935,25.145c0-10.318-8.364-18.682-18.682-18.682"
                >
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 25 25"
                        to="360 25 25"
                        dur="1s"
                        repeatCount="indefinite"
                    />
                </path>
            </svg>

            {text ? (
                <span style={{ fontSize: Math.max(12, size * 0.3), lineHeight: 1 }}>
                    {text}
                </span>
            ) : null}
        </div>
    );

    if (overlay) {
        return (
            <div
                aria-hidden={false}
                style={{
                    position: "fixed",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255,255,255,0.7)",
                    zIndex: 9999,
                }}
            >
                {spinner}
            </div>
        );
    }

    return spinner;
}