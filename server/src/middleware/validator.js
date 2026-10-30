import { validatePasswordStrength } from '../utils/passwords.js';

export function validateRegistration(req, res, next) {
  const { name, email, password, role } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Name is required and must be at least 2 characters long.'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'A valid email address is required.'
    });
  }

  const passwordCheck = validatePasswordStrength(password);
  if (!passwordCheck.valid) {
    return res.status(400).json({
      success: false,
      message: passwordCheck.message
    });
  }

  if (role && !['user', 'admin'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Role must be either 'user' or 'admin'."
    });
  }

  next();
}

export function validateLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required.'
    });
  }

  next();
}

