import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { ConfirmEmailResult } from "../types";
import { confirmEmailService } from "../service/confirmEmailService";

export function useConfirmEmail() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [result, setResult] = useState<ConfirmEmailResult>({
    status: "idle",
    message: "",
  });

  useEffect(() => {
    let active = true;

    async function run() {
      if (!token) {
        if (active) {
          setResult({ status: "error", message: "Missing confirmation token." });
        }
        return;
      }

      if (active) setResult({ status: "loading", message: "Confirming your email..." });
      const res = await confirmEmailService(token);
      if (active) setResult(res);
    }

    run();
    return () => {
      active = false;
    };
  }, [token]);

  return { token, result };
}
