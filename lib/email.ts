import { Resend } from "resend";

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Email templates
export type EmailTemplate = "booking-confirmation" | "report-notification";

interface SendEmailOptions {
  to: string;
  subject: string;
  template: EmailTemplate;
  data: Record<string, any>;
}

export async function sendEmail({
  to,
  subject,
  template,
  data,
}: SendEmailOptions) {
  try {
    // Validate email address
    if (!to || !to.includes("@")) {
      throw new Error("Invalid email address");
    }

    // Get the appropriate email template
    const { html, text } = getEmailTemplate(template, data);

    // Send the email
    const { data: result, error } = await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("Error sending email:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return { success: true, messageId: result?.id };
  } catch (error) {
    console.error("Error in sendEmail:", error);
    throw error;
  }
}

function getEmailTemplate(template: EmailTemplate, data: Record<string, any>) {
  switch (template) {
    case "booking-confirmation":
      return getBookingConfirmationEmail(data);
    case "report-notification":
      return getReportNotificationEmail(data);
    default:
      throw new Error(`Unknown email template: ${template}`);
  }
}

function getBookingConfirmationEmail(data: Record<string, any>) {
  const { customerName, propertyName, startDate, endDate, amount, bookingId } =
    data;

  const formattedStartDate = new Date(startDate).toLocaleDateString();
  const formattedEndDate = new Date(endDate).toLocaleDateString();
  const formattedAmount = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333; text-align: center;">Booking Confirmation</h1>
      <p>Dear ${customerName},</p>
      <p>Thank you for your booking. Your reservation has been confirmed!</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h2 style="color: #333; margin-top: 0;">Booking Details</h2>
        <p><strong>Booking ID:</strong> ${bookingId}</p>
        <p><strong>Property:</strong> ${propertyName}</p>
        <p><strong>Check-in Date:</strong> ${formattedStartDate}</p>
        <p><strong>Check-out Date:</strong> ${formattedEndDate}</p>
        <p><strong>Total Amount:</strong> ${formattedAmount}</p>
      </div>
      
      <p>If you have any questions or need to make changes to your booking, please contact us.</p>
      <p>We look forward to welcoming you!</p>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #777; font-size: 12px;">
        <p>This is an automated email. Please do not reply to this message.</p>
      </div>
    </div>
  `;

  const text = `
    Booking Confirmation
    
    Dear ${customerName},
    
    Thank you for your booking. Your reservation has been confirmed!
    
    Booking Details:
    Booking ID: ${bookingId}
    Property: ${propertyName}
    Check-in Date: ${formattedStartDate}
    Check-out Date: ${formattedEndDate}
    Total Amount: ${formattedAmount}
    
    If you have any questions or need to make changes to your booking, please contact us.
    
    We look forward to welcoming you!
    
    This is an automated email. Please do not reply to this message.
  `;

  return { html, text };
}

function getReportNotificationEmail(data: Record<string, any>) {
  const {
    issueId,
    title,
    description,
    priority,
    category,
    status,
    submittedBy,
  } = data;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333; text-align: center;">Issue Report Notification</h1>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h2 style="color: #333; margin-top: 0;">Issue Details</h2>
        <p><strong>Issue ID:</strong> ${issueId}</p>
        <p><strong>Title:</strong> ${title}</p>
        <p><strong>Priority:</strong> <span style="text-transform: capitalize;">${priority}</span></p>
        <p><strong>Category:</strong> <span style="text-transform: capitalize;">${category}</span></p>
        <p><strong>Status:</strong> <span style="text-transform: capitalize;">${status}</span></p>
        ${submittedBy ? `<p><strong>Submitted By:</strong> ${submittedBy}</p>` : ""}
        
        <h3 style="color: #333; margin-top: 20px;">Description</h3>
        <p>${description}</p>
      </div>
      
      <p>Our team will review this issue and take appropriate action.</p>
      <p>Thank you for your report.</p>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #777; font-size: 12px;">
        <p>This is an automated email. Please do not reply to this message.</p>
      </div>
    </div>
  `;

  const text = `
    Issue Report Notification
    
    Issue Details:
    Issue ID: ${issueId}
    Title: ${title}
    Priority: ${priority}
    Category: ${category}
    Status: ${status}
    ${submittedBy ? `Submitted By: ${submittedBy}` : ""}
    
    Description:
    ${description}
    
    Our team will review this issue and take appropriate action.
    Thank you for your report.
    
    This is an automated email. Please do not reply to this message.
  `;

  return { html, text };
}
