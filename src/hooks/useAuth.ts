export const useAuth = () => {
  const signIn = () => {
    localStorage.setItem("isAuthenticated", "true");
  };

  const signOut = () => {
    localStorage.removeItem("isAuthenticated");
  };

  //TODO: Implement this properly
  //   const isLogged = () => localStorage.getItem("isAuthenticated") === "true";
  const isLogged = () => true;

  return { signIn, signOut, isLogged };
};

export type AuthContext = ReturnType<typeof useAuth>;
