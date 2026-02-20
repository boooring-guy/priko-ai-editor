export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted md:bg-background">
      <div className="w-full md:w-auto p-4 md:p-0">{children}</div>
    </div>
  );
}
