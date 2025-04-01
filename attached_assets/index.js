import Head from 'next/head';
import ContactCard from '../components/ContactCard';
import GifBackground from '../components/GifBackground';

export default function Home() {

  return (
    <>
      <Head>
        <title>Contact Me | Diva Juan Nur Taqarrub</title>
        <meta name="description" content="Connect with Diva Juan Nur Taqarrub on social media" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <GifBackground>
        <div className="content-container">
          <ContactCard />
          <footer className="footer">
            <p className="copyright-text">© 2025 Diva Juan Nur Taqarrub. All Rights Reserved.</p>
          </footer>
        </div>
      </GifBackground>

      <style jsx>{`
        .content-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          width: 100%;
          position: relative;
          z-index: 20;
          justify-content: center;
          align-items: center;
        }
        
        .footer {
          width: 100%;
          padding: 0.85rem 0;
          display: flex;
          justify-content: center;
          margin-top: auto;
          position: fixed;
          bottom: 0;
          left: 0;
          background: rgba(15, 23, 42, 0.7); /* Match card background */
          backdrop-filter: blur(5px);
          z-index: 20;
          border-top: 1px solid rgba(249, 115, 22, 0.1); /* Subtle orange border */
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
        }
        
        .copyright-text {
          color: rgba(255, 255, 255, 0.85);
          font-size: 0.875rem;
          font-weight: 400;
          letter-spacing: 0.025em;
          opacity: 0.9;
        }
      `}</style>
    </>
  );
}
