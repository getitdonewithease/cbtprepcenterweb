import { Navigate, useParams } from "react-router-dom";

/** Old links to the page after submitting go to the test's review, which shows the result. */
const SubmissionRedirect = () => {
  const { cbtSessionId = "" } = useParams<{ cbtSessionId: string }>();
  return <Navigate to={`/practice/review/${cbtSessionId}`} replace />;
};

export default SubmissionRedirect;
