import { useEffect } from 'react';
import Topbar from '../components/layout/Topbar';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import CustomModal from '../components/store/CustomModal';
import ProductDetailsModal from '../components/store/ProductDetailsModal';
import CartDrawer from '../components/store/CartDrawer';
import MobileCartBar from '../components/store/MobileCartBar';
import FloatingWhatsApp from '../components/store/FloatingWhatsApp';

import HeroSection from '../sections/HeroSection';
import TrustBar from '../sections/TrustBar';
import DepartmentsSection from '../sections/DepartmentsSection';
import CatalogSection from '../sections/CatalogSection';
import FinishesSection from '../sections/FinishesSection';
import StepsSection from '../sections/StepsSection';
import TestimonialsSection from '../sections/TestimonialsSection';
import FaqSection from '../sections/FaqSection';

export default function StorePage() {
  useEffect(() => {
    document.title =
      'Estrela Criativa — Prof. Ataíse | Papelaria Personalizada & Pedagógica';
  }, []);

  return (
    <div id="topo">
      <Topbar />
      <Header />

      <HeroSection />
      <TrustBar />
      <DepartmentsSection />
      <CatalogSection />
      <FinishesSection />
      <StepsSection />
      <TestimonialsSection />
      <FaqSection />

      <Footer />

      <ProductDetailsModal />
      <CustomModal />
      <CartDrawer />
      <MobileCartBar />
      <FloatingWhatsApp />
    </div>
  );
}

