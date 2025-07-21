import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCbtSessionConfiguration } from "../hooks/usePractice";

const mapSessionStatus = (status: number | string) => {
  const statusMap: Record<string, string> = { '1': "Pending", '2': "In-Progress", '3': "Completed", '4': "Cancelled" };
  return typeof status === 'number' ? statusMap[status.toString()] || "Unknown" : status;
};

const TestSummaryPage: React.FC = () => {
  const { cbtSessionId } = useParams<{ cbtSessionId: string }>();
  const navigate = useNavigate();
  const { config, loading, error } = useCbtSessionConfiguration(cbtSessionId || "");

  return (
    <div className="max-w-xl mx-auto mt-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Test Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : error ? (
            <div className="text-red-600 mt-4 text-center">{error}</div>
          ) : config ? (
            <div className="mb-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="font-semibold">Status:</span>
                <Badge variant="outline">{mapSessionStatus((config as any).status)}</Badge>
              </div>
              <div className="font-semibold mb-2">Prepared Questions:</div>
              <ul className="mb-4">
                {(config as any).preparedQuestion &&
                  Object.entries((config as any).preparedQuestion).map(([subject, count]) => (
                    <li key={subject} className="flex justify-between border-b py-1">
                      <span className="capitalize">{subject}</span>
                      <span className="font-bold">{count as number}</span>
                    </li>
                  ))}
              </ul>
              <div className="font-semibold mb-2">Exam Configuration:</div>
              <ul>
                <li>Time: <span className="font-bold">{config.duration}</span></li>
                <li>Total Questions: <span className="font-bold">{config.totalQuestionsCount}</span></li>
              </ul>
            </div>
          ) : null}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button size="lg"
            onClick={() => {
              if (config && cbtSessionId) {
                navigate(`/practice/test/${cbtSessionId}`, { state: { duration: config.duration } });
              }
            }}
            disabled={loading || !cbtSessionId}
          >
            Start Test
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TestSummaryPage; 