// API 키를 서버에서 받아오기
fetch("/api-key")
  .then((response) => response.json())
  .then((data) => {
    const apiKey = data.apiKey;
    console.log("API Key:", apiKey); // API 키가 콘솔에 출력되는지 확인
    loadGoogleMaps(apiKey);
  })
  .catch((error) => console.error("API 키 가져오기 실패:", error));

// Google Maps API 로드 함수
function loadGoogleMaps(apiKey) {
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&libraries=places`;
  script.async = true;
  document.head.appendChild(script);
}

// 지도 초기화 함수
function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 8,
    center: { lat: 37.5665, lng: 126.978 }, // 서울을 중심으로 설정
  });
  console.log("Google Maps API가 로드되었습니다.");
}
