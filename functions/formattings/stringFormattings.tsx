export function capitalizeWords(input: string): string {
    return input
      .toLowerCase()
      .split(' ')
      .map(word => word.split('-').map(word => capitalize(word)).join('-'))
      .join(' ');  
}

export function capitalizeAdress(input: string): string {
    return input
      .toLowerCase()
      .replaceAll("ul. ", "")
      .replaceAll("ul.", "")
      .replaceAll("ul ", "")
      .split('|=|')
      .map(word => capitalizeWords(word))
      .join('|=|')
  }

export function formatCompanyName(input: string): string {
  const lowercaseWords = ["i", "a", "o", "u", "w", "z", "do", "na", "pod", "przy", "za", "po", "im"];
  return input.trim().split(/\s+/).map((word, index, arr) => {
      const cleanedWord = word.replace(/[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ„”"]+/g, '');
      if (cleanedWord.startsWith('"') || cleanedWord.endsWith('"')) {
          return `"${capitalize(cleanedWord.replace(/"/g, ''))}"`;
      }
      if (lowercaseWords.includes(cleanedWord.toLowerCase())) {
          if (index === 0 || index === arr.length - 1) {
              return capitalize(cleanedWord);
          }
          return cleanedWord.toLowerCase();
      }
      return capitalize(cleanedWord);
  }).join(' ');
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}