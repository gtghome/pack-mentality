export interface Question {
  question: string;
  category: string;
  hint?: string;
}

export const QUESTIONS: Question[] = [
  // Food & Drink
  { question: "Name a topping you'd put on pizza", category: "Food & Drink" },
  { question: "Name something you'd find in a fridge", category: "Food & Drink" },
  { question: "Name a popular breakfast food", category: "Food & Drink" },
  { question: "Name a drink you'd order at a café", category: "Food & Drink" },
  { question: "Name a fast food chain", category: "Food & Drink" },
  { question: "Name a fruit you'd find in a fruit salad", category: "Food & Drink" },
  { question: "Name a flavour of ice cream", category: "Food & Drink" },
  { question: "Name something you dip chips in", category: "Food & Drink" },
  { question: "Name a vegetable most people hate", category: "Food & Drink" },
  { question: "Name a popular cocktail", category: "Food & Drink" },
  { question: "Name a spice you'd find in most kitchens", category: "Food & Drink" },
  { question: "Name a cheese you'd put on a burger", category: "Food & Drink" },

  // Pop Culture
  { question: "Name a superhero", category: "Pop Culture" },
  { question: "Name a Disney princess", category: "Pop Culture" },
  { question: "Name a streaming service", category: "Pop Culture" },
  { question: "Name a popular video game", category: "Pop Culture" },
  { question: "Name a famous talk show host", category: "Pop Culture" },
  { question: "Name a popular boy band", category: "Pop Culture" },
  { question: "Name a famous cartoon character", category: "Pop Culture" },
  { question: "Name a movie sequel that was better than the original", category: "Pop Culture" },
  { question: "Name a social media platform", category: "Pop Culture" },
  { question: "Name something you'd see at a music festival", category: "Pop Culture" },
  { question: "Name a famous fictional wizard", category: "Pop Culture" },
  { question: "Name a sport you'd watch at the Olympics", category: "Pop Culture" },

  // Everyday Life
  { question: "Name something people do on a Sunday morning", category: "Everyday Life" },
  { question: "Name a reason someone calls in sick to work", category: "Everyday Life" },
  { question: "Name something you lose around the house", category: "Everyday Life" },
  { question: "Name a job people think is glamorous but isn't", category: "Everyday Life" },
  { question: "Name something people procrastinate on", category: "Everyday Life" },
  { question: "Name something you'd find in a bathroom cabinet", category: "Everyday Life" },
  { question: "Name a thing people argue about in relationships", category: "Everyday Life" },
  { question: "Name a chore most people hate doing", category: "Everyday Life" },
  { question: "Name something people buy but never use", category: "Everyday Life" },
  { question: "Name an excuse people give for being late", category: "Everyday Life" },
  { question: "Name something you'd pack for a beach day", category: "Everyday Life" },
  { question: "Name something you do when you can't sleep", category: "Everyday Life" },

  // Places & Travel
  { question: "Name a country in Europe", category: "Places & Travel" },
  { question: "Name a famous landmark", category: "Places & Travel" },
  { question: "Name something you'd see on a beach holiday", category: "Places & Travel" },
  { question: "Name a city famous for food", category: "Places & Travel" },
  { question: "Name a reason someone would move abroad", category: "Places & Travel" },
  { question: "Name a popular holiday destination", category: "Places & Travel" },
  { question: "Name something people do on a plane", category: "Places & Travel" },

  // Animals & Nature
  { question: "Name an animal you'd find at a zoo", category: "Animals & Nature" },
  { question: "Name a dog breed", category: "Animals & Nature" },
  { question: "Name an animal that could kill you", category: "Animals & Nature" },
  { question: "Name something animals do that humans also do", category: "Animals & Nature" },
  { question: "Name a nocturnal animal", category: "Animals & Nature" },

  // Random & Fun
  { question: "Name something you'd find in a hospital", category: "Random" },
  { question: "Name a reason someone cries", category: "Random" },
  { question: "Name a skill everyone thinks they have but most don't", category: "Random" },
  { question: "Name something you'd see at a wedding", category: "Random" },
  { question: "Name a famous person called Michael", category: "Random" },
  { question: "Name something red", category: "Random" },
  { question: "Name a game you'd play at a party", category: "Random" },
  { question: "Name a superpower everyone wants", category: "Random" },
  { question: "Name a word people overuse", category: "Random" },
  { question: "Name something you'd regret buying", category: "Random" },
  { question: "Name a sport you can play alone", category: "Random" },
  { question: "Name something associated with luck", category: "Random" },
  { question: "Name something that gets better with age", category: "Random" },
  { question: "Name a reason people visit the doctor", category: "Random" },
  { question: "Name a job that didn't exist 20 years ago", category: "Random" },
  { question: "Name a type of music genre", category: "Random" },
];

export function pickQuestions(count: number): Question[] {
  const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
