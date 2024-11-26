export default class Graph {
  constructor() {
    this.adjacencyList = {}; // 그래프의 인접 리스트 표현
  }

  // 노드 추가
  addNode(node) {
    if (!this.adjacencyList[node]) {
      this.adjacencyList[node] = [];
    }
  }

  // 간선 추가 (양방향)
  addEdge(node1, node2, weight) {
    // 중복된 간선이 있는지 확인
    if (
      this.adjacencyList[node1]?.some((edge) => edge.node === node2) ||
      this.adjacencyList[node2]?.some((edge) => edge.node === node1)
    ) {
      return; // 이미 간선이 존재하면 추가하지 않음
    }

    // 간선 추가
    this.adjacencyList[node1].push({ node: node2, weight });
    this.adjacencyList[node2].push({ node: node1, weight });
  }

  // 두 위치 간의 거리 계산 함수
  calculateDistance(location1, location2) {
    const R = 6371; // 지구의 반지름 (km)
    const dLat = ((location2.latitude - location1.latitude) * Math.PI) / 180;
    const dLon = ((location2.longitude - location1.longitude) * Math.PI) / 180;

    const lat1 = (location1.latitude * Math.PI) / 180;
    const lat2 = (location2.latitude * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // 두 위치 간 거리 (km)
  }

  // 그래프 출력 (확인용)
  printGraph() {
    for (let node in this.adjacencyList) {
      console.log(
        `${node} -> `,
        this.adjacencyList[node].map(
          (edge) =>
            `${edge.node} (${edge.weight ? edge.weight.toFixed(2) : "N/A"} km)`
        )
      );
    }
  }

  findShortestPath(startNode, endNode) {
    const distances = {};
    const previous = {};
    const priorityQueue = [];

    for (let node in this.adjacencyList) {
      distances[node] = Infinity;
      previous[node] = null;
    }

    distances[startNode] = 0;
    priorityQueue.push({ node: startNode, priority: 0 });

    while (priorityQueue.length > 0) {
      priorityQueue.sort((a, b) => a.priority - b.priority);
      const current = priorityQueue.shift().node;

      if (current === endNode) break;

      for (let neighbor of this.adjacencyList[current]) {
        const alt = distances[current] + neighbor.weight;

        if (alt < distances[neighbor.node]) {
          distances[neighbor.node] = alt;
          previous[neighbor.node] = current;
          priorityQueue.push({ node: neighbor.node, priority: alt });
        }
      }
    }

    const path = [];
    let currentNode = endNode;

    while (currentNode) {
      path.unshift(currentNode);
      currentNode = previous[currentNode];
    }

    return path.length > 1 ? path : [];
  }

  findOptimalPath(startNode, endNode, mandatoryNodes = []) {
    const fullPath = [];
    let currentNode = startNode;

    const allNodes = [...mandatoryNodes, endNode];
    for (let i = 0; i < allNodes.length; i++) {
      const nextNode = allNodes[i];
      const partialPath = this.findShortestPath(currentNode, nextNode);

      if (partialPath.length === 0) {
        console.warn(
          `"${currentNode}"에서 "${nextNode}"까지 경로를 찾을 수 없습니다.`
        );
        return [];
      }

      if (fullPath.length > 0) fullPath.pop();
      fullPath.push(...partialPath);

      currentNode = nextNode;
    }

    return fullPath;
  }
}
