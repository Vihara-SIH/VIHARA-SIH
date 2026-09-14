import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import geocodeHandler from './api/geocode.js';
import chatHandler from './api/chat.js';
import placesAutocompleteHandler from './api/places-autocomplete.js';
import placeDetailsHandler from './api/place-details.js';
import routesHandler from './api/routes.js';
import weatherHandler from './api/weather.js';
import placesNearbyHandler from './api/places-nearby.js';
import destinationCategoriesHandler from './api/destination-categories.js';
import sendItineraryHandler from './api/send-itinerary.js';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Populate process.env in Node dev server environment
  Object.assign(process.env, env);

  const routeMap = {
    '/api/geocode': geocodeHandler,
    '/api/chat': chatHandler,
    '/api/places-autocomplete': placesAutocompleteHandler,
    '/api/place-details': placeDetailsHandler,
    '/api/routes': routesHandler,
    '/api/weather': weatherHandler,
    '/api/places-nearby': placesNearbyHandler,
    '/api/destination-categories': destinationCategoriesHandler,
    '/api/send-itinerary': sendItineraryHandler
  };

  return {
    plugins: [
      react(),
      {
        name: 'api-serverless-dev-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
            const handler = routeMap[url.pathname];

            if (handler) {
              let body = '';
              req.on('data', (chunk) => {
                body += chunk;
              });
              req.on('end', async () => {
                try {
                  req.body = body ? JSON.parse(body) : {};
                } catch {
                  req.body = {};
                }
                req.query = Object.fromEntries(url.searchParams);

                res.status = (statusCode) => {
                  res.statusCode = statusCode;
                  return res;
                };
                res.json = (data) => {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                  return res;
                };

                try {
                  await handler(req, res);
                } catch (err) {
                  console.error(`[Vite Dev Middleware] ${url.pathname} error:`, err);
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: false, error: err.message }));
                }
              });
              return;
            }

            next();
          });
        }
      }
    ]
  };
});
