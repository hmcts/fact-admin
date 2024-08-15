
export const generateCourtName = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return `TEST-COURT-${
    Array.from({ length: 4 })
      .map(() => characters.charAt(Math.floor(Math.random() * characters.length)))
      .join('')
  }`;
};
