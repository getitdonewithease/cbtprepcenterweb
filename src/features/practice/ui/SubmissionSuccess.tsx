import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getCbtSessionDetails } from "../api/practiceApi";

const SubmissionSuccess = () => {
  const navigate = useNavigate();
  const { cbtSessionId } = useParams<{ cbtSessionId: string }>();
  const [session, setSession] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchSession = async () => {
      if (!cbtSessionId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getCbtSessionDetails(cbtSessionId);
        setSession(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch session details");
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [cbtSessionId]);

  let message = "Your result will be sent to you shortly via email.";
  if (session && session.submittedOn) {
    const submittedDate = new Date(session.submittedOn);
    message = `Your result was submitted at ${submittedDate.toLocaleString()}.`;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        {loading ? (
          <p className="text-lg text-muted-foreground mb-6">Loading...</p>
        ) : error ? (
          <p className="text-lg text-destructive mb-6">{error}</p>
        ) : session ? (
          <>
            <h1 className="text-3xl font-bold mb-4">Congratulations!</h1>
            <p className="text-lg text-muted-foreground mb-6">{message}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/dashboard')} size="lg">
                Go To Dashboard
              </Button>
              {cbtSessionId && (
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/practice/review/${cbtSessionId}`)} 
                  size="lg"
                >
                  Review Test Results
                </Button>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default SubmissionSuccess; 