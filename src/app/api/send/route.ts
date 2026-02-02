import { Resend } from 'resend';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const resend = new Resend(process.env.RESEND_API_KEY);

// Create a new Ratelimit instance
const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(2, "24 h"),
});

export async function POST(request: Request) {
    if (!process.env.RESEND_API_KEY) {
        console.error("Missing RESEND_API_KEY");
        return Response.json({ error: "Missing RESEND_API_KEY" }, { status: 500 });
    }

    // Rate Limiting Logic
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

    const { success } = await ratelimit.limit(ip);

    if (!success) {
        return Response.json(
            { error: "Daily message limit reached. Please send a message tomorrow, or contact me directly through my email." },
            { status: 429 }
        );
    }

    const { name, email, message } = await request.json();

    try {
        const { data, error } = await resend.emails.send({
            from: `${name} <studio@lorisbukvic.graphics>`,
            to: ['studio@lorisbukvic.graphics'],
            replyTo: email,
            subject: `New message from ${name} - ${email}`,
            text: `${name} says: ${message}`
        });

        if (error) {
            console.error("Resend API Detail Error:", JSON.stringify(error, null, 2));
            return Response.json({ error: error.message || error }, { status: 500 });
        }

        await resend.emails.send({
            from: 'Loris Bukvic <studio@lorisbukvic.graphics>',
            to: [email],
            subject: 'Thank you for your message',
            text: `Hi ${name},\n\nThanks for reaching out! I've received your message and will get back to you as soon as possible.\n\nBest,\nLoris \n\nHere's a copy of your message:\n\n${message}`
        });

        return Response.json(data);
    } catch (error: any) {
        console.error("Server-side Catch Error:", error.message || error);
        return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}