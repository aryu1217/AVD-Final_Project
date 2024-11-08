import locationRepository from './repository/LocationRepository.js';
import Location from './model/LocationModel.js';

// API 키를 서버에서 받아오기
fetch('/api-key')
  .then((response) => response.json())
  .then((data) => {
    const apiKey = data.apiKey;
    console.log('API Key:', apiKey); // API 키가 콘솔에 출력되는지 확인
    loadGoogleMaps(apiKey);
  })
  .catch((error) => console.error('API 키 가져오기 실패:', error));

let map;
let marker;
let geocoder;

// Google Maps API 로드 함수
function loadGoogleMaps(apiKey) {
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&libraries=places,geometry`;
  script.async = true;
  document.head.appendChild(script);
}

// 지도 초기화 함수
window.initMap = function () {
  const mapStyle = [
    {
      elementType: 'geometry',
      stylers: [
        {
          color: '#ebe3cd',
        },
      ],
    },
    {
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#523735',
        },
      ],
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [
        {
          color: '#f5f1e6',
        },
      ],
    },
    {
      featureType: 'administrative',
      elementType: 'geometry.stroke',
      stylers: [
        {
          color: '#c9b2a6',
        },
      ],
    },
    {
      featureType: 'administrative.land_parcel',
      elementType: 'geometry.stroke',
      stylers: [
        {
          color: '#dcd2be',
        },
      ],
    },
    {
      featureType: 'administrative.land_parcel',
      elementType: 'labels',
      stylers: [
        {
          visibility: 'off',
        },
      ],
    },
    {
      featureType: 'administrative.land_parcel',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#ae9e90',
        },
      ],
    },
    {
      featureType: 'landscape.natural',
      elementType: 'geometry',
      stylers: [
        {
          color: '#dfd2ae',
        },
      ],
    },
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [
        {
          color: '#dfd2ae',
        },
      ],
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#93817c',
        },
      ],
    },
    {
      featureType: 'poi.business',
      stylers: [
        {
          visibility: 'off',
        },
      ],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry.fill',
      stylers: [
        {
          color: '#a5b076',
        },
      ],
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text',
      stylers: [
        {
          visibility: 'off',
        },
      ],
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#447530',
        },
      ],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [
        {
          color: '#f5f1e6',
        },
      ],
    },
    {
      featureType: 'road.arterial',
      elementType: 'geometry',
      stylers: [
        {
          color: '#fdfcf8',
        },
      ],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [
        {
          color: '#f8c967',
        },
      ],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [
        {
          color: '#e9bc62',
        },
      ],
    },
    {
      featureType: 'road.highway.controlled_access',
      elementType: 'geometry',
      stylers: [
        {
          color: '#e98d58',
        },
      ],
    },
    {
      featureType: 'road.highway.controlled_access',
      elementType: 'geometry.stroke',
      stylers: [
        {
          color: '#db8555',
        },
      ],
    },
    {
      featureType: 'road.local',
      elementType: 'labels',
      stylers: [
        {
          visibility: 'off',
        },
      ],
    },
    {
      featureType: 'road.local',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#806b63',
        },
      ],
    },
    {
      featureType: 'transit.line',
      elementType: 'geometry',
      stylers: [
        {
          color: '#dfd2ae',
        },
      ],
    },
    {
      featureType: 'transit.line',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#8f7d77',
        },
      ],
    },
    {
      featureType: 'transit.line',
      elementType: 'labels.text.stroke',
      stylers: [
        {
          color: '#ebe3cd',
        },
      ],
    },
    {
      featureType: 'transit.station',
      elementType: 'geometry',
      stylers: [
        {
          color: '#dfd2ae',
        },
      ],
    },
    {
      featureType: 'water',
      elementType: 'geometry.fill',
      stylers: [
        {
          color: '#b9d3c2',
        },
      ],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#92998d',
        },
      ],
    },
  ];
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 8,
    center: { lat: 37.5665, lng: 126.978 }, // 서울을 중심으로 설정
    styles: mapStyle,
    disableDefaultUI: true,
  });

  geocoder = new google.maps.Geocoder(); // Geocoder 객체 생성

  // 기본 마커 설정
  marker = new google.maps.Marker({
    map,
  });
};

// 주소를 좌표로 변환하는 함수
window.geocodeLocation = function () {
  const address = document.getElementById('location-input').value;
  if (!address) {
    alert('Please enter a location.');
    return;
  }

  geocoder.geocode({ address: address }, (results, status) => {
    if (status === 'OK') {
      const locationData = results[0];
      const name = locationData.formatted_address;
      const latitude = locationData.geometry.location.lat();
      const longitude = locationData.geometry.location.lng();

      // Location 객체 생성 및 저장
      const location = new Location(name, latitude, longitude);
      locationRepository.add(location);

      addLocationCard(location);

      // 콘솔에 모든 저장된 Location 객체 출력
      console.log('저장된 Location 객체들:', locationRepository.getAll());

      // 지도 중심 설정 및 마커 표시
      map.setCenter(locationData.geometry.location);
      map.setZoom(14);
      marker.setPosition(locationData.geometry.location);
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
};

function addLocationCard(location) {
  const locationList = document.getElementById('location-list');

  // 카드 생성
  const card = document.createElement('div');
  card.classList.add('location-card');
  card.innerHTML = `
    <h3>${location.name}</h3>
    <p>위도: ${location.latitude}</p>
    <p>경도: ${location.longitude}</p>
    <button onclick="removeLocationCard('${location.name}', this)">삭제</button>
  `;

  // 카드 추가
  locationList.appendChild(card);
}

// 위치 카드 삭제 함수
window.removeLocationCard = function (name, button) {
  const card = button.parentElement;
  card.remove();

  locationRepository.delLocation(name); // 리포지토리에서 객체 삭제
  console.log('삭제된 후의 Location 객체들:', locationRepository.getAll()); // 확인용
};
