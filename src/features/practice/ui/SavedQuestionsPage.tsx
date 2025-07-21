import React from 'react';
import Layout from '@/components/common/Layout';

const SavedQuestionsPage = () => {
  return (
    <Layout title="Saved Questions">
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <h2 className="text-2xl font-bold mb-4">Saved Questions</h2>
        <p className="text-muted-foreground">Your saved questions will appear here.</p>
      </div>
    </Layout>
  );
};

export default SavedQuestionsPage; 