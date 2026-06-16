let map = null;
let markers = [];
let providerToMarkerMap = new Map();

function getBestAddress(provider) {
  const addresses = provider.PartyAddress || [];
  const best = addresses.find((a) => a.BestAddressIndicator === 'Yes');
  if (best) return best;
  if (addresses.length > 1) {
    return [...addresses].sort(
      (a, b) => parseFloat(a.DistanceInMiles || 9999) - parseFloat(b.DistanceInMiles || 9999),
    )[0];
  }
  return addresses[0] || {};
}

export function loadGoogleMapsAPI(apiKey) {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      const deadline = Date.now() + 10000;
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkInterval);
          resolve();
        } else if (Date.now() > deadline) {
          clearInterval(checkInterval);
          reject(new Error('Google Maps API load timeout'));
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps API'));

    document.head.appendChild(script);
  });
}

function getMarkerLetter(index) {
  return String.fromCharCode(65 + (index % 26));
}

export async function initializeMap(apiKey = null, containerEl = null) {
  try {
    if (apiKey) {
      await loadGoogleMapsAPI(apiKey);
    } else if (!window.google || !window.google.maps) {
      return null;
    }

    const mapContainer = containerEl || document.getElementById('provider-map');
    if (!mapContainer) return null;

    // eslint-disable-next-line no-undef
    map = new google.maps.Map(mapContainer, {
      zoom: 10,
      center: { lat: 40.7536854, lng: -73.9991637 },
      mapTypeId: 'roadmap',
      gestureHandling: 'cooperative',
      zoomControl: true,
      mapTypeControl: true,
      scaleControl: true,
      streetViewControl: true,
      rotateControl: false,
      fullscreenControl: true,
    });

    return map;
  } catch (error) {
    const mapToggle = document.querySelector('.fap-toggleMap');
    if (mapToggle) {
      mapToggle.style.display = 'none';
    }
    throw error;
  }
}

