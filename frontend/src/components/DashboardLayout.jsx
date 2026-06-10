export default function DashboardLayout({ children }) {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-background transition-colors duration-300">
      
      <main className="flex-1 overflow-y-auto">
        <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden min-h-[calc(100vh-12rem)]">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}