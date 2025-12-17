import axios, { AxiosError } from 'axios';
import { hmacSHA256Hex } from '../utils/hmac';
import { vnYYMMDD } from '../utils/zalopayTime';

interface CreateOrderParams {
  orderId: string; // Internal order ID
  amount: number; // Amount in VND
  description: string;
  appUser: string; // User identifier (can be phone, email, or user ID)
  embedData?: Record<string, any>;
  items?: Array<Record<string, any>>;
}

interface ZaloPayCreateOrderResponse {
  return_code: number;
  return_message: string;
  sub_return_code?: number;
  sub_return_message?: string;
  order_url?: string;
  zp_trans_token?: string;
  order_token?: string;
}

interface ZaloPayResponse {
  return_code?: number;
  return_message?: string;
  sub_return_code?: number;
  sub_return_message?: string;
  [key: string]: any;
}

interface ZaloPayCallbackData {
  app_id: number;
  app_trans_id: string;
  app_user: string;
  amount: number;
  app_time: number;
  embed_data: string;
  item: string;
  zp_trans_id: number;
  server_time: number;
  channel: number;
  merchant_user_id?: string;
}

/**
 * Create ZaloPay order
 * Returns order_url to redirect user for payment
 */
export async function createZaloPayOrder(params: CreateOrderParams): Promise<{
  body: any;
  response: ZaloPayCreateOrderResponse;
  app_trans_id: string;
}> {
  const app_id = Number(process.env.ZP_APP_ID);
  const key1 = process.env.ZP_KEY1;
  const callback_url = process.env.ZP_CALLBACK_URL;

  if (!app_id || !key1 || !callback_url) {
    const missing: string[] = [];
    if (!app_id) missing.push('ZP_APP_ID');
    if (!key1) missing.push('ZP_KEY1');
    if (!callback_url) missing.push('ZP_CALLBACK_URL');
    throw new Error(`ZaloPay configuration missing: ${missing.join(', ')}`);
  }
  
  // Validate app_id is a valid number
  if (isNaN(app_id) || app_id <= 0) {
    throw new Error(`Invalid ZP_APP_ID: ${process.env.ZP_APP_ID}. Must be a positive number.`);
  }

  const app_time = Date.now();
  
  // ZaloPay app_trans_id format: yymmdd_<orderId>
  // orderId should be short (max 40 chars total), use order number or truncated UUID
  // If orderId is UUID, use last 8 chars, otherwise use as is
  let orderIdShort = params.orderId;
  if (orderIdShort.length > 32) {
    // If UUID, use last 8 chars
    orderIdShort = orderIdShort.substring(orderIdShort.length - 8);
  }
  // Remove any special characters, keep only alphanumeric
  orderIdShort = orderIdShort.replace(/[^a-zA-Z0-9]/g, '');
  
  let app_trans_id = `${vnYYMMDD()}_${orderIdShort}`;
  
  // ZaloPay requires app_trans_id max 40 chars
  if (app_trans_id.length > 40) {
    const datePrefix = vnYYMMDD();
    const maxOrderIdLength = 40 - datePrefix.length - 1; // -1 for underscore
    orderIdShort = orderIdShort.substring(0, maxOrderIdLength);
    app_trans_id = `${datePrefix}_${orderIdShort}`;
    console.warn('[ZaloPay] app_trans_id truncated to:', app_trans_id);
  }

  // Embed data includes redirect URL for after payment
  const embed_data = JSON.stringify({
    redirecturl: process.env.ZP_REDIRECT_URL || `${process.env.WEBSITE_ORIGIN || 'http://localhost:3000'}/checkout/result`,
    ...(params.embedData || {}),
  });

  const item = JSON.stringify(params.items || []);

  // MAC calculation: app_id|app_trans_id|app_user|amount|app_time|embed_data|item
  const macInput = [
    app_id,
    app_trans_id,
    params.appUser,
    params.amount,
    app_time,
    embed_data,
    item,
  ].join('|');

  const mac = hmacSHA256Hex(key1, macInput);

  // Ensure amount is integer (ZaloPay requires integer VND)
  const amountInt = Math.round(params.amount);
  
  // Validate app_user length (ZaloPay has limit, use phone or email if available, otherwise truncate UUID)
  let app_user = params.appUser;
  if (app_user.length > 50) {
    // If too long, use first 50 chars or extract phone/email
    app_user = app_user.substring(0, 50);
  }

  const body = {
    app_id,
    app_user: app_user,
    app_trans_id,
    app_time,
    amount: amountInt,
    description: params.description,
    embed_data,
    item,
    callback_url,
    mac,
  };

  // Log request body for debugging (without sensitive data)
  console.log('[ZaloPay] Creating order request:', {
    app_id,
    app_user,
    app_trans_id,
    app_time,
    amount: amountInt,
    description: params.description,
    callback_url,
    mac: mac.substring(0, 20) + '...',
    embed_data,
    item,
    mac_input: macInput.substring(0, 100) + '...',
  });

  const base = (process.env.ZP_API_BASE || 'https://sb-openapi.zalopay.vn/v2').replace(/\/+$/, '');
  const path = process.env.ZP_ORDER_CREATE_PATH || '/create';

  try {
    const { data } = await axios.post<ZaloPayCreateOrderResponse>(
      `${base}${path}`,
      body,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      }
    );

    return { body, response: data, app_trans_id };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ZaloPayCreateOrderResponse>;
      console.error('[ZaloPay] Create order error:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message,
      });
      throw new Error(`ZaloPay API error: ${axiosError.response?.data?.return_message || axiosError.message}`);
    }
    throw error;
  }
}

/**
 * Verify callback MAC from ZaloPay
 * Uses CALLBACK_KEY (key2) for IPN verification
 */