export function updateMapMarkers(providers, startIndex, markerFillColor = 'transparent', markerLabelColor = 'white') {
  // eslint-disable-next-line no-undef
  if (!map || typeof google === 'undefined') {
    return;
  }

  markers.forEach((marker) => marker.setMap(null));
  markers = [];

  // eslint-disable-next-line no-undef
  const bounds = new google.maps.LatLngBounds();
  let validMarkers = 0;

  // Group providers by address to identify duplicates
  const addressGroups = new Map();
  providerToMarkerMap = new Map();

  // First pass: Group providers by address
  providers.forEach((provider, index) => {
    const address = getBestAddress(provider);

    if (!address || !address.Latitude || !address.Longitude) {
      return;
    }

    const lat = parseFloat(address.Latitude);
    const lng = parseFloat(address.Longitude);

    if (
      Number.isNaN(lat)
      || Number.isNaN(lng)
      || lat < -90
      || lat > 90
      || lng < -180
      || lng > 180
    ) {
      return;
    }

    // Create address key for grouping
    const addressKey = `${address.AddressLine1}|${address.CityName}|${address.StateProvinceCode}|${address.PostalCode}`;

    if (!addressGroups.has(addressKey)) {
      addressGroups.set(addressKey, {
        firstIndex: index,
        position: { lat, lng },
        providers: [],
      });
    }

    addressGroups.get(addressKey).providers.push({ provider, index });
  });

  // Second pass: Create markers only for first occurrence of each address
  addressGroups.forEach(
    ({ firstIndex, position, providers: groupProviders }) => {
      const firstProvider = groupProviders[0];
      const address = getBestAddress(firstProvider.provider);
      const letter = getMarkerLetter(startIndex + firstIndex);
      const name = `${firstProvider.provider.PartyName}`;
      const degree = firstProvider.provider.HCPExtension?.DegreeCode || '';
      const fullName = `${name}${degree ? `, ${degree}` : ''}`;

      // eslint-disable-next-line no-undef
      const marker = new google.maps.Marker({
        position,
        map,
        title: `${letter}|${fullName}`,
        label: {
          text: letter,
          color: markerLabelColor,
          fontWeight: 'bold',
          fontSize: '14px',
        },
        icon: {
          path:
            'M12,2C8.13,2 5,5.13 5,9c0,5.25 7,13 7,13s7,-7.75 7,-13C19,5.13 15.87,2 12,2z',
          fillColor: markerFillColor,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 1,
          scale: 1.2,
          // eslint-disable-next-line no-undef
          anchor: new google.maps.Point(12, 24),
          // eslint-disable-next-line no-undef
          labelOrigin: new google.maps.Point(12, 9),
        },
      });

      // Create info window for the first provider initially
      const phone = firstProvider.provider.Communication?.find(
        (c) => c.CommunicationTypeCode === '203200' || c.CommunicationTypeDescription === 'Telephone',
      )?.CommunicationValueText || '';

      const infoContent = `
      <div class="gm-info-window">
        <div class="gm-info-window-content">
          <span class="gm-provider-name">
            ${fullName}
          </span>
          <div class="gm-provider-address">
            ${address.AddressLine1}<br>
            ${address.CityName}, ${address.StateProvinceCode} ${
  address.PostalCode
}
          </div>
          ${
  phone
    ? `<a href="tel:${phone}" class="gm-provider-phone">${phone}</a>`
    : ''
}
            <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${address.AddressLine1} ${address.CityName},${address.StateProvinceCode} ${address.PostalCode}`,
  )}"
               target="_blank" class="gm-provider-directions">Get Directions</a>
          </div>
        </div>
      </div>`;

      // eslint-disable-next-line no-undef
      const infoWindow = new google.maps.InfoWindow({
        content: infoContent,
      });

      marker.addListener('click', () => {
        markers.forEach((m) => {
          if (m.infoWindow) {
            m.infoWindow.close();
          }
        });
        infoWindow.open(map, marker);

        const listItems = document.querySelectorAll('.provider-list-item');
        listItems.forEach((item) => item.classList.remove('abbv-active'));
        if (listItems[firstIndex]) {
          listItems[firstIndex].classList.add('abbv-active');
          listItems[firstIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      });

      // Store the info window and method to update content
      marker.infoWindow = infoWindow;
      marker.updateInfoContent = (provider) => {
        const providerAddress = getBestAddress(provider);
        const providerName = `${provider.PartyName}`;
        const providerDegree = provider.HCPExtension?.DegreeCode || '';
        const providerFullName = `${providerName}${
          providerDegree ? `, ${providerDegree}` : ''
        }`;

        const providerPhoneNumber = provider.Communication?.find(
          (c) => c.CommunicationTypeCode === '203200' || c.CommunicationTypeDescription === 'Telephone',
        )?.CommunicationValueText || '';

        const newContent = `
        <div class="gm-info-window">
          <div class="gm-info-window-content">
            <span class="gm-provider-name">
              ${providerFullName}
            </span>
            <div class="gm-provider-address">
              ${providerAddress.AddressLine1}<br>
              ${providerAddress.CityName}, ${
  providerAddress.StateProvinceCode
} ${providerAddress.PostalCode}
            </div>
            ${
  providerPhoneNumber
    ? `<a href="tel:${providerPhoneNumber}" class="gm-provider-phone">${providerPhoneNumber}</a>`
    : ''
}
              <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${providerAddress.AddressLine1} ${providerAddress.CityName}, ${
      providerAddress.StateProvinceCode
    } ${providerAddress.PostalCode}`,
  )}"
                 target="_blank" class="gm-provider-directions">Get Directions</a>
            </div>
          </div>
        </div>`;

        marker.infoWindow.setContent(newContent);
      };

      // Map all providers in this group to this marker
      groupProviders.forEach(({ index }) => {
        providerToMarkerMap.set(index, marker);
      });

      markers.push(marker);
      bounds.extend(position);
      validMarkers += 1;
    },
  );

  if (validMarkers > 0) {
    map.fitBounds(bounds);
    // eslint-disable-next-line no-undef
    google.maps.event.addListenerOnce(
      map,
      'bounds_changed',
      function boundsChanged() {
        if (this.getZoom() > 15) {
          this.setZoom(15);
        }
      },
    );
  }
}

export function getMap() {
  return map;
}

export function getMarkers() {
  return markers;
}

export function getProviderToMarkerMap() {
  return providerToMarkerMap;
}
