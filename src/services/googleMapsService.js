/**
 * googleMapsService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * CortexReach — Google Maps Places API (New) Integration
 *
 * Migrated from deprecated PlacesService to google.maps.places.Place:
 *  - searchPlaces()          → Place.searchByText()      (async, no callbacks)
 *  - fetchPlaceDetails()     → new Place({id}) + place.fetchFields()
 *  - fetchPlaceDetailsBatch() → batch with 200ms rate limit
 *  - extractEmailFromWebsite() → CORS proxy HTML scraper
 *  - generateLeads()         → full pipeline: search → details → emails
 *
 * Field mapping (old → new):
 *  name                   → displayName
 *  formatted_address      → formattedAddress
 *  formatted_phone_number → nationalPhoneNumber
 *  website                → websiteURI
 *  place_id               → id
 *  user_ratings_total     → userRatingCount
 */

// ─── Helper: lazy-load the Place class via importLibrary ──────────────────────
let _Place = null;

const getPlace = async () => {
    if (_Place) return _Place;

    if (typeof window === 'undefined' || !window.google?.maps) {
        throw new Error('Google Maps SDK not loaded. Check your index.html script tag.');
    }

    const { Place } = await window.google.maps.importLibrary('places');
    _Place = Place;
    return _Place;
};

// ─── Helper: delay ────────────────────────────────────────────────────────────
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// ─── Helper: map type array → human-readable category ────────────────────────
const mapCategory = (types = []) => {
    const priority = [
        'accounting', 'airport', 'amusement_park', 'art_gallery', 'atm',
        'bakery', 'bank', 'bar', 'beauty_salon', 'bicycle_store', 'book_store',
        'cafe', 'casino', 'clothing_store', 'convenience_store', 'courthouse',
        'dentist', 'department_store', 'doctor', 'drugstore', 'electrician',
        'electronics_store', 'embassy', 'finance', 'florist', 'food',
        'furniture_store', 'gas_station', 'gym', 'hair_care', 'hardware_store',
        'health', 'home_goods_store', 'hospital', 'insurance_agency',
        'jewelry_store', 'laundry', 'lawyer', 'library', 'lodging',
        'meal_delivery', 'meal_takeaway', 'movie_theater', 'moving_company',
        'museum', 'night_club', 'painter', 'park', 'pet_store', 'pharmacy',
        'physiotherapist', 'plumber', 'police', 'post_office',
        'real_estate_agency', 'restaurant', 'roofing_contractor', 'school',
        'shoe_store', 'shopping_mall', 'spa', 'stadium', 'storage', 'store',
        'supermarket', 'taxi_stand', 'tourist_attraction', 'train_station',
        'travel_agency', 'university', 'veterinary_care', 'zoo',
    ];
    for (const t of priority) {
        if (types.includes(t)) {
            return t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        }
    }
    return types[0]?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Business';
};

// ─── Helper: map place object to our internal lead shape ─────────────────────
const mapPlaceToLead = (place) => ({
    id: place.id,
    place_id: place.id,
    name: place.displayName || 'Unknown',
    formatted_address: place.formattedAddress || null,
    category: mapCategory(place.types || []),
    types: place.types || [],
    rating: place.rating || 0,
    user_ratings_total: place.userRatingCount || 0,
    // Enriched by fetchPlaceDetails
    website: place.websiteURI || null,
    phone: place.nationalPhoneNumber || place.internationalPhoneNumber || null,
    email: null,
});


// ─── PHASE 1: Text Search ─────────────────────────────────────────────────────

/**
 * searchPlaces — Paginated Google Maps Text Search (New API)
 *
 * Uses Place.searchByText() — fully async/await, no callbacks.
 * Fetches up to 3 pages (20 results each = up to 60 leads).
 *
 * @param {string} keyword   — Business type / search term
 * @param {string} location  — City or country name
 * @param {object} options
 * @param {number}   options.maxPages      — 1..3 pages
 * @param {function} options.onPageFetched — callback(pageNum, allSoFar)
 * @returns {Promise<Array>}
 */
