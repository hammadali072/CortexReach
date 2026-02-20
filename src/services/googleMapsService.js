/**
 * googleMapsService.js — Logic for fetching business data using the CLASSIC Google Maps Places Service.
 */

let placesService = null;

const getPlacesService = () => {
    if (typeof window === 'undefined') throw new Error('Environment not supported');

    // Log presence of google object for debugging
    if (!window.google || !window.google.maps) {
        console.error('[GoogleMaps] SDK missing on window. If this persists, restart your Vite server and check index.html.');
        throw new Error('Google Maps SDK not loaded.');
    }

    if (!placesService) {
        try {
            const dummy = document.createElement('div');
            placesService = new window.google.maps.places.PlacesService(dummy);
        } catch (err) {
            console.error('[GoogleMaps] Failed to init Places Service:', err);
            throw new Error('Could not initialize Places Service.');
        }
    }
    return placesService;
};

/**
 * PHASE 3 — Google Places Search (Classic) 
 * With 10s Timeout protection
 */
export const searchPlaces = (keyword, location) => {
    console.log(`[GoogleMaps] Starting Search for: ${keyword} in ${location}`);

    return new Promise((resolve, reject) => {
        // 1. Timeout Guard: Reject if no response in 10 seconds
        const timeout = setTimeout(() => {
            console.error('[GoogleMaps] Search timed out after 10 seconds.');
            reject(new Error('Search timed out. Please check your API key and Internet connection.'));
        }, 10000);

        try {
            const service = getPlacesService();
            const request = {
                query: `${keyword} in ${location}`,
            };

            service.textSearch(request, (results, status) => {
                clearTimeout(timeout); // Clear timeout if we get a response
                console.log(`[GoogleMaps] Search Status: ${status}`);

                if (status === 'OK') {
                    console.log(`[GoogleMaps] Found ${results.length} results.`);
                    const mapped = results.map(place => ({
                        id: place.place_id,
                        place_id: place.place_id,
                        name: place.name,
                        formatted_address: place.formatted_address,
                        rating: place.rating || 0,
                        user_ratings_total: place.user_ratings_total || 0,
                    }));
                    resolve(mapped);
                } else if (status === 'ZERO_RESULTS') {
                    resolve([]);
                } else {
                    reject(new Error(`Google API Error: ${status}`));
                }
            });
        } catch (e) {
            clearTimeout(timeout);
            reject(e);
        }
    });
};

/**
 * PHASE 4 — Place Details (Classic)
 */
export const fetchPlaceDetails = (placeId) => {
    return new Promise((resolve) => {
        try {
            const service = getPlacesService();
            service.getDetails({
                placeId,
                fields: ['name', 'formatted_phone_number', 'website', 'formatted_address']
            }, (place, status) => {
                if (status === 'OK') {
                    resolve({
                        name: place.name,
                        website: place.website || null,
                        formatted_phone_number: place.formatted_phone_number || null,
                        formatted_address: place.formatted_address
                    });
                } else {
                    resolve(null);
                }
            });
        } catch (e) {
            resolve(null);
        }
    });
};

/**
 * PHASE 5 — Email Extraction (Simulated)
 */
export const extractEmailFromWebsite = (websiteUrl) => {
    if (!websiteUrl) return Promise.resolve(null);
    return new Promise((resolve) => {
        setTimeout(() => {
            const slug = websiteUrl.replace('https://', '').replace('http://', '').split('/')[0].split('.')[0];
            resolve(`contact@${slug}.com`);
        }, 1000);
    });
};
