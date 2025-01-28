export async function onRequestPost(context) {
    const LIKELY_HUMAN_SCORE_THRESHOLD = 30;

    if (context.request.cf.botManagement.score < LIKELY_HUMAN_SCORE_THRESHOLD) {
        return new Response();
    }

    const email = (await context.request.formData()).get("email");

    const response = await fetch(
        "https://connect.mailerlite.com/api/subscribers",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${context.env.MAILERLITE_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                groups: [context.env.NEWSLETTER_GROUP_ID]
            })
        });

    const redirectMap = {
        200: "/ya-suscrito",
        201: "/suscripcion-confirmada",
    };

    return Response.redirect(new URL(redirectMap[response.status] || "/error", context.request.url), 302);
}