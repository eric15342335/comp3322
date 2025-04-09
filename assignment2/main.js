"use strict";
/* global ol */ // Disable ESLint error for ol not defined

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const getStopEtaData = (stop_id) => {
    return fetch(`https://data.etabus.gov.hk/v1/transport/kmb/stop-eta/${stop_id}`)
        .then((response) => response.json());
};

const getStopListData = async () => {
    const cached_data = sessionStorage.getItem("kmbStopList");

    if (cached_data) {
        console.log("Using cached stop list data");
        return Promise.resolve(JSON.parse(cached_data));
    } else {
        console.log("Fetching stop list data from API");
        return await fetch("https://data.etabus.gov.hk/v1/transport/kmb/stop")
            .then((response) => response.json())
            .then((data) => {
                sessionStorage.setItem("kmbStopList", JSON.stringify(data));
                return data;
            });
    }
};

const stops_container = document.getElementById("stops-container");

const getUserPosition = () => {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            stops_container.innerHTML = `<div class="no-stops">Your browser does not support GeoLocation API</div>`;
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            () => {
                stops_container.innerHTML = `<div class="no-stops">GeoLocation API failed</div>`;
                return;
            },
        );
    });
};

let user_position = null;

const findNearbyStops = (stop_list_data, user_position, radius) => {
    const nearby_stops = [];

    for (const stop of stop_list_data.data) {
        const distance = calculateDistance(
            user_position.latitude,
            user_position.longitude,
            parseFloat(stop.lat),
            parseFloat(stop.long),
        );

        if (distance <= radius) {
            nearby_stops.push({
                ...stop,
                distance,
            });
        }
    }
    return nearby_stops.sort((a, b) => a.distance - b.distance);
};

const routes_container = document.getElementById("routes-container");

const displayRouteEtas = (eta_data) => {
    if (!eta_data.data || eta_data.data.length === 0) {
        routes_container.innerHTML = `<div class="no-routes">No bus route information</div>`;
        return;
    }

    const route_groups = {};
    const first_service_type = {};

    for (const eta of eta_data.data) {
        if (!eta.eta) continue;

        const route_dir_key = `${eta.route}_${eta.dir}`;
        
        if (!first_service_type[route_dir_key]) {
            first_service_type[route_dir_key] = eta.service_type;
        }
        
        if (eta.service_type !== first_service_type[route_dir_key]) {
            continue;
        }

        if (!route_groups[route_dir_key]) {
            route_groups[route_dir_key] = {
                route: eta.route,
                direction: eta.dir,
                service_type: eta.service_type,
                destination: eta.dest_en,
                etas: [],
            };
        }

        const existingEtaIndex = route_groups[route_dir_key].etas.findIndex(
            existing => existing.seq === eta.eta_seq
        );
        
        if (existingEtaIndex === -1) {
            route_groups[route_dir_key].etas.push({
                seq: eta.eta_seq,
                time: eta.eta,
            });
        }
    }

    const routes = Object.values(route_groups);

    if (routes.length === 0) {
        routes_container.innerHTML = `<div class="no-routes">No bus route information</div>`;
        return;
    }

    let html = "";

    for (const route of routes) {
        route.etas.sort((a, b) => a.seq - b.seq);

        html += `
            <div class="route-item">
                <div>
                    <span class="route-number">${route.route}</span>
                    <span class="route-destination">${route.destination}</span>
                </div>
                <div class="eta-list">
                    <span class="eta-label">ETA:</span>
        `;

        for (const eta of route.etas) {
            const eta_time = new Date(eta.time);
            html += `<span class="eta-time">${eta_time.toLocaleString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            })}</span>`;
        }

        html += `
                </div>
            </div>
        `;
    }

    routes_container.innerHTML = html;
};

let map = null;

