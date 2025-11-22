import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

/**
 * ProfileEdit
 *
 * Props:
 * - initialProfile: { name, email, bio, location, avatarUrl }
 * - onSave(profileData): called with FormData if avatar is a File, otherwise plain object
 * - onCancel()
 *
 * Usage:
 * <ProfileEdit initialProfile={profile} onSave={handleSave} onCancel={handleCancel} />
 */
export default function ProfileEdit({ initialProfile = {}, onSave, onCancel }) {
    const [name, setName] = useState(initialProfile.name || "");
    const [email, setEmail] = useState(initialProfile.email || "");
    const [bio, setBio] = useState(initialProfile.bio || "");
    const [location, setLocation] = useState(initialProfile.location || "");
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(initialProfile.avatarUrl || "");
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // create preview for selected file
        if (avatarFile) {
            const url = URL.createObjectURL(avatarFile);
            setAvatarPreview(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setAvatarPreview(initialProfile.avatarUrl || "");
        }
    }, [avatarFile, initialProfile.avatarUrl]);

    function validate() {
        const e = {};
        if (!name.trim()) e.name = "Nome é obrigatório.";
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "E-mail inválido.";
        return e;
    }

    async function handleSubmit(ev) {
        ev.preventDefault();
        const e = validate();
        setErrors(e);
        if (Object.keys(e).length) return;

        setSaving(true);
        try {
            // If avatarFile present, prepare FormData (common for file upload)
            if (avatarFile) {
                const fd = new FormData();
                fd.append("name", name);
                fd.append("email", email);
                fd.append("bio", bio);
                fd.append("location", location);
                fd.append("avatar", avatarFile);
                await Promise.resolve(onSave ? onSave(fd) : Promise.resolve());
            } else {
                const payload = { name, email, bio, location, avatarUrl: initialProfile.avatarUrl || "" };
                await Promise.resolve(onSave ? onSave(payload) : Promise.resolve());
            }
        } catch (err) {
            // simple error handling: attach general message
            setErrors((prev) => ({ ...prev, submit: err.message || "Erro ao salvar." }));
        } finally {
            setSaving(false);
        }
    }

    function handleAvatarChange(ev) {
        const file = ev.target.files && ev.target.files[0];
        if (file) setAvatarFile(file);
    }

    const isChanged =
        name !== (initialProfile.name || "") ||
        email !== (initialProfile.email || "") ||
        bio !== (initialProfile.bio || "") ||
        location !== (initialProfile.location || "") ||
        !!avatarFile;

    return (
        <form onSubmit={handleSubmit} className="profile-edit" noValidate>
            <div className="profile-edit__avatar">
                <label htmlFor="avatar-input" className="avatar-label">
                    {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar preview" className="avatar-img" />
                    ) : (
                        <div className="avatar-placeholder">Sem avatar</div>
                    )}
                </label>
                <input
                    id="avatar-input"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: "none" }}
                />
            </div>

            <div className="profile-edit__field">
                <label htmlFor="name">Nome</label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                {errors.name && <div className="error">{errors.name}</div>}
            </div>

            <div className="profile-edit__field">
                <label htmlFor="email">E-mail</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <div className="error">{errors.email}</div>}
            </div>

            <div className="profile-edit__field">
                <label htmlFor="location">Localização</label>
                <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                />
            </div>

            <div className="profile-edit__field">
                <label htmlFor="bio">Bio</label>
                <textarea
                    id="bio"
                    rows="4"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                />
            </div>

            {errors.submit && <div className="error">{errors.submit}</div>}

            <div className="profile-edit__actions">
                <button type="button" onClick={onCancel} disabled={saving}>
                    Cancelar
                </button>
                <button type="submit" disabled={saving || !isChanged}>
                    {saving ? "Salvando..." : "Salvar"}
                </button>
            </div>
        </form>
    );
}

ProfileEdit.propTypes = {
    initialProfile: PropTypes.shape({
        name: PropTypes.string,
        email: PropTypes.string,
        bio: PropTypes.string,
        location: PropTypes.string,
        avatarUrl: PropTypes.string,
    }),
    onSave: PropTypes.func,
    onCancel: PropTypes.func,
};