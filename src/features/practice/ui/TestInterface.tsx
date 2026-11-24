import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { usePracticeTest } from "../hooks/usePracticeTest";
import { practiceTitle, subjectBlocks } from "../service/testScreenService";
import TestScreen, { Notice, NOTICE_ACTION } from "./test-screen/TestScreen";
import { TestScreenLoading, TestScreenMessage } from "./test-screen/TestScreenMessage";

/** A practice test on the shared test screen: the clock, saving as you go, and Submit. */

const TestInterface = () => {
  const { cbtSessionId } = useParams<{ cbtSessionId: string }>();
  const t = usePracticeTest(cbtSessionId);
  const title = useMemo(() => practiceTitle(subjectBlocks(t.questions).map((s) => s.name)), [t.questions]);

  useEffect(() => {
    const before = document.title;
    document.title = `${title} · Fasiti`;
    return () => {
      document.title = before;
    };
  }, [title]);

  if (t.state.status === "loading") return <TestScreenLoading label="Loading your test" />;
  if (t.state.status === "error") {
    return <TestScreenMessage title={t.state.title} body={t.state.message} onRetry={t.state.canRetry ? () => void t.reload() : undefined} />;
  }

  const notices = (
    <>
      {t.saveFailed && <Notice>We can't save right now. Your answers are kept on this page; keep going and we'll try again.</Notice>}
      {t.showFullScreenNote && (
        <Notice
          action={
            <button type="button" onClick={t.enterFullScreen} className={NOTICE_ACTION}>
              Go full screen
            </button>
          }
        >
          Full screen is off. The real exam is full screen, so practise that way.
        </Notice>
      )}
      {t.leftTab && (
        <Notice
          action={
            <button type="button" onClick={t.dismissLeftTab} className={NOTICE_ACTION}>
              OK
            </button>
          }
        >
          You left the test for a moment. Your clock kept running.
        </Notice>
      )}
    </>
  );

  return (
    <TestScreen
      title={title}
      questions={t.questions}
      answers={t.answers}
      current={t.current}
      onAnswer={t.onAnswer}
      onGo={t.setCurrent}
      clock={t.endTime ? { endTime: t.endTime, onTimeUp: t.onTimeUp } : undefined}
      timeUp={t.timeUp}
      verb="Submit"
      finishOpen={t.finishOpen}
      onFinishOpenChange={t.setFinishOpen}
      finishState={t.finishState}
      finishError={t.finishError}
      onConfirmFinish={() => void t.submit()}
      leaveBody="Your answers and the time left are saved. Carry on from Test history whenever you're ready."
      onLeave={t.leave}
      notices={notices}
    />
  );
};

export default TestInterface;
