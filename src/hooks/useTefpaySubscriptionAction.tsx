import React, { useState } from "react";
import { TefpaySubscription } from "../tefpay-subscription";
import { TefpayClient } from "../tefpay-client";

interface UseTefpaySubscriptionActionProps {
  client: TefpayClient;
  account: string;
  merchantCode: string;
  secretKey: string;
  url: string;
  action?: "C" | "S" | "R" | "B"; // Por defecto "S" (suspender)
  buttonText?: string;
  buttonClassName?: string;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
}

export function useTefpaySubscriptionAction({
  client,
  account,
  merchantCode,
  secretKey,
  url,
  action = "S",
  buttonText = "Cancelar suscripción",
  buttonClassName = "",
  onSuccess,
  onError,
}: UseTefpaySubscriptionActionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const subscription = new TefpaySubscription(client);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      let response;
      if (action === "C")
        response = await subscription.create({
          account,
          merchantCode,
          secretKey,
          url,
        });
      else if (action === "S")
        response = await subscription.suspend({
          account,
          merchantCode,
          secretKey,
          url,
        });
      else if (action === "R")
        response = await subscription.reactivate({
          account,
          merchantCode,
          secretKey,
          url,
        });
      else if (action === "B")
        response = await subscription.cancel({
          account,
          merchantCode,
          secretKey,
          url,
        });
      else throw new Error("Acción de suscripción no soportada");
      setSuccess(true);
      if (onSuccess) onSuccess(response);
    } catch (err) {
      setError((err as Error).message);
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  const Button: React.FC = () => (
    <button
      className={buttonClassName}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? "Procesando..." : buttonText}
    </button>
  );

  return { Button, loading, error, success, handleClick };
}
