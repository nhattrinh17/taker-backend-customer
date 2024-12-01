import { IReturnUrl } from '@common/constants/app.constant';
import crypto from 'crypto';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import qs from 'qs';

// console.log('🚀 ~ crypto:', crypto);
// console.log('🚀 ~ dayjs:', dayjs);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Ho_Chi_Minh');

interface PropType {
  amount: number;
  ip: string;
  orderId: string;
  orderInfo?: string;
}

export const createPaymentUrl = ({
  amount,
  ip,
  orderId,
  orderInfo,
}: PropType) => {
  const createDate = dayjs.tz().format('YYYYMMDDHHmmss');
  const expireDate = dayjs.tz().add(10, 'minute').format('YYYYMMDDHHmmss');

  const tmnCode = process.env.vnp_TmnCode;
  const secretKey = process.env.vnp_HashSecret;
  let vnpUrl = process.env.vnp_Url;
  const returnUrl = process.env.vnp_ReturnUrl;
  const locale = 'vn';

  const currCode = 'VND';
  let vnp_Params = {};

  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = tmnCode;
  vnp_Params['vnp_Locale'] = locale;
  vnp_Params['vnp_CurrCode'] = currCode;
  vnp_Params['vnp_TxnRef'] = orderId;
  vnp_Params['vnp_OrderInfo'] = orderInfo;
  vnp_Params['vnp_OrderType'] = 'other';
  vnp_Params['vnp_Amount'] = amount * 100;
  vnp_Params['vnp_ReturnUrl'] = returnUrl;
  vnp_Params['vnp_IpAddr'] = ip;
  vnp_Params['vnp_CreateDate'] = createDate;
  vnp_Params['vnp_ExpireDate'] = expireDate;

  vnp_Params = sortObject(vnp_Params);

  const signData = qs.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  vnp_Params['vnp_SecureHash'] = signed;
  vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

  return vnpUrl;
};

export const validateSecureHash = (query: IReturnUrl) => {
  const secureHash = query.vnp_SecureHash;
  const copyQuery = { ...query };
  delete copyQuery.vnp_SecureHash;
  delete copyQuery.vnp_SecureHashType;

  const secretKey = process.env.vnp_HashSecret;
  const vnp_Params = sortObject(copyQuery);

  const signData = qs.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  return secureHash === signed;
};

export const refund = (orderId: string, amount: number, ip?: string) => {
  const tmnCode = process.env.vnp_TmnCode;
  const secretKey = process.env.vnp_HashSecret;

  const vnp_TxnRef = orderId;
  const vnp_TransactionDate = dayjs.tz().format('YYYYMMDDHHmmss');
  const vnp_Amount = amount * 100;
  const vnp_TransactionType = '02';
  const vnp_CreateBy = 'Taker';

  const vnp_RequestId = dayjs.tz().valueOf().toString();
  const vnp_Version = '2.1.0';
  const vnp_Command = 'refund';
  const vnp_OrderInfo = 'Hoan tien GD ma:' + vnp_TxnRef;

  const vnp_IpAddr = ip || '18.138.226.243';

  const vnp_CreateDate = dayjs.tz().format('YYYYMMDDHHmmss');

  const vnp_TransactionNo = '0';

  const data =
    vnp_RequestId +
    '|' +
    vnp_Version +
    '|' +
    vnp_Command +
    '|' +
    tmnCode +
    '|' +
    vnp_TransactionType +
    '|' +
    vnp_TxnRef +
    '|' +
    vnp_Amount +
    '|' +
    vnp_TransactionNo +
    '|' +
    vnp_TransactionDate +
    '|' +
    vnp_CreateBy +
    '|' +
    vnp_CreateDate +
    '|' +
    vnp_IpAddr +
    '|' +
    vnp_OrderInfo;

  const hmac = crypto.createHmac('sha512', secretKey);
  const vnp_SecureHash = hmac.update(Buffer.from(data, 'utf-8')).digest('hex');

  const dataObj = {
    vnp_RequestId: vnp_RequestId,
    vnp_Version: vnp_Version,
    vnp_Command: vnp_Command,
    vnp_TmnCode: tmnCode,
    vnp_TransactionType: vnp_TransactionType,
    vnp_TxnRef: vnp_TxnRef,
    vnp_Amount: vnp_Amount,
    vnp_TransactionNo: vnp_TransactionNo,
    vnp_CreateBy: vnp_CreateBy,
    vnp_OrderInfo: vnp_OrderInfo,
    vnp_TransactionDate: vnp_TransactionDate,
    vnp_CreateDate: vnp_CreateDate,
    vnp_IpAddr: vnp_IpAddr,
    vnp_SecureHash: vnp_SecureHash,
  };

  return dataObj;
};

const sortObject = (obj) => {
  const sorted = {};
  const str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
  }
  return sorted;
};
