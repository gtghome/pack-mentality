export interface Question {
  question: string;
  category: string;
}

export const QUESTIONS: Question[] = [

  // ─── AUSTRALIA ───
  { question: "Name something you'd put on a meat pie", category: "Aussie Life" },
  { question: "Name an Australian city", category: "Aussie Life" },
  { question: "Name something you'd take to a barbie", category: "Aussie Life" },
  { question: "Name a famous Australian", category: "Aussie Life" },
  { question: "Name something you'd find at a servo", category: "Aussie Life" },
  { question: "Name an Australian animal that could kill you", category: "Aussie Life" },
  { question: "Name something people do on Australia Day", category: "Aussie Life" },
  { question: "Name a popular Australian beer", category: "Aussie Life" },
  { question: "Name something everyone associates with Bondi Beach", category: "Aussie Life" },
  { question: "Name a Tim Tam flavour", category: "Aussie Life" },
  { question: "Name an Australian TV show", category: "Aussie Life" },
  { question: "Name something you'd see at a footy game", category: "Aussie Life" },
  { question: "Name a classic Australian snack", category: "Aussie Life" },
  { question: "Name something tourists always do in Australia", category: "Aussie Life" },
  { question: "Name a place Australians love to holiday", category: "Aussie Life" },
  { question: "Name an AFL team", category: "Aussie Life" },
  { question: "Name something you'd find at a country show", category: "Aussie Life" },
  { question: "Name a word or phrase only Australians say", category: "Aussie Life" },
  { question: "Name a popular Australian chain restaurant", category: "Aussie Life" },
  { question: "Name something people complain about in Australian summers", category: "Aussie Life" },
  { question: "Name a topping on a classic Aussie sausage sizzle", category: "Aussie Life" },
  { question: "Name an Australian sporting legend", category: "Aussie Life" },
  { question: "Name something every Australian household has in the garage", category: "Aussie Life" },
  { question: "Name a suburb everyone in your city knows", category: "Aussie Life" },

  // ─── KNOW THE GROUP ───
  { question: "Name something everyone in this group has done at least once", category: "Know the Group" },
  { question: "Name a word that describes this group", category: "Know the Group" },
  { question: "Name a place this group would all agree to go for dinner", category: "Know the Group" },
  { question: "Name something everyone in this room has probably said today", category: "Know the Group" },
  { question: "Name a movie everyone in this group has seen", category: "Know the Group" },
  { question: "Name a drink everyone in this group has tried", category: "Know the Group" },
  { question: "Name something this group would argue about", category: "Know the Group" },
  { question: "Name a hobby at least half the people in this room have", category: "Know the Group" },
  { question: "Name something everyone in this group owns", category: "Know the Group" },
  { question: "Name a TV show everyone here has watched", category: "Know the Group" },
  { question: "Name a song everyone in this room knows the words to", category: "Know the Group" },
  { question: "Name something everyone here has been guilty of", category: "Know the Group" },
  { question: "Name something you'd find in everyone's phone", category: "Know the Group" },
  { question: "Name a food everyone in this group likes", category: "Know the Group" },
  { question: "Name a reason someone in this group would be late", category: "Know the Group" },
  { question: "Name something everyone in this room has lied about", category: "Know the Group" },
  { question: "Name a mutual friend everyone here knows", category: "Know the Group" },
  { question: "Name something this group always does together", category: "Know the Group" },
  { question: "Name a bad habit at least one person in this room has", category: "Know the Group" },
  { question: "Name something everyone here has complained about this week", category: "Know the Group" },
  { question: "Name a place this group has all been to together", category: "Know the Group" },
  { question: "Name an app everyone in this room uses every day", category: "Know the Group" },

  // ─── FOOD & DRINK (Aussie-leaning) ───
  { question: "Name a topping you'd put on pizza", category: "Food & Drink" },
  { question: "Name something you'd order at a pub", category: "Food & Drink" },
  { question: "Name a popular brunch dish", category: "Food & Drink" },
  { question: "Name a flavour of ice cream", category: "Food & Drink" },
  { question: "Name something you dip hot chips in", category: "Food & Drink" },
  { question: "Name a popular takeaway cuisine", category: "Food & Drink" },
  { question: "Name something on a café brekky menu", category: "Food & Drink" },
  { question: "Name a cocktail everyone has tried", category: "Food & Drink" },
  { question: "Name a cheese you'd put on a burger", category: "Food & Drink" },
  { question: "Name something people always have at a house party", category: "Food & Drink" },
  { question: "Name a soft drink", category: "Food & Drink" },
  { question: "Name a popular coffee order", category: "Food & Drink" },

  // ─── EVERYDAY LIFE ───
  { question: "Name a reason someone calls in sick to work", category: "Everyday Life" },
  { question: "Name something people procrastinate on", category: "Everyday Life" },
  { question: "Name something you always lose around the house", category: "Everyday Life" },
  { question: "Name a chore everyone hates doing", category: "Everyday Life" },
  { question: "Name an excuse people give for being late", category: "Everyday Life" },
  { question: "Name something people do on a Sunday morning", category: "Everyday Life" },
  { question: "Name something you'd find in a bathroom cabinet", category: "Everyday Life" },
  { question: "Name something people buy but never use", category: "Everyday Life" },
  { question: "Name something you do when you can't sleep", category: "Everyday Life" },
  { question: "Name a thing people argue about in relationships", category: "Everyday Life" },
  { question: "Name a skill everyone thinks they have but most don't", category: "Everyday Life" },
  { question: "Name something you'd regret buying", category: "Everyday Life" },

  // ─── POP CULTURE ───
  { question: "Name a streaming service", category: "Pop Culture" },
  { question: "Name a superhero", category: "Pop Culture" },
  { question: "Name a famous cartoon character", category: "Pop Culture" },
  { question: "Name a popular podcast", category: "Pop Culture" },
  { question: "Name a social media platform", category: "Pop Culture" },
  { question: "Name a reality TV show", category: "Pop Culture" },
  { question: "Name a famous person called Chris", category: "Pop Culture" },
  { question: "Name a video game everyone has played", category: "Pop Culture" },
  { question: "Name something you'd see at a music festival", category: "Pop Culture" },
  { question: "Name a musician everyone knows", category: "Pop Culture" },

  // ─── RANDOM & FUN ───
  { question: "Name a superpower everyone wants", category: "Random" },
  { question: "Name something red", category: "Random" },
  { question: "Name a reason someone cries", category: "Random" },
  { question: "Name something associated with good luck", category: "Random" },
  { question: "Name a job that sounds glamorous but isn't", category: "Random" },
  { question: "Name something that gets better with age", category: "Random" },
  { question: "Name a game you'd play at a party", category: "Random" },
  { question: "Name a word people overuse", category: "Random" },
  { question: "Name a sport you can play alone", category: "Random" },
  { question: "Name something you'd see at a wedding", category: "Random" },
  { question: "Name a job that didn't exist 20 years ago", category: "Random" },
  { question: "Name a type of music genre", category: "Random" },
];

export function pickQuestions(count: number): Question[] {
  // Always include a mix of categories — guarantee at least some Aussie + Know the Group
  const byCategory: Record<string, Question[]> = {};
  for (const q of QUESTIONS) {
    if (!byCategory[q.category]) byCategory[q.category] = [];
    byCategory[q.category].push(q);
  }

  const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

  const picked: Question[] = [];

  // Guaranteed slots: ~30% Aussie, ~30% Know the Group, rest mixed
  const aussieCount = Math.max(2, Math.round(count * 0.30));
  const groupCount = Math.max(2, Math.round(count * 0.30));
  const restCount = count - aussieCount - groupCount;

  const aussie = shuffle(byCategory["Aussie Life"] || []).slice(0, aussieCount);
  const group = shuffle(byCategory["Know the Group"] || []).slice(0, groupCount);

  const otherCategories = Object.entries(byCategory)
    .filter(([cat]) => cat !== "Aussie Life" && cat !== "Know the Group")
    .flatMap(([, qs]) => qs);
  const rest = shuffle(otherCategories).slice(0, restCount);

  // Interleave so game feels varied
  const all = [...aussie, ...group, ...rest];
  return shuffle(all).slice(0, count);
}