export const searchPlaces = async (keyword, location, options = {}) => {
    const { maxPages = 1, onPageFetched } = options;
    const pages = Math.min(Math.max(1, maxPages), 3);

    console.log(`[GoogleMaps] Searching: "${keyword}" in "${location}" (${pages} page(s))`);

    const Place = await getPlace();
    const allResults = [];
    let pageToken = undefined;

    for (let p = 0; p < pages; p++) {
        const request = {
            textQuery: `${keyword} in ${location}`,
            fields: [
                'id',
                'displayName',
                'formattedAddress',
                'types',
                'rating',
                'userRatingCount',
                'businessStatus',
            ],
            maxResultCount: 20,
            ...(pageToken ? { pageToken } : {}),
        };

        console.log(`[GoogleMaps] Fetching page ${p + 1}...`);

        // New API — native Promise, no callbacks, no status check needed
        const { places, nextPageToken } = await Place.searchByText(request);

        pageToken = nextPageToken || undefined;

        const mapped = (places || []).map(mapPlaceToLead);
        allResults.push(...mapped);

        console.log(`[GoogleMaps] Page ${p + 1}: ${mapped.length} results (total: ${allResults.length})`);

        if (onPageFetched) onPageFetched(p + 1, [...allResults]);

        // No more pages available
        if (!pageToken) break;

        // Brief pause before fetching next page (good practice)
        if (p < pages - 1) await delay(1000);
    }

    return allResults;
};


// ─── PHASE 2: Place Details ───────────────────────────────────────────────────

/**
 * fetchPlaceDetails — Get full contact info for a single place (New API)
 *
 * Creates a Place instance by ID, then calls fetchFields() to get details.
 * Returns null on error (non-throwing) to keep the pipeline running.
 *
 * @param {string} placeId — Google Place ID
 * @returns {Promise<object|null>}
 */
export const fetchPlaceDetails = async (placeId) => {
    try {
        const Place = await getPlace();

        // Instantiate by ID — no DOM container needed (unlike old PlacesService)
        const place = new Place({ id: placeId });

        // Fetch only the fields we need
        await place.fetchFields({
            fields: [
                'displayName',
                'formattedAddress',
                'nationalPhoneNumber',
                'internationalPhoneNumber',
                'websiteURI',
                'types',
                'businessStatus',
            ],
        });

        return {
            name: place.displayName || null,
            website: place.websiteURI || null,
            phone: place.nationalPhoneNumber || place.internationalPhoneNumber || null,
            formatted_address: place.formattedAddress || null,
            category: mapCategory(place.types || []),
            types: place.types || [],
            businessStatus: place.businessStatus || null,
        };
    } catch (err) {
        console.warn(`[GoogleMaps] fetchPlaceDetails failed for ${placeId}:`, err.message);
        return null;
    }
};

/**
 * fetchPlaceDetailsBatch — Fetch details for an array of place IDs
 * with 200ms rate limiting between calls.
 *
 * @param {string[]} placeIds
 * @param {function} onProgress — callback(done, total)
 * @returns {Promise<Map<string, object>>}
 */
export const fetchPlaceDetailsBatch = async (placeIds, onProgress) => {
    const resultMap = new Map();

    for (let i = 0; i < placeIds.length; i++) {
        const details = await fetchPlaceDetails(placeIds[i]);
        resultMap.set(placeIds[i], details);

        if (onProgress) onProgress(i + 1, placeIds.length);

        // Rate limit — 200ms between calls
        if (i < placeIds.length - 1) await delay(200);
    }

    return resultMap;
};


// ─── PHASE 3: Email Extraction ────────────────────────────────────────────────

/**
 * extractEmailFromWebsite — Scrape a public email from the business homepage.
 *
 * Strategy:
 *  1. Fetch via allorigins.win CORS proxy (no timeout — waits until server responds)
 *  2. Regex-match emails, prefer B2B prefixes: info@, contact@, sales@, hello@
 *  3. Fallback: derive info@domain from the URL
 *
 * @param {string} websiteUrl
 * @returns {Promise<string|null>}
 */
