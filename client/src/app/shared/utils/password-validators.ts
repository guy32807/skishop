import { Validators } from '@angular/forms';

export const passwordValidators = [
  Validators.required,
  Validators.minLength(8),
  // Regex: 1 Upper, 1 Lower, 1 Number, 1 Special Char
  Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
];