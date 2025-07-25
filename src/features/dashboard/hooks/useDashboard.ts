import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import {
  fetchUserProfile,
  fetchRecentTests,
  fetchSubjectPerformance,
  prepareTest as prepareTestApi,
  fetchTestConfiguration as fetchTestConfigApi,
} from "../api/dashboardApi";
import {
  UserProfile,
  RecentTest,
  SubjectPerformance,
  TestConfig,
} from "../types/dashboardTypes";

export const useDashboard = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState("");

  const [recentTests, setRecentTests] = useState<RecentTest[]>([]);
  const [recentTestsLoading, setRecentTestsLoading] = useState(true);
  const [recentTestsError, setRecentTestsError] = useState("");

  const [subjectsPerformance, setSubjectsPerformance] = useState<SubjectPerformance[]>([]);
  const [subjectsPerformanceLoading, setSubjectsPerformanceLoading] = useState(true);
  const [subjectsPerformanceError, setSubjectsPerformanceError] = useState("");
  
  const [preparing, setPreparing] = useState(false);
  const [cbtSessionId, setCbtSessionId] = useState<string | null>(null);
  const [showPreparedDialog, setShowPreparedDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        setUserLoading(true);
        const userProfile = await fetchUserProfile();
        setUser(userProfile);
      } catch (err: any) {
        setUserError(err.message || "Failed to load user profile");
        if(err.message.toLowerCase().includes('unauthorized') || err.message.toLowerCase().includes('token')) {
          navigate('/signin');
        }
      } finally {
        setUserLoading(false);
      }
    };
    loadUser();
  }, [navigate]);

  useEffect(() => {
    const loadRecentTests = async () => {
      try {
        setRecentTestsLoading(true);
        const tests = await fetchRecentTests();
        setRecentTests(tests);
      } catch (err: any) {
        setRecentTestsError(err.message || "Failed to load recent tests");
      } finally {
        setRecentTestsLoading(false);
      }
    };
    loadRecentTests();
  }, []);

  useEffect(() => {
    const loadSubjectsPerformance = async () => {
      try {
        setSubjectsPerformanceLoading(true);
        const performance = await fetchSubjectPerformance();
        setSubjectsPerformance(performance);
      } catch (err: any) {
        setSubjectsPerformanceError(err.message || "Failed to load subject performance");
      } finally {
        setSubjectsPerformanceLoading(false);
      }
    };
    loadSubjectsPerformance();
  }, []);

  const avgScore = useMemo(() => {
    if (user && user.totalScore && user.totalNumberOfTestTaken) {
      return Math.round((user.totalScore / (user.totalNumberOfTestTaken * 400)) * 100);
    }
    return 0;
  }, [user]);

  const handlePrepareTest = async (options: any) => {
    setPreparing(true);
    setCbtSessionId(null);
    try {
      const sessionId = await prepareTestApi(options);
      setCbtSessionId(sessionId);
      setShowPreparedDialog(true);
    } catch (err: any) {
      toast({
        title: "Error Preparing Questions",
        description: err.message || "Failed to prepare questions",
        variant: "destructive",
      });
    } finally {
      setPreparing(false);
    }
  };

  const handleGoToTest = async () => {
    if (!cbtSessionId) return;
    setPreparing(true);
    try {
      const config: TestConfig = await fetchTestConfigApi(cbtSessionId);
      setShowPreparedDialog(false);
      navigate("/practice/test", {
        state: {
          cbtSessionId: config.cbtSessionId,
          preparedQuestion: config.preparedQuestion,
          examConfig: {
            time: config.duration,
            questions: config.totalQuestionsCount,
          },
          status: (() => {
            switch (config.status) {
              case 1: return "not-started";
              case 2: return "in-progress";
              case 3: return "submitted";
              case 4: return "cancelled";
              default: return "not-started";
            }
          })(),
        },
      });
    } catch (err: any) {
      toast({
        title: "Error Loading Test",
        description: err.message || "Failed to fetch test configuration",
        variant: "destructive",
      });
    } finally {
      setPreparing(false);
    }
  };

  return {
    user,
    userLoading,
    userError,
    recentTests,
    recentTestsLoading,
    recentTestsError,
    subjectsPerformance,
    subjectsPerformanceLoading,
    subjectsPerformanceError,
    avgScore,
    preparing,
    showPreparedDialog,
    cbtSessionId,
    handlePrepareTest,
    handleGoToTest,
    setShowPreparedDialog,
  };
}; 