export async function onRequestPost(context) {
    const formData = (await context.request.formData());

    // Si parece un bot, cancelamos la acción.
    const LIKELY_HUMAN_SCORE_THRESHOLD = 30;
    if (formData.get("name") !== "" || context.request.cf.botManagement.score < LIKELY_HUMAN_SCORE_THRESHOLD) {
        return new Response();
    }

    const response = await fetch(
        "https://connect.mailerlite.com/api/subscribers", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${context.env.MAILERLITE_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: formData.get("email"),
                groups: [context.env.NEWSLETTER_GROUP_ID]
            })
        });

    const redirectMap = {
        200: "/already-subscribed",
        201: "/subscription-confirmed",
    };

    return Response.redirect(new URL(redirectMap[response.status] || "/error", context.request.url), 302);
}