import Header from "@/components/Header";
import Services from "@/components/Services";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import Reviews from "@/components/Reviews";
import Stats from "@/components/Stats";
import Footer from "@/components/Footer";

const Index = () => {

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Services />
        <HowItWorks />
        <FAQ />
        <Reviews />
        <Stats />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
