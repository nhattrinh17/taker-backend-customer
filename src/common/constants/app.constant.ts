export interface ICustomer {
  sub: string;
}

export interface IShoemaker {
  sub: string;
}

export interface ISearchNearBy {
  latitude: string;
  longitude: string;
  keyword?: string;
}

export interface ISearchDetail {
  latitude: string;
  longitude: string;
}

export const AppType = {
  customers: 'customers',
  shoemakers: 'shoemakers',
  admins: 'admins',
};

export const RoomNameAdmin = 'socket-room-admins';

export const LATITUDE_PATTERN = /^(\+|-)?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,6})?))$/;
export const LONGITUDE_PATTERN = /^(\+|-)?(?:180(?:(?:\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,6})?))$/;

export const DEFAULT_MESSAGES = {
  SUCCESS: 'SUCCESS',
};

export interface RequestTripData {
  userId: string;
  tripId: string;
  location: { lat: number; lng: number };
  statusSchedule?: string;
}

export interface Location {
  lat: number;
  lng: number;
}

export const RESOLUTION = 9;

export interface IPlaceDetail {
  title: string;
  address: {
    label: string;
  };
  position: {
    lat: number;
    lng: number;
  };
  distance: number;
}

export interface IPlaceGeoDetail {
  title: string;
  address: {
    label: string;
    countryCode: string;
    countryName: string;
    state: string;
    county: string;
    city: string;
    district: string;
    street: string;
    postalCode: string;
    houseNumber: string;
  };
  distance: number;
}

export const QUEUE_NAMES = {
  CUSTOMERS_TRIP: 'CUSTOMERS_TRIP',
  UPDATE_LOCATION: 'UPDATE_LOCATION',
  UPDATE_STATUS: 'UPDATE_STATUS',
  JOIN_ROOM: 'JOIN_ROOM',
  LEAVE_ROOM: 'LEAVE_ROOM',
  CRONS: 'CRONS',
  NOTIFICATION: 'NOTIFICATION',
  WORK_STATUS: 'WORK_STATUS',
};

export const PAYMENT_PREFIX = {
  TRANSACTION: 'TRANSACTION::',
};

export interface IReturnUrl {
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_BankTranNo: string;
  vnp_CardType: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
  vnp_SecureHashType?: string;
}

export const errorCodes = {
  '00': 'Giao dịch thành công',
  '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ, cần kiểm tra lại thông tin giao dịch.',
  '09': 'Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
  '10': 'Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
  '11': 'Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
  '12': 'Thẻ/Tài khoản của khách hàng bị khóa.',
  '13': 'Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.',
  '24': 'Khách hàng hủy giao dịch',
  '51': 'Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
  '65': 'Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
  '75': 'Ngân hàng thanh toán đang bảo trì.',
  '79': 'KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch',
  '99': 'Lỗi không xác định',
};

export const SOCKET_PREFIX = 'SOCKET::';
export interface INotificationPayload {
  token: string;
  title: string;
  body: string;
  data?: { [key: string]: string };
  sound?: string;
}

export type IPeriod = 'week' | 'month' | 'today' | 'custom';
export const OPTIONS = {
  STRINGEE_NUMBER: 'STRINGEE_NUMBER',
};

export const TypeFilterTripAdmin = {
  complete: 'complete',
  shoemakerCannel: 'shoemaker_cancel',
  findShoemaker: 'find_shoemaker',
  customerCancel: 'customer_cancel',
};

export const TypeUpdateBonusPointOrWallet = {
  up: 0,
  down: 1,
};

export const StatusScheduleShoemaker = {
  findShoemaker: 'find_shoemaker', // Chỉ tìm kiếm shoemaker, không join room
  sendNotification: 'send_notification', // Gửi thông báo trước 15p và join room
};

export const TypePressBlog = {
  NAVIGATION: 'NAVIGATION',
  REDIRECT_WEB: 'REDIRECT_WEB',
};

export const NOTIFICATIONS_SCREEN_CUSTOMER = {
  REQUEST_TRIP: 'REQUEST_TRIP',
  HOME: 'HOME',
  CUSTOMER_CARE: 'CUSTOMER_CARE',
  WALLET: 'WALLET',
  DETAIL_NOTIFICATION: 'DETAIL_NOTIFICATION',
};

export const NOTIFICATIONS_SCREEN_SHOEMAKER = {
  HOME: 'HOME',
  WALLET: 'WALLET',
  DETAIL_NOTIFICATION: 'DETAIL_NOTIFICATION',
  ACTIVITY: 'ACTIVITY',
};
