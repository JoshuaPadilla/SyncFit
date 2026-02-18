import * as bcrypt from 'bcrypt';

export const hash = async (rawPassword: string): Promise<string> => {
  const saltRound = parseInt(process.env.SALTROUNDS!, 10) || 10;

  return bcrypt.hash(rawPassword, saltRound);
};

export const isMatch = async (
  rawPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(rawPassword, hashedPassword);
};
