export type JwtPayload = {
  sub: number;
  student_number: string;
  isAdmin?: boolean;
  iat?: number;
  exp?: number;
};
