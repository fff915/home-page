// 三个作品的展示信息与本地媒体资源。
export const featuredProject = {
  id: 'word-dengke',
  title: '单词登科',
  video: '/media/word-dengke-demo-v1.mp4',
  poster: '/media/word-dengke-poster.webp',
}

export const websiteProject = {
  id: 'tc888',
  number: '02',
  title: '赛事看板',
  url: 'https://tc888.one/',
  description: '足球篮球赛程与 AI 分析，一页查看。',
  desktopImage: '/media/tc888-home-820-20261013.jpg',
  mobileImage: '/media/tc888-home-390-20261013.jpg',
  capturedAt: '2026.10.13',
}

export const aquariumProject = {
  id: 'project-03',
  title: '桌面养鱼',
  description: '像素水族箱，养鱼、互动与繁殖。',
  slides: [
    { type: 'image', label: '水景', src: '/media/aquarium-water-v1.webp', fit: 'panorama', alt: '桌面养鱼游戏水景，像素鱼群在水草与沙石间游动' },
    { type: 'video', label: '小丑鱼', src: '/media/aquarium-clown-v1.mp4', alt: '小丑鱼点击互动的游戏内录制' },
    { type: 'video', label: '鲨鱼', src: '/media/aquarium-shark-v1.mp4', alt: '鲨鱼点击互动的游戏内录制' },
    { type: 'image', label: '收藏繁殖', src: '/media/aquarium-collection-v1.webp', fit: 'collection', alt: '鱼类收藏与繁殖界面，展示亲本栏和鱼卡仓库' },
  ],
}
