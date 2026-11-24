import Layout from "@/components/common/Layout";
import { useTestHistory } from "../hooks/useTestHistory";
import AllTests from "./AllTests";
import HistoryChart from "./HistoryChart";
import UnfinishedTests from "./UnfinishedTests";
import { primaryButton } from "./historyParts";

/**
 * Test history (design approved 2026-11-24): your tests over time, any test to pick up,
 * then every test, narrowed by kind and subject and opened in place. One flat page in the
 * app frame; the old details panel, stat cards and Export are gone.
 */

const PAGE_CLASS = "fasiti-theme max-w-[1600px] px-2 text-foreground sm:px-0 [&>div>section:first-child]:pt-0";

const TestHistoryPage = () => {
  const { state, reload, cancel } = useTestHistory();

  let body;
  if (state.status === "loading") {
    body = (
      <div aria-busy="true">
        <p role="status" className="sr-only">
          Loading your tests
        </p>
        <span className="block h-6 w-56 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
        <span className="mt-4 block h-48 w-full max-w-3xl animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
        {[0, 1, 2].map((i) => (
          <span key={i} className="mt-6 block h-12 w-full max-w-4xl animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
        ))}
      </div>
    );
  } else if (state.status === "error") {
    body = (
      <div role="alert" className="max-w-xl">
        <h2 className="text-xl font-extrabold tracking-[-0.02em]">We couldn't load your tests</h2>
        <p className="mt-2 text-muted-foreground">Check your connection and try again. Your results are saved.</p>
        <button type="button" onClick={() => void reload()} className={primaryButton("mt-5")}>
          Try again
        </button>
      </div>
    );
  } else if (state.tests.length === 0) {
    body = (
      <div className="max-w-xl">
        <h2 className="text-xl font-extrabold tracking-[-0.02em]">No tests yet</h2>
        <p className="mt-2 text-pretty text-muted-foreground">
          Every test you take is kept here, newest first, with a review of each question. A full UTME practice (four
          subjects, timed) gives you a mark out of 400. Use Start test to take your first one.
        </p>
      </div>
    );
  } else {
    body = (
      <>
        <HistoryChart tests={state.tests} />
        <UnfinishedTests tests={state.tests} onCancel={cancel} />
        <AllTests tests={state.tests} />
      </>
    );
  }

  return (
    <Layout title="Test history" darkReady>
      <div className={PAGE_CLASS}>
        <div className="max-w-5xl">{body}</div>
      </div>
    </Layout>
  );
};

export default TestHistoryPage;
