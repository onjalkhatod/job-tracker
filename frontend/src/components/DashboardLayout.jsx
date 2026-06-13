export default function DashboardLayout({ children }) {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      <main className="flex-1 overflow-y-auto">
        {/* Fluid wrapper: 
          - py-6: vertical padding
          - px-4 sm:px-6 lg:px-8: responsive side padding
          - max-w-7xl mx-auto: keeps the dashboard centered and readable on large screens 
        */}
        <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Main card wrapper: 
            - rounded-2xl: consistent branding
            - min-h: dynamic height calculation that prevents the layout from collapsing
          */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden min-h-[calc(100vh-12rem)]">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}