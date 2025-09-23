import { jwtDecode } from "jwt-decode";

export type JwtPayload = {
  sub: string;
  name: string;
  email: string;
  role: string;
};

export function getDecodedUser() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) return null; //Tarayıcı token, server null

  try {
    return jwtDecode<JwtPayload>(token);
  } catch (err) {
    console.error("Invalid token:", err);
    return null;
  }
}
