import { Helmet } from 'react-helmet';
import GameSubmissionForm from "@/components/GameSubmissionForm";

const SubmitGame = () => {
  return (
    <>
      <Helmet>
        <title>Submit Your Game - GameVault</title>
        <meta name="description" content="Submit your HTML5 games to GameVault and share them with players around the world. Upload your game files and reach a wide audience." />
      </Helmet>
      
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <GameSubmissionForm />
        </div>
      </section>
    </>
  );
};

export default SubmitGame;
