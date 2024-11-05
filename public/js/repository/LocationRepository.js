class LocationRepository {
  constructor() {
    this.locations = []; // Location 객체들을 저장할 배열
  }

  // 새로운 Location 객체 추가
  add(location) {
    this.locations.push(location);
  }

  // 모든 Location 객체 가져오기
  getAll() {
    return this.locations;
  }
}

// LocationRepository 인스턴스를 내보내기 (Singleton 패턴 사용)
const locationRepository = new LocationRepository();
export default locationRepository;
