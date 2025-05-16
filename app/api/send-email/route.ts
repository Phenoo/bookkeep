import { NextResponse } from "next/server";
import { sendEmail, type EmailTemplate } from "@/lib/email";

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();

    // Validate required fields
    if (!body.to || !body.subject || !body.template) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: to, subject, and template are required",
        },
        { status: 400 }
      );
    }

    // Validate template
    if (
      !["booking-confirmation", "report-notification"].includes(body.template)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid template. Must be 'booking-confirmation' or 'report-notification'",
        },
        { status: 400 }
      );
    }

    // Send the email
    const result = await sendEmail({
      to: body.to,
      subject: body.subject,
      template: body.template as EmailTemplate,
      data: body.data || {},
    });

    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error sending email",
      },
      { status: 500 }
    );
  }
}
