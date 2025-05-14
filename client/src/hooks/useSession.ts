import { useEffect, useState } from "react";
import api from "../services/api";
import { User } from "../types";
import { useLocation } from "react-router-dom";
import { getCookie } from "cookies-next";

interface Session {
  user: User | null | undefined;
  loading: boolean;
}

const useSession = () => {
  const [session, setSession] = useState<Session>({
    user: undefined,
    loading: true,
  });
  const location = useLocation()

  const getSession = async () => {
    if (location.pathname === "/login") {
      const token = getCookie("token")
      if (!token) {
        setSession({
          user: null,
          loading: false,
        });
        return;
      }
    }
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
    console.log("getting session")
    getSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refetch = () => {
    getSession();
  };

  return { session, refetch };
};

export default useSession;
