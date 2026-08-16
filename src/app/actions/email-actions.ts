
'use server';

import { Resend } from 'resend';
import { ShippingDetails } from '@/lib/types';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendOrderEmailsParams {
  buyerEmail: string;
  buyerName: string;
  orderId: string;
  amount: number;
  items: any[];
  shippingDetails: ShippingDetails;
  senderEmail: string;
}

export async function sendOrderEmails({
  buyerEmail,
  buyerName,
  orderId,
  amount,
  items,
  shippingDetails,
  senderEmail,
}: SendOrderEmailsParams) {
  try {
    // 1. Send Email to Buyer
    await resend.emails.send({
      from: `SareeDukan <${senderEmail}>`,
      to: [buyerEmail],
      subject: 'Order Confirmed - Your Heritage Piece is Coming!',
      html: `
        <div style="font-family: serif; color: #40000A; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
          <h1 style="text-align: center;">Order Confirmed</h1>
          <p>Dear ${buyerName},</p>
          <p>Thank you for acquiring a masterpiece from SareeDukan.Com. Your order <strong>#${orderId.slice(-8)}</strong> has been successfully placed.</p>
          <hr/>
          <h3>Order Summary</h3>
          <ul>
            ${items.map(i => `<li>${i.name} - INR ${i.price}</li>`).join('')}
          </ul>
          <p><strong>Total: INR ${amount.toFixed(2)}</strong></p>
          <hr/>
          <p>We are notifying our weaver partners to begin the selection and packaging process.</p>
          <p style="font-size: 12px; color: #666;">Shipping to: ${shippingDetails.address}, ${shippingDetails.city} - ${shippingDetails.zip}</p>
        </div>
      `,
    });

    // 2. Notify Partners (logic to send separate emails would go here)
    // For this prototype, we'll log it or send a summary to the master admin
    console.log(`Order emails dispatched for ${orderId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Email Dispatch Failed:', error);
    return { success: false, error };
  }
}
