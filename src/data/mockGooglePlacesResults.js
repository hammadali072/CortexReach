/**
 * mockGooglePlacesResults.js
 * Simulates the simplified payload returned by the Google Places Text Search API.
 * Shape mirrors the final backend response:
 *   { id, name, address, rating, phone, website }
 *
 * Used by GoogleMapsImportModal (Phase 2+) until the real Express proxy is wired in.
 */

const mockGooglePlacesResults = [
    {
        id: 'place_001',
        name: 'Apex Digital Marketing',
        address: '230 Park Ave, New York, NY 10169',
        rating: 4.8,
        phone: '+1 (212) 555-0181',
        website: 'https://apexdigital.com',
    },
    {
        id: 'place_002',
        name: 'BrightEdge Creative Studio',
        address: '75 Rockefeller Plaza, New York, NY 10019',
        rating: 4.5,
        phone: '+1 (212) 555-0204',
        website: 'https://brightedgestudio.io',
    },
    {
        id: 'place_003',
        name: 'NovaSpark Agency',
        address: '1 World Trade Center, New York, NY 10007',
        rating: 4.7,
        phone: '+1 (917) 555-0339',
        website: 'https://novaspark.agency',
    },
    {
        id: 'place_004',
        name: 'Meridian Growth Labs',
        address: '540 Madison Ave, New York, NY 10022',
        rating: 4.3,
        phone: '+1 (646) 555-0712',
        website: 'https://meridiangrowth.com',
    },
    {
        id: 'place_005',
        name: 'Pinnacle SEO Partners',
        address: '350 Fifth Ave, New York, NY 10118',
        rating: 4.6,
        phone: '+1 (212) 555-0945',
        website: 'https://pinnacleseo.co',
    },
    {
        id: 'place_006',
        name: 'Vortex Media Solutions',
        address: '114 W 47th St, New York, NY 10036',
        rating: 4.1,
        phone: '+1 (212) 555-0566',
        website: null, // No website — tests Phase 3 "No Website" badge
    },
    {
        id: 'place_007',
        name: 'Clickstream Analytics',
        address: '30 Hudson Yards, New York, NY 10001',
        rating: 4.9,
        phone: '+1 (646) 555-0871',
        website: 'https://clickstream.io',
    },
    {
        id: 'place_008',
        name: 'Fusion Digital Co.',
        address: '299 Park Ave, New York, NY 10171',
        rating: 3.9,
        phone: '+1 (212) 555-0234',
        website: 'https://fusiondigitalco.com',
    },
    {
        id: 'place_009',
        name: 'Skyline Brand Architects',
        address: '1600 Broadway, New York, NY 10019',
        rating: 4.4,
        phone: '+1 (917) 555-0456',
        website: 'https://skylinebrand.com',
    },
    {
        id: 'place_010',
        name: 'Catalyst Content Agency',
        address: '45 W 45th St, New York, NY 10036',
        rating: 4.2,
        phone: '+1 (212) 555-0677',
        website: 'https://catalystcontent.agency',
    },
    {
        id: 'place_011',
        name: 'Zeal Performance Marketing',
        address: '1440 Broadway, New York, NY 10018',
        rating: 4.7,
        phone: '+1 (646) 555-0122',
        website: 'https://zealperformance.com',
    },
    {
        id: 'place_012',
        name: 'Orbit SaaS Consultants',
        address: '825 Third Ave, New York, NY 10022',
        rating: 4.5,
        phone: '+1 (212) 555-0801',
        website: 'https://orbitsaas.com',
    },
    {
        id: 'place_013',
        name: 'Amplify B2B Group',
        address: '500 Seventh Ave, New York, NY 10018',
        rating: 4.0,
        phone: '+1 (212) 555-0358',
        website: null, // No website
    },
    {
        id: 'place_014',
        name: 'Zenith Growth Partners',
        address: '11 Penn Plaza, New York, NY 10001',
        rating: 4.6,
        phone: '+1 (917) 555-0993',
        website: 'https://zenithgrowth.io',
    },
    {
        id: 'place_015',
        name: 'Surge Digital Ventures',
        address: '641 Lexington Ave, New York, NY 10022',
        rating: 4.3,
        phone: '+1 (646) 555-0441',
        website: 'https://surgedigital.ventures',
    },
    {
        id: 'place_016',
        name: 'Momentum Ad Studio',
        address: '200 Park Ave S, New York, NY 10003',
        rating: 3.8,
        phone: '+1 (212) 555-0557',
        website: 'https://momentumads.studio',
    },
    {
        id: 'place_017',
        name: 'Bluepoint Marketing Hub',
        address: '345 Hudson St, New York, NY 10014',
        rating: 4.4,
        phone: '+1 (646) 555-0214',
        website: 'https://bluepointmktg.com',
    },
    {
        id: 'place_018',
        name: 'Codify Digital Agency',
        address: '244 W 54th St, New York, NY 10019',
        rating: 4.7,
        phone: '+1 (212) 555-0632',
        website: 'https://codifydigital.com',
    },
    {
        id: 'place_019',
        name: 'Luminary Outreach Co.',
        address: '460 Park Ave, New York, NY 10022',
        rating: 4.5,
        phone: '+1 (917) 555-0789',
        website: 'https://luminaryoutreach.co',
    },
    {
        id: 'place_020',
        name: 'Spectrum Growth Studio',
        address: '120 W 45th St, New York, NY 10036',
        rating: 4.2,
        phone: '+1 (646) 555-0366',
        website: 'https://spectrumgrowth.studio',
    },
];

export default mockGooglePlacesResults;
