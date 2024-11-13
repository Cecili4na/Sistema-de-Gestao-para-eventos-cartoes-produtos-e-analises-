/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import { supabase } from "~/supabase/supabaseClient";

type ProtectedPageProps = {
  children: React.ReactNode;
};

function ProtectedPage({ children }: ProtectedPageProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
      }
    };

    checkUserSession();
  }, [navigate]);

  return <>{children}</>;
}

export default ProtectedPage;
