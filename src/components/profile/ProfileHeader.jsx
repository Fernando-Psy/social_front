import React from "react";
import PropTypes from "prop-types";


const s = {
    container: {
        display: "flex",
        gap: 16,
        alignItems: "flex-start",
        padding: 16,
        borderBottom: "1px solid #e6e6e6",
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: "50%",
        objectFit: "cover",
        backgroundColor: "#f0f0f0",
    },
    main: {
        flex: 1,
        minWidth: 0,
    },
    headerRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
    },
    name: {
        margin: 0,
        fontSize: 20,
        fontWeight: 700,
        lineHeight: 1,
        color: "#111",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
    username: {
        margin: 0,
        fontSize: 14,
        color: "#657786",
    },
    bio: {
        marginTop: 8,
        marginBottom: 8,
        fontSize: 14,
        color: "#14171a",
        whiteSpace: "pre-wrap",
    },
    meta: {
        display: "flex",
        gap: 12,
        color: "#657786",
        fontSize: 13,
        alignItems: "center",
    },
    counts: {
        display: "flex",
        gap: 16,
        marginTop: 10,
        fontSize: 14,
        color: "#14171a",
    },
    countItem: {
        display: "inline-flex",
        gap: 6,
        alignItems: "center",
    },
    button: {
        padding: "8px 12px",
        borderRadius: 6,
        border: "1px solid #e6e6e6",
        background: "#fff",
        cursor: "pointer",
        fontSize: 14,
    },
    primaryButton: {
        background: "#1da1f2",
        color: "#fff",
        border: "1px solid rgba(0,0,0,0.08)",
    },
};

export default function ProfileHeader({
    user = {},
    isCurrentUser = false,
    onFollowToggle,
    onEditProfile,
    isFollowing = false,
    followLoading = false,
}) {
    const {
        id,
        name = "Usuário",
        username = "",
        avatarUrl = "",
        bio = "",
        location = "",
        website = "",
        counts = {},
    } = user;

    const handleFollow = () => {
        if (followLoading) return;
        if (typeof onFollowToggle === "function") onFollowToggle(id);
    };

    const handleEdit = () => {
        if (typeof onEditProfile === "function") onEditProfile();
    };

    return (
        <div style={s.container}>
            <img
                src={avatarUrl || "https://via.placeholder.com/150?text=Avatar"}
                alt={name}
                style={s.avatar}
            />
            <div style={s.main}>
                <div style={s.headerRow}>
                    <div style={{ minWidth: 0 }}>
                        <h1 style={s.name}>{name}</h1>
                        <p style={s.username}>@{username}</p>
                    </div>

                    <div>
                        {isCurrentUser ? (
                            <button
                                type="button"
                                style={{ ...s.button, ...s.primaryButton }}
                                onClick={handleEdit}
                            >
                                Editar Perfil
                            </button>
                        ) : (
                            <button
                                type="button"
                                style={{
                                    ...s.button,
                                    ...(isFollowing ? {} : s.primaryButton),
                                }}
                                onClick={handleFollow}
                                disabled={followLoading}
                            >
                                {followLoading ? "Aguarde..." : isFollowing ? "Seguindo" : "Seguir"}
                            </button>
                        )}
                    </div>
                </div>

                {bio ? <div style={s.bio}>{bio}</div> : null}

                <div style={s.meta}>
                    {location ? <span title="Localização">📍 {location}</span> : null}
                    {website ? (
                        <a
                            href={website.startsWith("http") ? website : `https://${website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#1da1f2", textDecoration: "none", fontSize: 13 }}
                        >
                            🔗 {website.replace(/^https?:\/\//, "")}
                        </a>
                    ) : null}
                </div>

                <div style={s.counts}>
                    <div style={s.countItem}>
                        <strong>{counts.posts ?? 0}</strong>
                        <span style={{ color: "#657786" }}>Publicações</span>
                    </div>
                    <div style={s.countItem}>
                        <strong>{counts.followers ?? 0}</strong>
                        <span style={{ color: "#657786" }}>Seguidores</span>
                    </div>
                    <div style={s.countItem}>
                        <strong>{counts.following ?? 0}</strong>
                        <span style={{ color: "#657786" }}>Seguindo</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

ProfileHeader.propTypes = {
    user: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
        username: PropTypes.string,
        avatarUrl: PropTypes.string,
        bio: PropTypes.string,
        location: PropTypes.string,
        website: PropTypes.string,
        counts: PropTypes.shape({
            posts: PropTypes.number,
            followers: PropTypes.number,
            following: PropTypes.number,
        }),
    }),
    isCurrentUser: PropTypes.bool,
    isFollowing: PropTypes.bool,
    followLoading: PropTypes.bool,
    onFollowToggle: PropTypes.func,
    onEditProfile: PropTypes.func,
};