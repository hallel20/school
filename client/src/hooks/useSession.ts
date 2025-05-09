import { useEffect, useState } from "react";
import api from "../services/api";
import { User } from "../types";

interface Session {
  user: User | null | undefined;
  loading: boolean;
}

const useSession = () => {
  const [session, setSession] = useState<Session>({
    user: undefined,
    loading: true,
  });

  const getSession = async () => {
      api
          .get("/auth/me")
          .then((response) => {
              setSession({
                  user: response.data,
                  loading: false,
              });
          })
          .catch(() => {
              setSession({
                  user: null,
                  loading: false,
              });
          });
  };

  useEffect(() => {
    getSession()
  }, []);

  const refetch = () => {
    getSession();
  };

  return {session, refetch};
};

export default useSession;
