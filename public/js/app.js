import locationRepository from "./repository/LocationRepository.js";
import Location from "./model/LocationModel.js";
// app.js
// API 키를 서버에서 받아오기
fetch("/api-key")
  .then((response) => response.json())
  .then((data) => {
    const apiKey = data.apiKey;
    console.log("API Key:", apiKey); // API 키가 콘솔에 출력되는지 확인
    loadGoogleMaps(apiKey);
  })
  .catch((error) => console.error("API 키 가져오기 실패:", error));

let map;
let marker;
let geocoder;
let autocomplete;
let startNode = null;
let endNode = null;
const preferences = {}; // 지역별 선호도를 저장
let polyline; // 지도에 표시할 Polyline 객체
let directionsService; // Directions API 서비스
let directionsRenderer; // 경로 시각화 렌더러

// Google Maps API 로드 함수
function loadGoogleMaps(apiKey) {
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&libraries=places,geometry`;
  script.async = true;
  document.head.appendChild(script);
}
function extractLocationName(place) {
  // 장소 이름이 있으면 우선적으로 사용
  if (place.name) {
    return place.name;
  }
  // 전체 주소에서 간단한 부분 추출
  if (place.formatted_address) {
    return place.formatted_address.split(",")[0];
  }
  // 기본 이름 반환
  return "알 수 없는 위치";
}

// 지도 초기화 함수
window.initMap = function () {
  const mapStyle = [
    {
      elementType: "geometry",
      stylers: [
        {
          color: "#ebe3cd",
        },
      ],
    },
    {
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#523735",
        },
      ],
    },
    {
      elementType: "labels.text.stroke",
      stylers: [
        {
          color: "#f5f1e6",
        },
      ],
    },
    {
      featureType: "administrative",
      elementType: "geometry.stroke",
      stylers: [
        {
          color: "#c9b2a6",
        },
      ],
    },
    {
      featureType: "administrative.land_parcel",
      elementType: "geometry.stroke",
      stylers: [
        {
          color: "#dcd2be",
        },
      ],
    },
    {
      featureType: "administrative.land_parcel",
      elementType: "labels",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "administrative.land_parcel",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#ae9e90",
        },
      ],
    },
    {
      featureType: "landscape.natural",
      elementType: "geometry",
      stylers: [
        {
          color: "#dfd2ae",
        },
      ],
    },
    {
      featureType: "poi",
      elementType: "geometry",
      stylers: [
        {
          color: "#dfd2ae",
        },
      ],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#93817c",
        },
      ],
    },
    {
      featureType: "poi.business",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "poi.park",
      elementType: "geometry.fill",
      stylers: [
        {
          color: "#a5b076",
        },
      ],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#447530",
        },
      ],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [
        {
          color: "#f5f1e6",
        },
      ],
    },
    {
      featureType: "road.arterial",
      elementType: "geometry",
      stylers: [
        {
          color: "#fdfcf8",
        },
      ],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [
        {
          color: "#f8c967",
        },
      ],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [
        {
          color: "#e9bc62",
        },
      ],
    },
    {
      featureType: "road.highway.controlled_access",
      elementType: "geometry",
      stylers: [
        {
          color: "#e98d58",
        },
      ],
    },
    {
      featureType: "road.highway.controlled_access",
      elementType: "geometry.stroke",
      stylers: [
        {
          color: "#db8555",
        },
      ],
    },
    {
      featureType: "road.local",
      elementType: "labels",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "road.local",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#806b63",
        },
      ],
    },
    {
      featureType: "transit.line",
      elementType: "geometry",
      stylers: [
        {
          color: "#dfd2ae",
        },
      ],
    },
    {
      featureType: "transit.line",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#8f7d77",
        },
      ],
    },
    {
      featureType: "transit.line",
      elementType: "labels.text.stroke",
      stylers: [
        {
          color: "#ebe3cd",
        },
      ],
    },
    {
      featureType: "transit.station",
      elementType: "geometry",
      stylers: [
        {
          color: "#dfd2ae",
        },
      ],
    },
    {
      featureType: "water",
      elementType: "geometry.fill",
      stylers: [
        {
          color: "#b9d3c2",
        },
      ],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#92998d",
        },
      ],
    },
  ];
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 10,
    center: { lat: 37.5665, lng: 126.978 }, // 서울을 중심으로 설정
    styles: mapStyle,
    disableDefaultUI: true,
  });

  geocoder = new google.maps.Geocoder();

  // 기본 마커 설정
  marker = new google.maps.Marker({
    map: map,
  });

  // 자동완성 기능 추가
  const input = document.getElementById("location-input");
  autocomplete = new google.maps.places.Autocomplete(input, {
    fields: ["geometry", "name", "formatted_address"],
  });

  // 자동완성 선택 처리
  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (!place.geometry || !place.geometry.location) {
      console.log("해당 위치를 찾을 수 없습니다.");
      return;
    }

    // 지역 이름 추출
    const locationName = place.name || place.formatted_address.split(",")[0];
    const latitude = place.geometry.location.lat();
    const longitude = place.geometry.location.lng();

    // Location 객체 생성 및 저장
    const location = new Location(locationName, latitude, longitude);
    locationRepository.add(location);

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    // 카드 추가
    addLocationCard(location);

    console.log("저장된 Location 객체들:", locationRepository.getAll());

    // 지도 중심 설정 및 마커 표시
    map.setCenter(place.geometry.location);
    map.setZoom(14);
    marker.setPosition(place.geometry.location);
  });
};

// 주소를 좌표로 변환하는 함수
window.geocodeLocation = function () {
  const address = document.getElementById("location-input").value;
  if (!address) {
    alert("Please enter a location.");
    return;
  }

  geocoder.geocode({ address: address }, (results, status) => {
    if (status === "OK") {
      const locationData = results[0];

      // 지역 이름 추출
      const name = extractLocationName(locationData);
      const latitude = locationData.geometry.location.lat();
      const longitude = locationData.geometry.location.lng();

      // Location 객체 생성 및 저장
      const location = new Location(name, latitude, longitude);
      locationRepository.add(location);

      // 카드 추가
      addLocationCard(location);

      console.log("저장된 Location 객체들:", locationRepository.getAll());

      // 지도 중심 설정 및 마커 표시
      map.setCenter(locationData.geometry.location);
      map.setZoom(14);
      marker.setPosition(locationData.geometry.location);
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
};

function addLocationCard(location) {
  const locationList = document.getElementById("location-list");

  // 카드 생성
  const card = document.createElement("div");
  card.classList.add("location-card");
  card.innerHTML = `
    <h3>${location.name}</h3>
    <p>위도: ${location.latitude}</p>
    <p>경도: ${location.longitude}</p>
    
    <!-- 선호도 슬라이더 추가 -->
    <label for="${location.name}-preference">선호도:</label>
    <input id="${location.name}-preference" type="range" min="1" max="10" value="5" 
      oninput="updatePreference('${location.name}', this.value)" />
    <span id="${location.name}-preference-value">5</span>
    
    <!-- 기존 버튼들 -->
    <div class="button-container">
      <button onclick="setAsStart('${location.name}')">출발지로 설정</button>
      <button onclick="setAsEnd('${location.name}')">도착지로 설정</button>
      <button onclick="removeLocationCard('${location.name}', this)">삭제</button>
    </div>
  `;

  // 카드 추가
  locationList.appendChild(card);

  // 기본 선호도를 저장
  preferences[location.name] = 5; // 기본값 5
}

// 선호도 업데이트 함수
window.updatePreference = function (locationName, value) {
  preferences[locationName] = parseInt(value);
  const valueDisplay = document.getElementById(
    `${locationName}-preference-value`
  );
  valueDisplay.innerText = value;
  console.log(`${locationName} 지역 선호도 업데이트: ${value}`);
};

// 위치 카드 삭제 함수
window.removeLocationCard = function (locationName, button) {
  // 버튼의 부모 요소 중 카드 전체를 선택
  const card = button.closest(".location-card");

  // 카드 삭제
  if (card) {
    card.remove();
    console.log(`"${locationName}" 카드가 삭제되었습니다.`);
  }

  // LocationRepository에서 해당 지역 제거
  locationRepository.delLocation(locationName);

  // 출발지 또는 도착지가 삭제된 경우 초기화
  if (locationName === startNode) {
    startNode = null; // NULL 대신 null 사용
    console.log("출발지가 초기화되었습니다.");
  }
  if (locationName === endNode) {
    endNode = null;
    console.log("도착지가 초기화되었습니다.");
  }

  // 남은 Location 객체 출력
  console.log("삭제 후 남은 Location 객체들:", locationRepository.getAll());
};

import Graph from "./model/Graph.js";

const locationGraph = new Graph();

// 출발지 설정
window.setAsStart = function (locationName) {
  startNode = locationName;
  console.log(`현재 출발지: ${startNode}`);
};

// 도착지 설정
window.setAsEnd = function (locationName) {
  endNode = locationName;
  console.log(`현재 도착지: ${endNode}`);
};

// 그래프 자동 생성 (거리 기반 + 선호도 반영)
function autoGenerateGraph() {
  const locations = locationRepository.getAll();

  if (locations.length < 2) {
    console.log("노드가 2개 이상 있어야 그래프를 생성할 수 있습니다.");
    return;
  }

  locationGraph.clear(); // 기존 그래프 초기화

  locations.forEach((location) => {
    locationGraph.addNode(location.name);
  });

  locations.forEach((loc1) => {
    const nearest = locations
      .filter((loc2) => loc1.name !== loc2.name)
      .map((loc2) => ({
        name: loc2.name,
        distance: locationGraph.calculateDistance(loc1, loc2),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);

    nearest.forEach((neighbor) => {
      const preferenceA = preferences[loc1.name] || 5;
      const preferenceB = preferences[neighbor.name] || 5;
      const adjustedWeight = locationGraph.calculateAdjustedWeight(
        neighbor.distance,
        preferenceA,
        preferenceB
      );
      locationGraph.addEdge(loc1.name, neighbor.name, adjustedWeight);
    });
  });

  console.log("그래프 생성 완료 (선호도 반영):");
  locationGraph.printGraph();
}
// 선호도 변경 시 자동 반영
window.updatePreference = function (locationName, value) {
  preferences[locationName] = parseInt(value);
  document.getElementById(`${locationName}-preference-value`).innerText = value;
  console.log(`${locationName} 지역 선호도: ${value}`);

  // 선호도 변경 후 그래프 재생성
  autoGenerateGraph();
};

// 다익스트라 실행
window.findOptimalPath = function () {
  autoGenerateGraph(); // 그래프 생성

  if (!startNode || !endNode) {
    alert("출발지와 도착지를 설정하세요.");
    return;
  }

  const optimalPath = locationGraph.findShortestPath(startNode, endNode);

  if (optimalPath.length === 0) {
    alert("경로를 찾을 수 없습니다.");
  } else {
    alert(`최적 경로: ${optimalPath.join(" → ")}`);
    console.log("최적 경로:", optimalPath);
  }
};

// 모든 경로 탐색 (DFS)
window.findAllPaths = function () {
  autoGenerateGraph(); // 그래프 생성

  if (!startNode || !endNode) {
    alert("출발지와 도착지를 설정하세요.");
    return;
  }

  const allPaths = locationGraph.findAllPathsDFS(startNode, endNode);
  console.log("모든 가능한 경로:", allPaths);

  if (allPaths.length === 0) {
    alert("경로를 찾을 수 없습니다.");
  } else {
    alert(`모든 경로 개수: ${allPaths.length}`);
  }
};

// 경로 시각화 함수
window.visualizePath = function () {
  if (!startNode || !endNode) {
    alert("출발지와 도착지를 설정하세요.");
    return;
  }

  // 선택한 이동 모드 가져오기
  const travelMode = document.querySelector(
    'input[name="travelMode"]:checked'
  ).value;

  const request = {
    origin: startNode, // 출발지
    destination: endNode, // 도착지
    travelMode: google.maps.TravelMode[travelMode], // TRANSIT 또는 WALKING
  };

  console.log("출발지:", startNode);
  console.log("도착지:", endNode);
  console.log("선택된 이동 모드:", travelMode);

  // Directions API 요청
  directionsService.route(request, (result, status) => {
    if (status === "OK") {
      directionsRenderer.setDirections(result); // 지도에 경로 표시
      console.log("경로 데이터:", result);
    } else if (status === "ZERO_RESULTS") {
      alert(
        "현재 설정된 이동 모드로 경로를 찾을 수 없습니다. 다른 이동 모드를 선택하세요."
      );
      console.error("ZERO_RESULTS: 경로가 존재하지 않습니다.");
    } else {
      alert("경로를 가져오는 중 오류가 발생했습니다.");
      console.error("Directions API 오류 상태:", status);
    }
  });
};
