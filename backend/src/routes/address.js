import { Hono } from 'hono';

const addressRouter = new Hono();

/**
 * GET /api/address/search?q=query&limit=5
 * Search for French addresses using the official French address API
 * This acts as a proxy to avoid CORS issues
 */
addressRouter.get('/search', async (c) => {
  try {
    const query = c.req.query('q');
    const limit = c.req.query('limit') || '5';
    const type = c.req.query('type') || 'housenumber'; // housenumber, street, locality, municipality

    if (!query || query.trim().length < 3) {
      return c.json({
        success: false,
        message: 'La requête doit contenir au moins 3 caractères',
        data: []
      }, 400);
    }

    // Build the API URL for the French address API
    const apiUrl = new URL('https://api-adresse.data.gouv.fr/search/');
    apiUrl.searchParams.append('q', query.trim());
    apiUrl.searchParams.append('limit', limit);
    apiUrl.searchParams.append('type', type);
    
    // Add autocomplete parameter for better results
    apiUrl.searchParams.append('autocomplete', '1');

    console.log(`Fetching addresses from: ${apiUrl.toString()}`);

    // Fetch from the French address API
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'IT13-TechnicianApp/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Address API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Transform the response to a more frontend-friendly format
    const transformedFeatures = data.features?.map(feature => ({
      id: feature.properties.id,
      label: feature.properties.label,
      name: feature.properties.name,
      postcode: feature.properties.postcode,
      citycode: feature.properties.citycode,
      city: feature.properties.city,
      context: feature.properties.context,
      type: feature.properties.type,
      importance: feature.properties.importance,
      coordinates: feature.geometry.coordinates, // [longitude, latitude]
      // Additional structured data
      housenumber: feature.properties.housenumber,
      street: feature.properties.street,
      district: feature.properties.district,
      county: feature.properties.county,
      state: feature.properties.state
    })) || [];

    return c.json({
      success: true,
      message: `${transformedFeatures.length} adresse(s) trouvée(s)`,
      data: transformedFeatures,
      query: query,
      limit: parseInt(limit)
    });

  } catch (error) {
    console.error('Error fetching addresses:', error);
    return c.json({
      success: false,
      message: 'Erreur lors de la recherche d\'adresses',
      error: error.message,
      data: []
    }, 500);
  }
});

/**
 * GET /api/address/reverse?lat=latitude&lon=longitude
 * Reverse geocoding - get address from coordinates
 */
addressRouter.get('/reverse', async (c) => {
  try {
    const lat = c.req.query('lat');
    const lon = c.req.query('lon');

    if (!lat || !lon) {
      return c.json({
        success: false,
        message: 'Les coordonnées latitude et longitude sont requises',
        data: null
      }, 400);
    }

    // Validate coordinates
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return c.json({
        success: false,
        message: 'Coordonnées invalides',
        data: null
      }, 400);
    }

    // Check if coordinates are within France bounds (approximate)
    if (latitude < 41.0 || latitude > 51.5 || longitude < -5.5 || longitude > 10.0) {
      return c.json({
        success: false,
        message: 'Les coordonnées doivent être en France',
        data: null
      }, 400);
    }

    // Build the API URL for reverse geocoding
    const apiUrl = new URL('https://api-adresse.data.gouv.fr/reverse/');
    apiUrl.searchParams.append('lat', latitude.toString());
    apiUrl.searchParams.append('lon', longitude.toString());

    console.log(`Reverse geocoding: ${apiUrl.toString()}`);

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'IT13-TechnicianApp/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Address API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Transform the response
    const transformedFeatures = data.features?.map(feature => ({
      id: feature.properties.id,
      label: feature.properties.label,
      name: feature.properties.name,
      postcode: feature.properties.postcode,
      citycode: feature.properties.citycode,
      city: feature.properties.city,
      context: feature.properties.context,
      type: feature.properties.type,
      distance: feature.properties.distance,
      coordinates: feature.geometry.coordinates,
      housenumber: feature.properties.housenumber,
      street: feature.properties.street,
      district: feature.properties.district,
      county: feature.properties.county,
      state: feature.properties.state
    })) || [];

    return c.json({
      success: true,
      message: transformedFeatures.length > 0 ? 'Adresse trouvée' : 'Aucune adresse trouvée',
      data: transformedFeatures[0] || null, // Return the closest address
      coordinates: { latitude, longitude }
    });

  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    return c.json({
      success: false,
      message: 'Erreur lors de la géolocalisation inverse',
      error: error.message,
      data: null
    }, 500);
  }
});

/**
 * GET /api/address/validate
 * Validate a complete French address
 */
addressRouter.get('/validate', async (c) => {
  try {
    const address = c.req.query('address');
    const postcode = c.req.query('postcode');
    const city = c.req.query('city');

    if (!address && !postcode && !city) {
      return c.json({
        success: false,
        message: 'Au moins un paramètre d\'adresse est requis',
        data: null
      }, 400);
    }

    // Build search query
    let searchQuery = '';
    if (address) searchQuery += address + ' ';
    if (postcode) searchQuery += postcode + ' ';
    if (city) searchQuery += city;

    const apiUrl = new URL('https://api-adresse.data.gouv.fr/search/');
    apiUrl.searchParams.append('q', searchQuery.trim());
    apiUrl.searchParams.append('limit', '1');

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'IT13-TechnicianApp/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Address API responded with status: ${response.status}`);
    }

    const data = await response.json();
    const isValid = data.features && data.features.length > 0;
    const validatedAddress = isValid ? {
      id: data.features[0].properties.id,
      label: data.features[0].properties.label,
      postcode: data.features[0].properties.postcode,
      city: data.features[0].properties.city,
      coordinates: data.features[0].geometry.coordinates,
      score: data.features[0].properties.score
    } : null;

    return c.json({
      success: true,
      message: isValid ? 'Adresse valide' : 'Adresse non trouvée',
      data: {
        isValid,
        address: validatedAddress,
        searchQuery: searchQuery.trim()
      }
    });

  } catch (error) {
    console.error('Error validating address:', error);
    return c.json({
      success: false,
      message: 'Erreur lors de la validation de l\'adresse',
      error: error.message,
      data: null
    }, 500);
  }
});

export default addressRouter; 