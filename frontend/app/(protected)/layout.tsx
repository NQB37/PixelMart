import { Footer } from '@/components/shared/footer';
import { Header } from '@/components/shared/header';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      <Header />
      {children}
      <Footer />
    </main>
  );
}