export const extractEmailFromWebsite = async (websiteUrl) => {
    if (!websiteUrl) return null;

    const url = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;

    try {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        // No timeout — wait as long as the proxy takes
        const res = await fetch(proxyUrl);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        const html = json.contents || '';

        const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
        const matches = html.match(emailRegex) || [];

        const IGNORE = ['noreply', 'no-reply', 'example', 'sentry', 'cdn', 'w3.org', 'schema.org'];
        const filtered = matches.filter(
            (e) => !IGNORE.some((ig) => e.toLowerCase().includes(ig))
        );

        const PRIORITY = ['info@', 'contact@', 'sales@', 'hello@', 'business@', 'enquiry@'];
        const preferred = filtered.find((e) =>
            PRIORITY.some((p) => e.toLowerCase().startsWith(p))
        );
        if (preferred) return preferred;

        if (filtered.length > 0) return filtered[0];

        return _fallbackEmail(url);
    } catch (err) {
        console.warn(`[GoogleMaps] Email extraction failed for ${url}:`, err.message);
        return _fallbackEmail(url);
    }
};

const _fallbackEmail = (url) => {
    try {
        const domain = new URL(url).hostname.replace(/^www\./, '');
        return `info@${domain}`;
    } catch {
        return null;
    }
};


// ─── PHASE 4: Full B2B Lead Generation Pipeline ───────────────────────────────

/**
 * generateLeads — Complete pipeline: Search → Details → Emails → DB-ready objects
 *
 * @param {object} params
 * @param {string}   params.keyword
 * @param {string}   params.location
 * @param {number}   params.maxPages       — 1..3
 * @param {boolean}  params.fetchDetails   — fetch phone / website / address
 * @param {boolean}  params.extractEmails  — crawl websites for contact emails
 * @param {function} params.onProgress     — ({stage, done, total}) => void
 * @returns {Promise<{ leads: Array, stats: object }>}
 */
export const generateLeads = async ({
    keyword,
    location,
    maxPages = 1,
    fetchDetails = true,
    extractEmails = false,
    onProgress,
}) => {
    const report = (stage, done, total) => {
        if (onProgress) onProgress({ stage, done, total });
    };

    // ── STEP 1: Search ────────────────────────────────────────────────────────
    report('search', 0, maxPages);

    const searchResults = await searchPlaces(keyword, location, {
        maxPages,
        onPageFetched: (page) => report('search', page, maxPages),
    });

    report('search', maxPages, maxPages);

    if (searchResults.length === 0) {
        return {
            leads: [],
            stats: { total: 0, withWebsite: 0, withPhone: 0, withEmail: 0 },
        };
    }

    let leads = [...searchResults];

    // ── STEP 2: Place Details (phone, website, address, category) ─────────────
    if (fetchDetails) {
        report('details', 0, leads.length);

        const detailsMap = await fetchPlaceDetailsBatch(
            leads.map((l) => l.place_id),
            (done, total) => report('details', done, total)
        );

        leads = leads.map((lead) => {
            const d = detailsMap.get(lead.place_id);
            if (!d) return lead;
            return {
                ...lead,
                name: d.name || lead.name,
                website: d.website || lead.website,
                phone: d.phone || lead.phone,
                formatted_address: d.formatted_address || lead.formatted_address,
                category: d.category || lead.category,
            };
        });
    }

    // ── STEP 3: Email Extraction (optional, slow) ─────────────────────────────
    if (extractEmails) {
        const withSite = leads.filter((l) => l.website);
        report('emails', 0, withSite.length);

        let done = 0;
        for (const lead of leads) {
            if (lead.website) {
                lead.email = await extractEmailFromWebsite(lead.website);
                done++;
                report('emails', done, withSite.length);
                await delay(300); // be polite to remote servers
            }
        }
    }

    // ── STEP 4: Stats + format ────────────────────────────────────────────────
    const stats = {
        total: leads.length,
        withWebsite: leads.filter((l) => l.website).length,
        withPhone: leads.filter((l) => l.phone).length,
        withEmail: leads.filter((l) => l.email).length,
    };

    const formattedLeads = leads.map((l) => ({
        place_id: l.place_id,
        name: l.name,
        email: l.email || null,
        phone: l.phone || null,
        website: l.website || null,
        formatted_address: l.formatted_address || null,
        category: l.category || null,
        source: 'google_maps',
        relevanceScore: 65 + Math.floor(Math.random() * 30),
    }));

    console.log(`[GoogleMaps] Pipeline complete:`, stats);
    return { leads: formattedLeads, stats };
};
