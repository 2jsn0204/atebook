import botanicalShadowImg from '../assets/images/sample_botanical_shadow_1795738794811.jpg';
import coastalWalkImg from '../assets/images/sample_coastal_walk_1795738794925.jpg';
import morningCafeImg from '../assets/images/sample_morning_cafe_1795738793746.jpg';
import mountainDawnImg from '../assets/images/sample_mountain_dawn_1795738795190.jpg';
import { AlbumPhoto } from '../types/album';

export function createSamplePhotos(): AlbumPhoto[] {
  return [
    {
      id: 'sample-1',
      src: morningCafeImg,
      fileName: 'morning-cafe.jpg',
      title: '창가의 첫 커피와 기록',
      description:
        '아침 햇살이 길게 들어오는 조용한 카페 창가 자리. 따뜻한 도자기 잔 옆으로 펼쳐 둔 노트에 오늘의 첫 문장을 천천히 적어 내려갔다.',
      isObjectUrl: false,
      width: 1408,
      height: 1056,
    },
    {
      id: 'sample-2',
      src: coastalWalkImg,
      fileName: 'coastal-walk.jpg',
      title: '해질녘 해안 산책로',
      description:
        '바다 안개가 잔잔히 내려앉은 늦은 오후, 나무 데크를 따라 걸으며 수평선 너머로 번지는 옅은 노을빛을 오래 바라보았다.',
      isObjectUrl: false,
      width: 1408,
      height: 792,
    },
    {
      id: 'sample-3',
      src: botanicalShadowImg,
      fileName: 'botanical-shadow.jpg',
      title: '오후 네 시의 유칼립투스 그림자',
      description:
        '거친 회벽 위로 드리워진 나뭇잎의 선명한 윤곽. 빛의 각도가 조금씩 기울 때마다 방 안의 분위기도 함께 고요해진다.',
      isObjectUrl: false,
      width: 1056,
      height: 1408,
    },
    {
      id: 'sample-4',
      src: mountainDawnImg,
      fileName: 'mountain-dawn.jpg',
      title: '안개 낀 능선의 새벽빛',
      description:
        '겹겹이 이어진 산맥 사이로 푸른 새벽 안개가 머물던 순간. 능선 끝에서 올라오는 첫 빛이 차가운 공기를 부드럽게 감쌌다.',
      isObjectUrl: false,
      width: 1408,
      height: 1056,
    },
  ];
}
