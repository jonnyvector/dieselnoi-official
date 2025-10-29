import type { APIRoute } from 'astro';
import Omise from 'omise';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { token, amount } = body;

    // Initialize Omise (server-side)
    const omise = Omise({
      secretKey: import.meta.env.OMISE_SECRET_KEY || 'YOUR_OMISE_SECRET_KEY',
      omiseVersion: '2019-05-29'
    });

    // Create a charge
    const charge = await omise.charges.create({
      amount: amount * 100, // Convert to satang (smallest unit)
      currency: 'THB',
      card: token,
      description: 'Youth Muay Thai Program Donation',
      metadata: {
        purpose: 'Children Muay Thai Event - Drug Prevention',
        timestamp: new Date().toISOString()
      }
    });

    if (charge.status === 'successful' || charge.status === 'pending') {
      return new Response(
        JSON.stringify({
          success: true,
          chargeId: charge.id,
          status: charge.status
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Payment failed'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  } catch (error: any) {
    console.error('Payment error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An error occurred processing your payment'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};
