import { Injectable, Logger } from '@nestjs/common';
import * as http from 'http';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  private readonly baseUrl = 'http://app.mydreamstechnology.in/vb/apikey.php';
  private get apiKey(): string {
    return process.env.SMS_API_KEY || 'rFqYJ3t98Qsn99d6';
  }
  private get senderId(): string {
    return process.env.SMS_SENDER || 'VTAGPT';
  }
  private get loginTemplateId(): string {
    return process.env.SMS_LOGIN_TEMPLATE_ID;
  }
  private get subscriptionSuccessTemplateId(): string {
    return process.env.SMS_SUBSCRIPTION_SUCCESS_TEMPLATE_ID;
  }
  private get subscriptionExpiryTemplateId(): string {
    return process.env.SMS_SUBSCRIPTION_EXPIRY_TEMPLATE_ID;
  }
  private get contentUploadTemplateId(): string {
    return process.env.SMS_CONTENT_UPLOAD_TEMPLATE_ID;
  }

  /**
   * Helper: Format mobile number (adds 91 prefix for 10-digit Indian numbers)
   */
  private formatMobileNumber(mobile: string): string {
    if (!mobile) return '';
    let formatted = mobile.replace(/\D/g, '');
    if (formatted.length === 10) {
      formatted = '91' + formatted;
    }
    return formatted;
  }

  /**
   * Helper: Clean customer name for SMS placeholders
   */
  private cleanCustomerName(name?: string): string {
    if (!name || !name.trim()) return 'Customer';
    const trimmed = name.trim();
    if (trimmed.match(/^User[_\?]?\d*$/i)) {
      return 'Customer';
    }
    return trimmed;
  }

  /**
   * Helper: Format date from unix timestamp (seconds) to DD-MMM-YYYY (e.g. 20-Jul-2026)
   */
  public formatDateForSms(timestampSec: number): string {
    if (!timestampSec || isNaN(timestampSec)) {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${day}-${months[now.getMonth()]}-${now.getFullYear()}`;
    }
    const date = new Date(timestampSec * 1000);
    const day = String(date.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  /**
   * Send HTTP request to SMS gateway
   */
  private async executeSmsRequest(formattedMobile: string, templateId: string, message: string): Promise<boolean> {
    if (!formattedMobile) {
      this.logger.warn('Skipping SMS dispatch: Invalid or missing mobile number');
      return false;
    }

    const queryParams = new URLSearchParams({
      apikey: this.apiKey,
      senderid: this.senderId,
      templateid: templateId,
      number: formattedMobile,
      message: message,
    }).toString();

    const fullUrl = `${this.baseUrl}?${queryParams}`;

    return new Promise((resolve) => {
      this.logger.log(`Dispatching SMS to ${formattedMobile} (Template ID: ${templateId})`);

      const req = http.get(fullUrl, (res) => {
        let responseData = '';
        res.on('data', (chunk) => { responseData += chunk; });
        res.on('end', () => {
          this.logger.log(`SMS Gateway Response for ${formattedMobile}: ${responseData}`);
          resolve(true);
        });
      });

      req.on('error', (error) => {
        this.logger.error(`SMS Error sending to ${formattedMobile}: ${error.message}`);
        resolve(false); // Log error but do not break main execution flow
      });

      req.setTimeout(10000, () => {
        this.logger.error(`SMS Timeout after 10 seconds for ${formattedMobile}`);
        req.destroy();
        resolve(false);
      });
    });
  }

  /**
   * 1. Send Login OTP SMS
   * DLT Template ID: 1277178454507676243
   */
  async sendOtpSms(mobile: string, otp: string, rawCustomerName?: string): Promise<boolean> {
    const customerName = this.cleanCustomerName(rawCustomerName);
    const formattedMobile = this.formatMobileNumber(mobile);
    const templateId = this.loginTemplateId;
    
    // Approved DLT text format
    const message = `Dear ${customerName} , Your OTP for login is ${otp} . Please use it to verify your login within 10 minutes. https://vtagu.com/ VtagU Primetime`;

    return this.executeSmsRequest(formattedMobile, templateId, message);
  }

  /**
   * 2. Send Subscription Success SMS
   * DLT Template ID: 1277178428254834650
   */
  async sendSubscriptionSuccessSms(
    mobile: string,
    rawCustomerName: string | undefined,
    planName: string,
    amount: number | string,
    validTillDate: string,
  ): Promise<boolean> {
    const customerName = this.cleanCustomerName(rawCustomerName);
    const formattedMobile = this.formatMobileNumber(mobile);
    const templateId = this.subscriptionSuccessTemplateId;

    // Approved DLT text format
    const message = `Dear ${customerName} , your subscription for ${planName} plan is successful. You now have access to all interactive movies. Amount paid: INR ${amount}. Valid till: ${validTillDate}. Regards, VTAGU Prime Time`;

    return this.executeSmsRequest(formattedMobile, templateId, message);
  }

  /**
   * 3. Send Expiry Reminder Subscription SMS
   * DLT Template ID: 1277178428982461283
   */
  async sendExpiryReminderSms(
    mobile: string,
    rawCustomerName: string | undefined,
    planName: string,
    expiryDate: string,
  ): Promise<boolean> {
    const customerName = this.cleanCustomerName(rawCustomerName);
    const formattedMobile = this.formatMobileNumber(mobile);
    const templateId = this.subscriptionExpiryTemplateId;

    // Approved DLT text format
    const message = `Dear ${customerName} , your VTAGU subscription for ${planName} plan is expiring on ${expiryDate} . Please renew to continue enjoying unlimited streaming. Regards, VTAGU Prime Time`;

    return this.executeSmsRequest(formattedMobile, templateId, message);
  }

  /**
   * 4. Send Generic Content Upload SMS
   * DLT Template ID: 1277178428132372645
   */
  async sendContentUploadSms(
    mobile: string,
    contentTypeOrTitle: string,
    url: string,
  ): Promise<boolean> {
    const formattedMobile = this.formatMobileNumber(mobile);
    const templateId = this.contentUploadTemplateId;

    // Approved DLT text format
    const message = `Exciting News, New ${contentTypeOrTitle} is now available on VTAGU. Watch it now: ${url} . Regards, VTAGU Prime Time.`;

    return this.executeSmsRequest(formattedMobile, templateId, message);
  }
}
