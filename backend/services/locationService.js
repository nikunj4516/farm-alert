import axios from "axios";

const clean = (value) => String(value || "").trim();

const locationQuery = ({ village, taluka, district, state }) =>
  [village, taluka, district, state, "India"].map(clean).filter(Boolean).join(", ");

export class LocationService {
  static async getCoordinates({ village, taluka, district, state }) {
    const query = locationQuery({ village, taluka, district, state });
    if (!query) throw new Error("Location is required for weather lookup.");

    const response = await axios.get("https://geocoding-api.open-meteo.com/v1/search", {
      timeout: 12000,
      params: {
        name: query,
        count: 10,
        language: "en",
        format: "json",
      },
    });

    const locations = Array.isArray(response.data?.results) ? response.data.results : [];
    const match =
      locations.find((item) => item.country_code === "IN") ||
      locations.find((item) => item.country?.toLowerCase() === "india") ||
      locations[0];

    if (!match) throw new Error(`Could not resolve location: ${query}`);

    return {
      location: [match.name, match.admin3, match.admin2, match.admin1]
        .filter(Boolean)
        .filter((value, index, arr) => arr.indexOf(value) === index)
        .join(", "),
      latitude: Number(match.latitude),
      longitude: Number(match.longitude),
      source: "openmeteo-geocoding",
    };
  }

  static async reverseGeocode(latitude, longitude) {
    const response = await axios.get("https://geocoding-api.open-meteo.com/v1/reverse", {
      timeout: 12000,
      params: {
        latitude,
        longitude,
        language: "en",
        format: "json",
      },
    });

    const [match] = response.data?.results || [];
    return match
      ? {
          location: [match.name, match.admin3, match.admin2, match.admin1]
            .filter(Boolean)
            .join(", "),
          latitude: Number(match.latitude),
          longitude: Number(match.longitude),
        }
      : null;
  }

  static validateLocation(location) {
    return Number.isFinite(location?.latitude) && Number.isFinite(location?.longitude);
  }
}
