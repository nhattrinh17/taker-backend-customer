export function generateSlug(str: string) {
  return str
    .normalize('NFD') // Chuẩn hóa Unicode
    .replace(/[\u0300-\u036f]/g, '') // Loại bỏ các dấu thanh
    .toLowerCase() // Chuyển đổi thành chữ thường
    .replace(/[^a-z0-9 -]/g, '') // Loại bỏ các ký tự đặc biệt, giữ lại dấu gạch ngang và khoảng trắng
    .replace(/\s+/g, '-') // Thay thế khoảng trắng bằng dấu gạch ngang
    .replace(/-+/g, '-') // Loại bỏ các dấu gạch ngang trùng lặp
    .replace(/^-|-$/g, ''); // Loại bỏ dấu gạch ngang ở đầu và cuối chuỗi
}

/**
 * Generate 4 digit OTP
 * @returns 4 digit number
 */
export function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000);
}

/**
 * Generate 6 digit password
 * @returns 6 digit number
 */
export function generatePassword() {
  return Math.floor(1000 + Math.random() * 900000);
}

/**
 * Make phone number with country code
 * @param phone
 * @returns phone number with country code
 */
export function makePhoneNumber(phone: string) {
  if (phone.startsWith('0')) {
    return `84${phone.slice(1)}`;
  }
  return phone;
}

/**
 * Make otp to text
 * @param otp
 * @returns text of otp
 */
export function otpToText(otp: number): string {
  const otpString = otp.toString();
  let result = '';
  for (let i = 0; i < otpString.length; i++) {
    result += otpString[i];
    if (i !== otpString.length - 1) {
      result += '. ';
    }
  }
  return result;
}

/**
 * Function to verify phone number in Vietnam
 * @param phone
 * @returns boolean
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /((09|03|07|08|05)+([0-9]{8})\b)/g;
  return phoneRegex.test(phone);
}
