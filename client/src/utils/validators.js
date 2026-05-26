// ─── Validators ───────────────────────────────────────────────────────────────

export const validateName = (value) => {
  if (!value || !value.trim()) return 'Full name is required';
  if (value.trim().length < 2) return 'Name must be at least 2 characters';
  if (value.trim().length > 60) return 'Name must not exceed 60 characters';
  if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) return "Name can only contain letters, spaces, hyphens, and apostrophes";
  return '';
};

export const validateEmail = (value) => {
  if (!value || !value.trim()) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value.trim())) return 'Please enter a valid email address';
  return '';
};

export const validatePassword = (value) => {
  if (!value) return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter';
  if (!/\d/.test(value)) return 'Password must contain at least one number';
  return '';
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return '';
};

export const validateLoginPassword = (value) => {
  if (!value) return 'Password is required';
  return '';
};

export const validateQualification = (value) => {
  if (!value || !value.trim()) return 'Qualification is required';
  if (value.trim().length < 2) return 'Qualification must be at least 2 characters';
  if (value.trim().length > 100) return 'Qualification must not exceed 100 characters';
  return '';
};

export const validateExpertise = (value) => {
  if (!value || !value.trim()) return 'Area of expertise is required';
  if (value.trim().length < 2) return 'Expertise must be at least 2 characters';
  if (value.trim().length > 100) return 'Expertise must not exceed 100 characters';
  return '';
};

export const validateBio = (value) => {
  if (value && value.trim().length > 500) return 'Bio cannot exceed 500 characters';
  return '';
};

// ─── Password strength ─────────────────────────────────────────────────────────

export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Weak', color: '#ef4444' };
  if (score <= 4) return { score, label: 'Fair', color: '#f59e0b' };
  if (score === 5) return { score, label: 'Good', color: '#3b82f6' };
  return { score, label: 'Strong', color: '#22c55e' };
};
