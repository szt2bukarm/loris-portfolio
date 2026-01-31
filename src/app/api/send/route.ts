import { Resend } from 'resend';

export async function GET() {
    return Response.json({ status: "API is active. Use POST to send messages." });
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    if (!process.env.RESEND_API_KEY) {
        console.error("Missing RESEND_API_KEY");
        return Response.json({ error: "Missing RESEND_API_KEY" }, { status: 500 });
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