const addMapMarkers = (user_position, stop_position) => {
    const user_coords = ol.proj.fromLonLat([
        user_position.longitude,
        user_position.latitude,
    ]);

    const stop_coords = ol.proj.fromLonLat([
        stop_position.longitude,
        stop_position.latitude,
    ]);
    const user_marker = new ol.Feature({
        geometry: new ol.geom.Point(user_coords),
    });
    const stop_marker = new ol.Feature({
        geometry: new ol.geom.Point(stop_coords),
    });
    
    user_marker.setStyle(
        new ol.style.Style({
            image: new ol.style.Icon({
                src: "map-marker.ico",
                scale: 1,
            }),
        }),
    );
    
    stop_marker.setStyle(
        new ol.style.Style({
            image: new ol.style.Icon({
                src: "bus-icon.ico",
                scale: 1,
            }),
        }),
    );
    const vector_source = new ol.source.Vector({
        features: [user_marker, stop_marker],
    });
    const vector_layer = new ol.layer.Vector({
        source: vector_source,
    });
    map.addLayer(vector_layer);
};

const map_container = document.getElementById("map-container");

const displayMap = (user_position, stop_position) => {
    map_container.innerHTML = "";

    const mid_lat = (user_position.latitude + stop_position.latitude) / 2;
    const mid_lon = (user_position.longitude + stop_position.longitude) / 2;

    const distance = calculateDistance(
        user_position.latitude,
        user_position.longitude,
        stop_position.latitude,
        stop_position.longitude,
    );

    let zoom = 18;
    if (distance > 400) zoom = 15;
    else if (distance > 200) zoom = 16;
    else if (distance > 100) zoom = 17;

    map = new ol.Map({
        target: "map-container",
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM(),
            }),
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([mid_lon, mid_lat]),
            zoom: zoom,
        }),
    });

    addMapMarkers(user_position, stop_position);
};

const details_container = document.getElementById("details-container");

const handleStopClick = (event) => {
    const stop_item = event.currentTarget;

    const stop_id = stop_item.dataset.stopId;
    const stop_lat = parseFloat(stop_item.dataset.lat);
    const stop_long = parseFloat(stop_item.dataset.long);

    document.querySelectorAll(".stop-item").forEach((item) => {
        item.classList.remove("selected");
    });

    stop_item.classList.add("selected");

    routes_container.innerHTML = `<div class="loading">Loading bus routes...</div>`;

    stop_item.after(details_container);

    details_container.classList.remove("hidden");

    map_container.scrollIntoView({ behavior: "smooth", block: "nearest" });

    getStopEtaData(stop_id).then((eta_data) => {
        displayRouteEtas(eta_data);

        displayMap(user_position, { latitude: stop_lat, longitude: stop_long });
    });
};

const displayNearbyStops = (stop_list_data, user_position, radius) => {
    const nearby_stops = findNearbyStops(
        stop_list_data,
        user_position,
        parseInt(radius),
    );

    if (nearby_stops.length === 0) {
        stops_container.innerHTML = `<div class="no-stops">Cannot locate nearby bus stops</div>`;
        return;
    }

    let html = "";

    for (const stop of nearby_stops) {
        html += `
            <div class="stop-item" data-stop-id="${stop.stop}" data-lat="${
            stop.lat
        }" data-long="${stop.long}" data-name="${
            stop.name_en
        }" data-distance="${Math.round(stop.distance)}">
                <span class="distance-label">Distance:</span> <span class="distance-value">${Math.round(
                    stop.distance,
                )}m</span> <span class="stop-label">Stop:</span> <span class="stop-name">${
            stop.name_en
        }</span>
            </div>
        `;
    }

    stops_container.innerHTML = html;

    document.querySelectorAll(".stop-item").forEach((item) => {
        item.addEventListener("click", handleStopClick);
    });
};

const handleRadiusChange = () => {
    if (!user_position) return;

    getStopListData().then((data) => {
        displayNearbyStops(data, user_position, radius_select.value);

        details_container.classList.add("hidden");
    });
};

const radius_select = document.getElementById("radius");

document.addEventListener("DOMContentLoaded", () => {
    getUserPosition()
        .then((position) => {
            user_position = position;
            return getStopListData();
        })
        .then((stop_list_data) => {
            displayNearbyStops(stop_list_data, user_position, radius_select.value);
        });
    radius_select.addEventListener("change", handleRadiusChange);
});
