import nodemailer, { Transporter } from 'nodemailer';
import sequelize from '../config/database';

interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  encryption: 'tls' | 'ssl' | 'none';
  fromEmail: string;
  fromName: string;
  username: string;
  password: string;
  enabled: boolean;
}

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private config: EmailConfig | null = null;

  /**
   * Load email configuration from database settings
   */
  async loadConfig(): Promise<EmailConfig | null> {
    try {
      console.log('[EmailService] Loading email configuration from database...');
      const result: any = await sequelize.query(
        "SELECT value FROM settings WHERE namespace = 'email'",
        { type: 'SELECT' as any }
      );

      if (!result || result.length === 0) {
        console.warn('[EmailService] No email configuration found in database');
        return null;
      }

      const config = result[0].value as EmailConfig;
      this.config = config;

      console.log('[EmailService] Email config loaded:', {
        enabled: config.enabled,
        smtpHost: config.smtpHost,
        smtpPort: config.smtpPort,
        encryption: config.encryption,
        fromEmail: config.fromEmail,
        fromName: config.fromName,
        hasUsername: !!config.username,
        hasPassword: !!config.password,
      });

      // Only create transporter if email is enabled and configured
      if (config.enabled && config.smtpHost && config.fromEmail) {
        console.log('[EmailService] Creating transporter...');
        this.createTransporter(config);
        console.log('[EmailService] Transporter created successfully');
      } else {
        console.warn('[EmailService] Email not enabled or missing required config:', {
          enabled: config.enabled,
          hasHost: !!config.smtpHost,
          hasFromEmail: !!config.fromEmail,
        });
      }

      return config;
    } catch (error) {
      console.error('[EmailService] Failed to load config:', error);
      return null;
    }
  }

  /**
   * Create nodemailer transporter
   */
  private createTransporter(config: EmailConfig) {
    const auth = config.username && config.password
      ? {
          user: config.username,
          pass: config.password,
        }
      : undefined;

    const secure = config.encryption === 'ssl';
    const requireTLS = config.encryption === 'tls';

    console.log('[EmailService] Creating transporter with config:', {
      host: config.smtpHost,
      port: config.smtpPort,
      secure,
      requireTLS,
      hasAuth: !!auth,
      authUser: auth?.user,
    });

    this.transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure,
      requireTLS,
      auth,
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    } as any);

    console.log('[EmailService] Transporter created');
  }

  /**
   * Initialize email service (load config)
   */
  async initialize() {
    await this.loadConfig();
  }

  /**
   * Check if email is enabled and configured
   */
  isEnabled(): boolean {
    return this.config?.enabled === true && this.transporter !== null;
  }

  /**
   * Send email
   */
  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    const startTime = Date.now();
    console.log('[EmailService] ========== SENDING EMAIL ==========');
    console.log('[EmailService] To:', options.to);
    console.log('[EmailService] Subject:', options.subject);
    
    try {
      // Reload config before sending (in case it changed)
      console.log('[EmailService] Reloading config...');
      await this.loadConfig();

      if (!this.isEnabled()) {
        console.error('[EmailService] ❌ Email is not enabled or not configured');
        console.error('[EmailService] Config state:', {
          enabled: this.config?.enabled,
          hasTransporter: !!this.transporter,
          hasHost: !!this.config?.smtpHost,
          hasFromEmail: !!this.config?.fromEmail,
        });
        return false;
      }

      if (!this.transporter) {
        console.error('[EmailService] ❌ Transporter not initialized');
        return false;
      }

      const mailOptions = {
        from: `"${this.config!.fromName}" <${this.config!.fromEmail}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html),
        replyTo: options.replyTo || this.config!.fromEmail,
      };

      console.log('[EmailService] Mail options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        hasHtml: !!mailOptions.html,
        htmlLength: mailOptions.html?.length || 0,
      });

      console.log('[EmailService] Attempting to send email...');
      const info = await this.transporter.sendMail(mailOptions);
      const duration = Date.now() - startTime;
      console.log('[EmailService] ✅ Email sent successfully!');
      console.log('[EmailService] Message ID:', info.messageId);
      console.log('[EmailService] Response:', info.response);
      console.log('[EmailService] Duration:', `${duration}ms`);
      console.log('[EmailService] ====================================');
      return true;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error('[EmailService] ❌ Failed to send email');
      console.error('[EmailService] Error details:', {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode,
        stack: error.stack,
      });
      console.error('[EmailService] Duration before error:', `${duration}ms`);
      console.error('[EmailService] ====================================');
      return false;
    }
  }

  /**
   * Convert HTML to plain text (simple version)
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    console.log('[EmailService] ========== TESTING EMAIL CONNECTION ==========');
    try {
      await this.loadConfig();

      if (!this.isEnabled()) {
        const message = 'Email is not enabled or not properly configured';
        console.error('[EmailService] ❌ Test failed:', message);
        console.error('[EmailService] Config state:', {
          enabled: this.config?.enabled,
          hasTransporter: !!this.transporter,
          hasHost: !!this.config?.smtpHost,
          hasFromEmail: !!this.config?.fromEmail,
        });
        return {
          success: false,
          message,
        };
      }

      if (!this.transporter) {
        const message = 'Email transporter not initialized';
        console.error('[EmailService] ❌ Test failed:', message);
        return {
          success: false,
          message,
        };
      }

      console.log('[EmailService] Verifying SMTP connection...');
      await this.transporter.verify();
      console.log('[EmailService] ✅ Connection verified successfully!');
      return {
        success: true,
        message: 'Email configuration is valid and connection successful',
      };
    } catch (error: any) {
      console.error('[EmailService] ❌ Connection test failed:', {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode,
      });
      return {
        success: false,
        message: error.message || 'Failed to verify email configuration',
      };
    } finally {
      console.log('[EmailService] ===========================================');
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Initialize on module load
emailService.initialize().catch((error) => {
  console.error('[EmailService] Failed to initialize:', error);
});







