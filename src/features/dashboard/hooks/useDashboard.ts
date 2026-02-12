import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchUserProfile,
  fetchRecentTests,
  fetchSubjectPerformance,
  fetchLowConfidenceTopics,
} from "../api/dashboardApi";
import { usePrepareTest } from "./usePrepareTest";
import {
  UserProfile,
  RecentTest,
  SubjectPerformance,
  TopicConfidence,
  TestConfig,
  PrepareTestPayload,
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

  const [topicConfidences, setTopicConfidences] = useState<TopicConfidence[]>([]);
  const [topicConfidencesLoading, setTopicConfidencesLoading] = useState(true);
  const [topicConfidencesError, setTopicConfidencesError] = useState("");
  
  const navigate = useNavigate();
  
  // Delegate test preparation to dedicated hook
  const prepareTestHook = usePrepareTest();

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

  useEffect(() => {
    const loadTopicConfidences = async () => {
      try {
        setTopicConfidencesLoading(true);
        const confidences = await fetchLowConfidenceTopics();
        setTopicConfidences(confidences);
      } catch (err: any) {
        setTopicConfidencesError(err.message || "Failed to load topic confidences");
      } finally {
        setTopicConfidencesLoading(false);
      }
    };
    loadTopicConfidences();
  }, []);

  const avgScore = useMemo(() => {
    if (user && user.totalScore && user.totalNumberOfTestTaken) {
      return Math.round((user.totalScore / (user.totalNumberOfTestTaken * 400)) * 100);
    }
    return 0;
  }, [user]);

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
    topicConfidences,
    topicConfidencesLoading,
    topicConfidencesError,
    avgScore,
    ...prepareTestHook,
  };
}; 