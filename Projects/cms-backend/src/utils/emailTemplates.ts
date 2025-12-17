/**
 * Email Templates
 * Templates for various email notifications
 */

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: Date;
}

/**
 * Template for admin notification when new contact form is submitted
 */
export function getContactNotificationTemplate(data: ContactFormData): string {
  const subjectLabels: Record<string, string> = {
    product: 'Product Inquiry',
    order: 'Order Status',
    support: 'Technical Support',
    'spa-development': 'Spa Development Services',
    partnership: 'Partnership Opportunities',
    other: 'Other',
  };

  const subjectLabel = subjectLabels[data.subject] || data.subject;
  const fullName = `${data.firstName} ${data.lastName}`;
  const formattedDate = new Date(data.createdAt).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="margin-top: 0; font-size: 16px;">You have received a new contact form submission from your website.</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <h2 style="margin-top: 0; color: #667eea; font-size: 20px;">Contact Information</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 120px;">Name:</td>
          <td style="padding: 8px 0;">${fullName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Email:</td>
          <td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #667eea; text-decoration: none;">${data.email}</a></td>
        </tr>
        ${data.phone ? `
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
          <td style="padding: 8px 0;"><a href="tel:${data.phone}" style="color: #667eea; text-decoration: none;">${data.phone}</a></td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Subject:</td>
          <td style="padding: 8px 0;">${subjectLabel}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Date:</td>
          <td style="padding: 8px 0;">${formattedDate}</td>
        </tr>
      </table>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #764ba2;">
      <h2 style="margin-top: 0; color: #764ba2; font-size: 20px;">Message</h2>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; white-space: pre-wrap; font-size: 14px; line-height: 1.8;">
${data.message}
      </div>
    </div>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
      <p style="color: #666; font-size: 14px; margin: 0;">
        Please respond to this inquiry as soon as possible to maintain good customer service.
      </p>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
    <p>This is an automated notification from your CMS.</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Template for customer confirmation email
 */
export function getContactConfirmationTemplate(data: ContactFormData): string {
  const subjectLabels: Record<string, string> = {
    product: 'Product Inquiry',
    order: 'Order Status',
    support: 'Technical Support',
    'spa-development': 'Spa Development Services',
    partnership: 'Partnership Opportunities',
    other: 'Other',
  };

  const subjectLabel = subjectLabels[data.subject] || data.subject;
  const fullName = `${data.firstName} ${data.lastName}`;
  const formattedDate = new Date(data.createdAt).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Contacting Us</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Thank You for Contacting Us!</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="margin-top: 0; font-size: 16px;">Dear ${data.firstName},</p>
    
    <p style="font-size: 16px; line-height: 1.8;">
      Thank you for reaching out to us! We have successfully received your message and our team will review it shortly.
    </p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <h2 style="margin-top: 0; color: #667eea; font-size: 18px;">Your Inquiry Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 100px;">Subject:</td>
          <td style="padding: 8px 0;">${subjectLabel}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Submitted:</td>
          <td style="padding: 8px 0;">${formattedDate}</td>
        </tr>
      </table>
    </div>
    
    <div style="background: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <h3 style="margin-top: 0; color: #667eea; font-size: 16px;">What's Next?</h3>
      <ul style="margin: 0; padding-left: 20px; color: #555;">
        <li style="margin-bottom: 10px;">Our team will review your message within 24 hours</li>
        <li style="margin-bottom: 10px;">We'll respond to your inquiry as soon as possible</li>
        <li style="margin-bottom: 10px;">For urgent matters, please call us directly</li>
      </ul>
    </div>
    
    <p style="font-size: 16px; line-height: 1.8;">
      If you have any additional questions or information to share, please don't hesitate to reply to this email or contact us directly.
    </p>
    
    <p style="font-size: 16px; line-height: 1.8; margin-bottom: 0;">
      Best regards,<br>
      <strong>Customer Service Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
    <p>This is an automated confirmation email. Please do not reply to this message.</p>
  </div>
</body>
</html>
  `.trim();
}

interface ContactReplyData {
  customerName: string;
  customerEmail: string;
  originalSubject: string;
  originalMessage: string;
  replyMessage: string;
  adminName: string;
  adminEmail?: string;
  repliedAt: Date;
}

/**
 * Template for admin reply to customer
 */
export function getContactReplyTemplate(data: ContactReplyData): string {
  const subjectLabels: Record<string, string> = {
    product: 'Product Inquiry',
    order: 'Order Status',
    support: 'Technical Support',
    'spa-development': 'Spa Development Services',
    partnership: 'Partnership Opportunities',
    other: 'Other',
  };

  const subjectLabel = subjectLabels[data.originalSubject] || data.originalSubject;
  const formattedDate = new Date(data.repliedAt).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Re: ${subjectLabel}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Re: ${subjectLabel}</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="margin-top: 0; font-size: 16px;">Dear ${data.customerName},</p>
    
    <p style="font-size: 16px; line-height: 1.8;">
      Thank you for contacting us. We have reviewed your inquiry and are pleased to provide the following response:
    </p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <h2 style="margin-top: 0; color: #667eea; font-size: 20px;">Our Response</h2>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; white-space: pre-wrap; font-size: 14px; line-height: 1.8; color: #333;">
${data.replyMessage}
      </div>
    </div>
    
    <div style="background: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #764ba2;">
      <h3 style="margin-top: 0; color: #764ba2; font-size: 16px;">Your Original Inquiry</h3>
      <div style="background: white; padding: 15px; border-radius: 5px; margin-top: 10px;">
        <p style="margin: 0 0 10px 0; font-weight: bold; color: #555;">Subject: ${subjectLabel}</p>
        <div style="color: #666; font-size: 14px; white-space: pre-wrap; line-height: 1.6;">
${data.originalMessage}
        </div>
      </div>
    </div>
    
    <p style="font-size: 16px; line-height: 1.8;">
      If you have any further questions or need additional assistance, please don't hesitate to reply to this email or contact us directly.
    </p>
    
    <p style="font-size: 16px; line-height: 1.8; margin-bottom: 0;">
      Best regards,<br>
      <strong>${data.adminName}</strong><br>
      ${data.adminEmail ? `<a href="mailto:${data.adminEmail}" style="color: #667eea; text-decoration: none;">${data.adminEmail}</a>` : ''}
    </p>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
      <p style="color: #999; font-size: 12px; margin: 0;">
        Replied on ${formattedDate}
      </p>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
    <p>This email is in response to your inquiry submitted through our contact form.</p>
  </div>
</body>
</html>
  `.trim();
}

interface OrderConfirmationData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  orderDate: Date;
  total: number;
  paymentMethod: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    district?: string;
    ward?: string;
  };
  orderUrl?: string; // URL để tra cứu đơn hàng
}

/**
 * Template for order confirmation email (when payment is successful)
 */
export function getOrderConfirmationTemplate(data: OrderConfirmationData): string {
  const formattedDate = new Date(data.orderDate).toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh', // UTC+7
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const paymentMethodLabels: Record<string, string> = {
    zalopay: 'ZaloPay (Thanh toán trực tuyến)',
    cod: 'Thanh toán khi nhận hàng (COD)',
  };

  const paymentLabel = paymentMethodLabels[data.paymentMethod] || data.paymentMethod;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác nhận đơn hàng ${data.orderNumber}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Đơn hàng của bạn đã được xác nhận!</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="margin-top: 0; font-size: 16px;">Xin chào <strong>${data.customerName}</strong>,</p>
    
    <p style="font-size: 16px; line-height: 1.8;">
      Cảm ơn bạn đã đặt hàng! Đơn hàng của bạn đã được xác nhận và đang được xử lý.
    </p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
      <h2 style="margin-top: 0; color: #dc2626; font-size: 20px;">Thông tin đơn hàng</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 140px;">Mã đơn hàng:</td>
          <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #dc2626;">${data.orderNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Ngày đặt:</td>
          <td style="padding: 8px 0;">${formattedDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Phương thức thanh toán:</td>
          <td style="padding: 8px 0;">${paymentLabel}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Tổng tiền:</td>
          <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #dc2626;">${formatCurrency(data.total)}</td>
        </tr>
      </table>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #991b1b;">
      <h2 style="margin-top: 0; color: #991b1b; font-size: 20px;">Chi tiết sản phẩm</h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background: #f5f5f5;">
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e0e0e0;">Sản phẩm</th>
            <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e0e0e0;">Số lượng</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e0e0e0;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map(item => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${item.name}</td>
            <td style="padding: 10px; text-align: center; border-bottom: 1px solid #e0e0e0;">${item.quantity}</td>
            <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e0e0e0;">${formatCurrency(item.subtotal)}</td>
          </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold; border-top: 2px solid #e0e0e0;">Tổng cộng:</td>
            <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 18px; color: #dc2626; border-top: 2px solid #e0e0e0;">${formatCurrency(data.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
      <h2 style="margin-top: 0; color: #dc2626; font-size: 20px;">Địa chỉ giao hàng</h2>
      <div style="line-height: 1.8;">
        <p style="margin: 5px 0;"><strong>${data.shippingAddress.name}</strong></p>
        <p style="margin: 5px 0;">📞 ${data.shippingAddress.phone}</p>
        <p style="margin: 5px 0;">${data.shippingAddress.address}</p>
        <p style="margin: 5px 0;">
          ${data.shippingAddress.ward ? `${data.shippingAddress.ward}, ` : ''}
          ${data.shippingAddress.district ? `${data.shippingAddress.district}, ` : ''}
          ${data.shippingAddress.city}
        </p>
      </div>
    </div>
    
    ${data.orderUrl ? `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.orderUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
        Tra cứu đơn hàng
      </a>
    </div>
    ` : ''}
    
    <div style="background: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
      <h3 style="margin-top: 0; color: #dc2626; font-size: 16px;">📦 Bước tiếp theo</h3>
      <ul style="margin: 0; padding-left: 20px; color: #555;">
        <li style="margin-bottom: 10px;">Đơn hàng của bạn đang được xử lý</li>
        <li style="margin-bottom: 10px;">Chúng tôi sẽ gửi email cập nhật khi đơn hàng được vận chuyển</li>
        <li style="margin-bottom: 10px;">Nếu có thắc mắc, vui lòng liên hệ bộ phận hỗ trợ</li>
      </ul>
    </div>
    
    <p style="font-size: 16px; line-height: 1.8; margin-bottom: 0;">
      Trân trọng,<br>
      <strong>Đội ngũ Banyco</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
    <p>Email này được gửi tự động. Vui lòng không trả lời email này.</p>
  </div>
</body>
</html>
  `.trim();
}

