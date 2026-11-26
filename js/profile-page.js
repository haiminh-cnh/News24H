// PROFILE PAGE: hiển thị hồ sơ, xem trước ảnh đại diện và phát sự kiện để script.js lưu Firebase.

const nameInput = document.getElementById("profile-name-input");
const phoneInput = document.getElementById("profile-phone-input");
const message = document.getElementById("profile-message");
const form = document.getElementById("profile-form");
const avatar = document.getElementById("profile-avatar");
const avatarFileInput = document.getElementById("profile-avatar-file");
const avatarUploadButton = document.getElementById("profile-avatar-upload-btn");
const avatarCancelButton = document.getElementById("profile-avatar-cancel-btn");
const avatarMessage = document.getElementById("profile-avatar-message");

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];
let selectedAvatarFile = null;
let previewObjectUrl = "";
let currentAvatarUrl = "";
let currentInitial = "N";

function drawAvatar(source = currentAvatarUrl) {
  if (!avatar) return;
  avatar.replaceChildren();
  if (source) {
    const image = document.createElement("img");
    image.src = source;
    image.alt = "Ảnh đại diện";
    image.onload = () => { image.dataset.loaded = "true"; };
    image.onerror = () => {
      avatar.replaceChildren();
      avatar.textContent = currentInitial;
    };
    avatar.append(image);
  } else {
    avatar.textContent = currentInitial;
  }
}

export function populateProfile(user, profile = {}) {
  if (nameInput) nameInput.value = profile.username || user.displayName || "";
  if (phoneInput) phoneInput.value = profile.phone || "";
  const email = document.getElementById("profile-email-value");
  if (email) email.value = user.email || "Chưa cung cấp";
  const role = document.getElementById("profile-role-value");
  if (role)
    role.textContent = profile.role === "admin" ? "Quản trị viên" : "Độc giả";

  currentInitial = (profile.username || user.displayName || user.email || "N")
    .trim()
    .charAt(0)
    .toUpperCase() || "N";
  currentAvatarUrl = profile.photoURL || user.photoURL || "";
  if (!selectedAvatarFile) drawAvatar(currentAvatarUrl);

  const displayName = document.getElementById("profile-display-name");
  if (displayName)
    displayName.textContent =
      profile.username || user.displayName || "Tài khoản NEWS 24H";
  const summaryEmail = document.getElementById("profile-summary-email");
  if (summaryEmail) summaryEmail.textContent = user.email || "";
  const roleInput = document.getElementById("profile-role-readonly");
  if (roleInput)
    roleInput.value = profile.role === "admin" ? "Quản trị viên" : "Độc giả";
}

export function showProfileMessage(text, type = "success") {
  if (!message) return;
  message.textContent = text;
  message.className = `profile-message ${type}`;
}

export function showAvatarMessage(text, type = "success") {
  if (!avatarMessage) return;
  avatarMessage.textContent = text;
  avatarMessage.className = `profile-avatar-message ${type}`;
}

export function getProfileFormData() {
  return {
    username: nameInput?.value.trim() || "",
    phone: phoneInput?.value.trim() || "",
  };
}

export function getSelectedAvatarFile() {
  return selectedAvatarFile;
}

export function resetAvatarSelection() {
  selectedAvatarFile = null;
  if (avatarFileInput) avatarFileInput.value = "";
  if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
  previewObjectUrl = "";
  if (avatarUploadButton) avatarUploadButton.disabled = true;
  if (avatarCancelButton) avatarCancelButton.hidden = true;
  drawAvatar(currentAvatarUrl);
}

avatarFileInput?.addEventListener("change", () => {
  const file = avatarFileInput.files?.[0];
  if (!file) return;

  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    resetAvatarSelection();
    showAvatarMessage("Vui lòng chọn ảnh JPG, PNG hoặc WEBP.", "error");
    return;
  }
  if (file.size > MAX_AVATAR_SIZE) {
    resetAvatarSelection();
    showAvatarMessage("Ảnh vượt quá 5 MB. Vui lòng chọn ảnh nhỏ hơn.", "error");
    return;
  }

  if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
  selectedAvatarFile = file;
  previewObjectUrl = URL.createObjectURL(file);
  drawAvatar(previewObjectUrl);
  if (avatarUploadButton) avatarUploadButton.disabled = false;
  if (avatarCancelButton) avatarCancelButton.hidden = false;
  showAvatarMessage(`Đã chọn ${file.name}. Nhấn “Cập nhật ảnh” để lưu.`, "success");
});

avatarCancelButton?.addEventListener("click", () => {
  resetAvatarSelection();
  showAvatarMessage("Đã hủy thay đổi ảnh đại diện.", "success");
});

avatarUploadButton?.addEventListener("click", () => {
  if (!selectedAvatarFile) {
    showAvatarMessage("Hãy chọn ảnh trước khi cập nhật.", "error");
    return;
  }
  document.dispatchEvent(
    new CustomEvent("news24h:change-avatar", { detail: { file: selectedAvatarFile } }),
  );
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  document.dispatchEvent(new CustomEvent("news24h:save-profile"));
});
