import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getCbtSessionConfiguration } from "../api/practiceApi";

const SubmissionSuccess = () => {
  const navigate = useNavigate();
  const { cbtSessionId } = useParams<{ cbtSessionId: string }>();
  const [config, setConfig] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchConfig = async () => {
      if (!cbtSessionId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getCbtSessionConfiguration(cbtSessionId);
        setConfig(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch session configuration");
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [cbtSessionId]);

  let message = "Your result will be sent to you shortly via email.";
  if (config && config.status === 3) {
    message = "Your result has been submitted, you'll receive a mail for more details shortly.";
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Congratulations!</h1>
        {loading ? (
          <p className="text-lg text-muted-foreground mb-6">Loading...</p>
        ) : error ? (
          <p className="text-lg text-destructive mb-6">{error}</p>
        ) : (
          <p className="text-lg text-muted-foreground mb-6">{message}</p>
        )}
        <Button onClick={() => navigate('/dashboard')} size="lg">
          Go To Dashboard
        </Button>
      </div>
    </div>
  );
};

export default SubmissionSuccess; 