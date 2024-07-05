import jwt from 'jsonwebtoken';

const generateToken = (id: string): string =>
  jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '2h'
  });

export default generateToken;
