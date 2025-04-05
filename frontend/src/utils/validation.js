export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return re.test(password);
};

export const validatePhone = (phone) => {
  // Basic phone number validation
  const re = /^\+?[\d\s-]{10,}$/;
  return re.test(phone);
};

export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

export const validateLength = (value, min, max) => {
  return value.length >= min && value.length <= max;
};

export const validateDate = (date) => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};

export const validateNumber = (value, min, max) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

export const validateFile = (file, maxSize, allowedTypes) => {
  if (!file) return true;
  
  // Check file size (in MB)
  if (file.size > maxSize * 1024 * 1024) {
    return false;
  }
  
  // Check file type
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return false;
  }
  
  return true;
};

export const validateForm = (formData, rules) => {
  const errors = {};
  
  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = formData[field];
    
    for (const rule of fieldRules) {
      const { type, message, params } = rule;
      
      let isValid = true;
      
      switch (type) {
        case 'required':
          isValid = validateRequired(value);
          break;
        case 'email':
          isValid = validateEmail(value);
          break;
        case 'password':
          isValid = validatePassword(value);
          break;
        case 'phone':
          isValid = validatePhone(value);
          break;
        case 'length':
          isValid = validateLength(value, params.min, params.max);
          break;
        case 'date':
          isValid = validateDate(value);
          break;
        case 'number':
          isValid = validateNumber(value, params.min, params.max);
          break;
        case 'file':
          isValid = validateFile(value, params.maxSize, params.allowedTypes);
          break;
        default:
          isValid = true;
      }
      
      if (!isValid) {
        errors[field] = message;
        break;
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const createValidationRules = (fields) => {
  const rules = {};
  
  for (const [field, config] of Object.entries(fields)) {
    rules[field] = [];
    
    if (config.required) {
      rules[field].push({
        type: 'required',
        message: `${field} is required`
      });
    }
    
    if (config.type === 'email') {
      rules[field].push({
        type: 'email',
        message: 'Invalid email format'
      });
    }
    
    if (config.type === 'password') {
      rules[field].push({
        type: 'password',
        message: 'Password must contain at least 8 characters, 1 uppercase, 1 lowercase, and 1 number'
      });
    }
    
    if (config.type === 'phone') {
      rules[field].push({
        type: 'phone',
        message: 'Invalid phone number format'
      });
    }
    
    if (config.minLength || config.maxLength) {
      rules[field].push({
        type: 'length',
        message: `Length must be between ${config.minLength || 0} and ${config.maxLength || '∞'} characters`,
        params: {
          min: config.minLength || 0,
          max: config.maxLength || Infinity
        }
      });
    }
    
    if (config.type === 'date') {
      rules[field].push({
        type: 'date',
        message: 'Invalid date format'
      });
    }
    
    if (config.type === 'number') {
      rules[field].push({
        type: 'number',
        message: `Number must be between ${config.min || 0} and ${config.max || '∞'}`,
        params: {
          min: config.min || 0,
          max: config.max || Infinity
        }
      });
    }
    
    if (config.type === 'file') {
      rules[field].push({
        type: 'file',
        message: `File must be less than ${config.maxSize}MB and of type ${config.allowedTypes.join(', ')}`,
        params: {
          maxSize: config.maxSize || 10,
          allowedTypes: config.allowedTypes || []
        }
      });
    }
  }
  
  return rules;
}; 