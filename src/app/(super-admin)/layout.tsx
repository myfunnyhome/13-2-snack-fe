import Gnb from '@/components/ui/LogoGnb/Gnb';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Gnb role="SUPER_ADMIN" />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1440px]">{children}</div>
      </main>
    </div>
  );
}