export function verifyCallbackMac(data: string, mac: string): boolean {
  const callbackKey = process.env.ZP_CALLBACK_KEY;
  if (!callbackKey) {
    console.error('[ZaloPay] CALLBACK_KEY not configured');
    return false;
  }
  const expected = hmacSHA256Hex(callbackKey, data);
  return expected === mac;
}

/**
 * Query ZaloPay order status
 * Useful for retry/backfill if callback was missed
 */
export async function queryZaloPayOrder(app_trans_id: string): Promise<any> {
  const app_id = Number(process.env.ZP_APP_ID);
  const key1 = process.env.ZP_KEY1;

  if (!app_id || !key1) {
    throw new Error('ZaloPay configuration missing: ZP_APP_ID or ZP_KEY1');
  }

  const time = Date.now();
  // ZaloPay query MAC format: app_id|app_trans_id|time (all as strings)
  const macInput = [String(app_id), String(app_trans_id), String(time)].join('|');
  const mac = hmacSHA256Hex(key1, macInput);

  const base = (process.env.ZP_API_BASE || 'https://sb-openapi.zalopay.vn/v2').replace(/\/+$/, '');
  const path = process.env.ZP_ORDER_QUERY_PATH || '/query';

  const requestBody = { app_id, app_trans_id, time, mac };

  // Log request for debugging
  console.log('[ZaloPay] Query order request:', {
    app_id,
    app_trans_id,
    time,
    mac: mac.substring(0, 20) + '...',
    mac_input: macInput,
    url: `${base}${path}`,
  });

  try {
    const { data } = await axios.post(
      `${base}${path}`,
      requestBody,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      }
    );

    console.log('[ZaloPay] Query order response:', {
      return_code: data.return_code,
      return_message: data.return_message,
      sub_return_code: data.sub_return_code,
      sub_return_message: data.sub_return_message,
    });

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error('[ZaloPay] Query order error:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message,
        request_body: requestBody,
      });
      throw new Error(`ZaloPay query error: ${axiosError.message}`);
    }
    throw error;
  }
}

/**
 * Refund ZaloPay transaction
 * @param zp_trans_id ZaloPay transaction ID (from callback)
 * @param amount Refund amount in VND (must be <= original amount)
 * @param description Refund description
 * @returns Refund result with m_refund_id
 */
export async function refundZaloPayTransaction(
  zp_trans_id: number | string,
  amount: number,
  description: string = 'Hoàn tiền đơn hàng'
): Promise<any> {
  const app_id = Number(process.env.ZP_APP_ID);
  const key1 = process.env.ZP_KEY1;

  if (!app_id || !key1) {
    throw new Error('ZaloPay configuration missing: ZP_APP_ID or ZP_KEY1');
  }

  const timestamp = Date.now();
  const m_refund_id = `REFUND_${timestamp}_${Math.random().toString(36).substring(2, 9)}`;
  
  // MAC format: app_id|zp_trans_id|amount|description|timestamp
  const macInput = [
    String(app_id),
    String(zp_trans_id),
    String(Math.round(amount)),
    description,
    String(timestamp),
  ].join('|');
  
  const mac = hmacSHA256Hex(key1, macInput);

  const base = (process.env.ZP_API_BASE || 'https://sb-openapi.zalopay.vn/v2').replace(/\/+$/, '');
  const path = process.env.ZP_REFUND_PATH || '/refund';

  const requestBody = {
    app_id,
    zp_trans_id: String(zp_trans_id),
    amount: Math.round(amount),
    description,
    timestamp,
    m_refund_id,
    mac,
  };

  console.log('[ZaloPay] Refund request:', {
    app_id,
    zp_trans_id,
    amount: Math.round(amount),
    m_refund_id,
    mac: mac.substring(0, 20) + '...',
    mac_input: macInput,
  });

  try {
    const { data } = await axios.post(
      `${base}${path}`,
      requestBody,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      }
    );

    console.log('[ZaloPay] Refund response:', {
      return_code: data.return_code,
      return_message: data.return_message,
      sub_return_code: data.sub_return_code,
      sub_return_message: data.sub_return_message,
      m_refund_id: data.m_refund_id,
    });

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ZaloPayResponse>;
      console.error('[ZaloPay] Refund error:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message,
      });
      const errorData = axiosError.response?.data;
      throw new Error(`ZaloPay refund error: ${errorData?.return_message || axiosError.message}`);
    }
    throw error;
  }
}

/**
 * Query ZaloPay refund status
 * @param m_refund_id Refund ID from refund response
 * @returns Refund status
 */
export async function queryZaloPayRefund(m_refund_id: string): Promise<any> {
  const app_id = Number(process.env.ZP_APP_ID);
  const key1 = process.env.ZP_KEY1;

  if (!app_id || !key1) {
    throw new Error('ZaloPay configuration missing: ZP_APP_ID or ZP_KEY1');
  }

  const timestamp = Date.now();
  const macInput = [String(app_id), m_refund_id, String(timestamp)].join('|');
  const mac = hmacSHA256Hex(key1, macInput);

  const base = (process.env.ZP_API_BASE || 'https://sb-openapi.zalopay.vn/v2').replace(/\/+$/, '');
  const path = process.env.ZP_REFUND_QUERY_PATH || '/refund/query';

  const requestBody = {
    app_id,
    m_refund_id,
    timestamp,
    mac,
  };

  try {
    const { data } = await axios.post(
      `${base}${path}`,
      requestBody,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      }
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error('[ZaloPay] Query refund error:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message,
      });
      throw new Error(`ZaloPay query refund error: ${axiosError.message}`);
    }
    throw error;
  }
}


