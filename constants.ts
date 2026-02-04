
import { Category, GlossaryTerm } from './types';

export const GLOSSARY_DATA: GlossaryTerm[] = [
  {
    id: 1,
    word: '金型',
    reading: 'かながた',
    alias: 'モールド',
    english: 'Mold / Die',
    meanings: {
      mn: 'Бүтээгдэхүүнийг хэлбэржүүлэн цутгахад ашигладаг төмөр хэв.',
      en: 'A tool used in manufacturing for shaping objects by casting or injection.',
      jp: '製造業において、鋳造や射出などで物体を成形するために使用される金属製の型。'
    },
    category: Category.ResinDie
  },
  {
    id: 2,
    word: '射出成形',
    reading: 'しゃしゅつせいけい',
    alias: 'インジェクション',
    english: 'Injection Molding',
    meanings: {
      mn: 'Хайлуулсан давирхайг өндөр даралтаар хэвэнд шахаж хэлбэр гаргах арга.',
      en: 'A manufacturing process for producing parts by injecting molten material into a mold.',
      jp: '溶融した材料を金型に注入して部品を製造する加工方法。'
    },
    category: Category.ResinMolding
  },
  {
    id: 3,
    word: 'バリ',
    reading: 'ばり',
    alias: 'フラッシュ',
    english: 'Burr / Flash',
    meanings: {
      mn: 'Цутгалтын дараа бүтээгдэхүүний ирмэгээр гарсан илүүдэл материал.',
      en: 'Excess material or a rough edge remaining on a part after casting or molding.',
      jp: '鋳造や成形後に部品に残る余分な材料や粗いエッジ。'
    },
    category: Category.ResinMolding
  }
];

export const CATEGORIES_LIST = Object.values(Category);
