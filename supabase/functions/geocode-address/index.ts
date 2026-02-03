import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { address } = await req.json();

    if (!address || typeof address !== 'string') {
      console.error('Invalid address provided:', address);
      return new Response(
        JSON.stringify({ error: 'Address is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('VITE_GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
      console.error('Google Maps API key not configured');
      return new Response(
        JSON.stringify({ error: 'Geocoding service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Geocoding address:', address);

    const encodedAddress = encodeURIComponent(address);
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}&region=br&language=pt-BR`;

    const response = await fetch(geocodeUrl);
    const data = await response.json();

    console.log('Geocoding response status:', data.status);

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      console.log('Geocoding success:', location);
      
      return new Response(
        JSON.stringify({ 
          lat: location.lat, 
          lng: location.lng,
          formatted_address: data.results[0].formatted_address 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (data.status === 'ZERO_RESULTS') {
      console.warn('No results found for address:', address);
      return new Response(
        JSON.stringify({ error: 'Endereço não encontrado. Verifique os dados.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.error('Geocoding API error:', data.status, data.error_message);
    return new Response(
      JSON.stringify({ error: `Geocoding failed: ${data.status}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Geocoding error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
