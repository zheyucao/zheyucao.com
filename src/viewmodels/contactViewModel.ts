import { getEntry } from "astro:content";

/**
 * Contact page view model
 * Fetches contact data for the contact page
 */
export async function getContactViewModel() {
    const contactEntry = await getEntry("contact", "info");

    return {
        intro: contactEntry.data.intro,
        sections: contactEntry.data.sections,
    };
}
