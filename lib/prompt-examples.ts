export interface PromptExample {
  id: string;
  category: string;
  title: string;
  prompt: string;
  tags: string;
  description: string;
}

export const promptExamples: PromptExample[] = [
  // 氛围音乐
  {
    id: 'ambient-1',
    category: '氛围音乐',
    title: '夏日海滩',
    prompt: '夏日海滩氛围音乐，轻松愉快的旋律，海浪声作为背景，温暖的吉他和钢琴',
    tags: '海滩, 轻松, 氛围音乐, 夏日',
    description: '适合放松、冥想或工作背景音乐',
  },
  {
    id: 'ambient-2',
    category: '氛围音乐',
    title: '雨夜咖啡馆',
    prompt: '下雨天的咖啡馆氛围音乐，温柔的钢琴旋律，雨声和咖啡机的声音作为背景',
    tags: '雨天, 咖啡馆, 钢琴, 温柔',
    description: '营造温馨舒适的氛围',
  },
  {
    id: 'ambient-3',
    category: '氛围音乐',
    title: '深夜学习',
    prompt: '深夜学习专注音乐，Lo-Fi hip hop节奏，温暖的合成器pad，vinyl唱片质感',
    tags: 'Lo-Fi, 学习, 专注, 深夜',
    description: '帮助集中注意力的背景音乐',
  },

  // 电子音乐
  {
    id: 'electronic-1',
    category: '电子音乐',
    title: '赛博朋克之城',
    prompt: '赛博朋克风格电子音乐，充满未来感的合成器音色，强劲的低音，霓虹灯般的氛围',
    tags: '赛博朋克, 电子, 未来感, 合成器',
    description: '科幻感十足的电子音乐',
  },
  {
    id: 'electronic-2',
    category: '电子音乐',
    title: '热带浩室',
    prompt: '热带浩室音乐，轻快的节奏，马林巴木琴，加勒比风情，度假氛围',
    tags: '浩室, 热带, 度假, 轻快',
    description: '充满阳光感的电子舞曲',
  },
  {
    id: 'electronic-3',
    category: '电子音乐',
    title: '太空探索',
    prompt: '太空主题的ambient techno，空灵的合成器pad，深沉的bass，宇宙般的氛围',
    tags: '太空, techno, 宇宙, 空灵',
    description: '带你遨游宇宙的电子音乐',
  },

  // 古典音乐
  {
    id: 'classical-1',
    category: '古典音乐',
    title: '史诗交响乐',
    prompt: '史诗级交响乐，气势磅礴的管弦乐编排，铜管乐器的号角，宏大的弦乐部分',
    tags: '交响乐, 史诗, 管弦乐, 宏大',
    description: '适合电影配乐或重要场合',
  },
  {
    id: 'classical-2',
    category: '古典音乐',
    title: '浪漫钢琴曲',
    prompt: '浪漫主义风格的钢琴独奏，肖邦般的优美旋律，细腻的情感表达',
    tags: '钢琴, 浪漫, 古典, 独奏',
    description: '优雅动人的钢琴小品',
  },
  {
    id: 'classical-3',
    category: '古典音乐',
    title: '巴洛克室内乐',
    prompt: '巴洛克风格室内乐，大提琴和小提琴二重奏，复调音乐织体，优雅精致',
    tags: '巴洛克, 室内乐, 大提琴, 小提琴',
    description: '精致的古典音乐',
  },

  // 爵士音乐
  {
    id: 'jazz-1',
    category: '爵士音乐',
    title: '爵士咖啡馆',
    prompt: '轻松的爵士咖啡馆背景音乐，钢琴和萨克斯风，swing节奏，温暖的氛围',
    tags: '爵士, 咖啡馆, 钢琴, 萨克斯',
    description: '营造优雅的咖啡馆氛围',
  },
  {
    id: 'jazz-2',
    category: '爵士音乐',
    title: '蓝调之夜',
    prompt: '深情的蓝调音乐，电吉他的蓝调音阶，低沉的萨克斯，忧郁而深沉',
    tags: '蓝调, 吉他, 萨克斯, 忧郁',
    description: '深夜听的蓝调音乐',
  },
  {
    id: 'jazz-3',
    category: '爵士音乐',
    title: 'Bebop即兴',
    prompt: 'Bebop风格的快速爵士乐，复杂的和声进行，即兴独奏，充满活力',
    tags: 'Bebop, 即兴, 快节奏, 爵士',
    description: '充满技巧的现代爵士',
  },

  // 摇滚音乐
  {
    id: 'rock-1',
    category: '摇滚音乐',
    title: '激励摇滚',
    prompt: '激励人心的摇滚音乐，强劲的电吉他riff，有力的鼓点，充满能量',
    tags: '摇滚, 激励, 电吉他, 能量',
    description: '充满力量的摇滚乐',
  },
  {
    id: 'rock-2',
    category: '摇滚音乐',
    title: '后摇实验',
    prompt: '后摇滚风格，渐进式的情感积累，延迟效果的吉他，从安静到爆发',
    tags: '后摇, 实验, 情感, 渐进',
    description: '充满情感张力的后摇',
  },
  {
    id: 'rock-3',
    category: '摇滚音乐',
    title: '朋克能量',
    prompt: '快节奏朋克摇滚，简单直接的和弦进行，叛逆的态度，充满活力',
    tags: '朋克, 快节奏, 叛逆, 能量',
    description: '原始而有力的朋克音乐',
  },

  // 中国风
  {
    id: 'chinese-1',
    category: '中国风',
    title: '古风意境',
    prompt: '中国风古典音乐，使用古筝和二胡，竹笛点缀，江南水乡的意境',
    tags: '中国风, 古典, 古筝, 二胡',
    description: '传统民乐风格',
  },
  {
    id: 'chinese-2',
    category: '中国风',
    title: '武侠江湖',
    prompt: '武侠主题音乐，激昂的唢呐，铿锵的鼓点，琵琶的急促弹奏，江湖豪情',
    tags: '武侠, 唢呐, 琵琶, 豪情',
    description: '充满江湖气息的音乐',
  },
  {
    id: 'chinese-3',
    category: '中国风',
    title: '现代国风',
    prompt: '现代中国风流行音乐，传统乐器与电子音乐结合，古筝配合电子节拍',
    tags: '国风, 流行, 电子, 融合',
    description: '传统与现代的完美结合',
  },

  // 流行音乐
  {
    id: 'pop-1',
    category: '流行音乐',
    title: '清新民谣',
    prompt: '清新的民谣风格，木吉他伴奏，温暖的人声，简单真挚的旋律',
    tags: '民谣, 吉他, 清新, 温暖',
    description: '治愈系民谣音乐',
  },
  {
    id: 'pop-2',
    category: '流行音乐',
    title: 'R&B律动',
    prompt: '现代R&B风格，性感的groove，smooth的合成器，都市夜晚的氛围',
    tags: 'R&B, groove, 都市, 性感',
    description: '充满律动感的R&B',
  },
  {
    id: 'pop-3',
    category: '流行音乐',
    title: 'Indie流行',
    prompt: 'Indie流行风格，独特的编曲，合成器与吉他的融合，现代而独立',
    tags: 'Indie, 流行, 独立, 现代',
    description: '独立音乐人风格',
  },

  // 游戏配乐
  {
    id: 'game-1',
    category: '游戏配乐',
    title: '8bit复古',
    prompt: '8bit复古游戏音乐，芯片音乐风格，像素游戏的氛围，活泼欢快',
    tags: '8bit, 复古, 游戏, 芯片音乐',
    description: '经典像素游戏音乐',
  },
  {
    id: 'game-2',
    category: '游戏配乐',
    title: 'RPG冒险',
    prompt: 'RPG游戏冒险主题，管弦乐编排，史诗感的旋律，适合探索和战斗',
    tags: 'RPG, 冒险, 管弦乐, 史诗',
    description: '角色扮演游戏配乐',
  },
  {
    id: 'game-3',
    category: '游戏配乐',
    title: '悬疑解谜',
    prompt: '悬疑解谜游戏音乐，神秘的氛围，钢琴和弦乐，紧张感逐渐积累',
    tags: '悬疑, 解谜, 神秘, 紧张',
    description: '营造悬疑氛围的音乐',
  },
];

// 按分类分组
export const promptCategories = [
  '全部',
  '氛围音乐',
  '电子音乐',
  '古典音乐',
  '爵士音乐',
  '摇滚音乐',
  '中国风',
  '流行音乐',
  '游戏配乐',
];

export function getExamplesByCategory(category: string): PromptExample[] {
  if (category === '全部') {
    return promptExamples;
  }
  return promptExamples.filter((example) => example.category === category);
}
