// Parts of the site that are built but switched off. Flip to true to bring one back.

// The newsletter: /newsletter and its issues, sign-up, subscriber accounts and sign-in,
// the mail provider's webhook, and the issues' public draft history. Off means every one
// of those addresses answers "not found" (middleware.ts) and none is in the sitemap.
export const NEWSLETTER_ON = false
