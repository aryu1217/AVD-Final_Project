class LocationRepository {
  constructor() {
    this.locations = []; // 배열 유지
  }

  // 새로운 Location 객체 추가
  add(location) {
    this.locations.push(location);
  }

  // 특정 이름으로 Location 객체 가져오기
  get(locationName) {
    return this.locations.find((location) => location.name === locationName);
  }

  // 모든 Location 객체 가져오기
  getAll() {
    return this.locations;
  }

  // 특정 이름으로 Location 객체 삭제
  delLocation(name) {
    this.locations = this.locations.filter(
      (location) => location.name !== name
    );
  }

  // 모든 Location 객체 삭제
  delAll() {
    this.locations = [];
  }
}

// LocationRepository 인스턴스를 내보내기 (Singleton 패턴 사용)
const locationRepository = new LocationRepository();
export default locationRepository;
