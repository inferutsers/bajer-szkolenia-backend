export function capitalizeWords(input: string): string {
    return input
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');  
}
export function capitalizeAdress(input: string): string {
    return input
      .toLowerCase()
      .split('|=|')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('|=|');  
}