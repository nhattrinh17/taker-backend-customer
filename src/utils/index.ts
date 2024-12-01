export * from './helper';

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

export function isValidPhoneNumber(phoneNumber) {
  // Loại bỏ các ký tự không phải số từ chuỗi số điện thoại
  const cleanedPhoneNumber = phoneNumber.replace(/\D/g, '');

  // Kiểm tra xem số điện thoại sau khi làm sạch có độ dài hợp lệ không
  const phoneNumberLength = cleanedPhoneNumber.length;
  if (phoneNumberLength < 10 || phoneNumberLength > 11) {
    return false;
  }

  // Kiểm tra xem số điện thoại có bắt đầu bằng 0 hoặc 84 không (đối với số điện thoại Việt Nam)
  if (!/^0|^84/.test(cleanedPhoneNumber)) {
    return false;
  }

  // Nếu số điện thoại có độ dài là 11 và bắt đầu bằng 0, kiểm tra xem có phải là số điện thoại di động không
  if (phoneNumberLength === 11 && cleanedPhoneNumber.startsWith('0')) {
    // Kiểm tra xem số điện thoại có thuộc các nhà mạng di động của Việt Nam không
    const mobileOperators = ['30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '56', '57', '58', '59', '70', '79', '77', '76', '78', '89', '88', '86', '85', '84', '83'];
    const firstTwoDigits = cleanedPhoneNumber.substring(1, 3);
    if (!mobileOperators.includes(firstTwoDigits)) {
      return false;
    }
  }

  // Nếu vượt qua tất cả các kiểm tra, số điện thoại được coi là hợp lệ
  return true;
}
