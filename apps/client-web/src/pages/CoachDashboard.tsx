import CoachDashboard from "../components/coach-dashboard/CoachDashboard";

export default function CoachDashboardPage() {
    return (
        <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                {/* ---------- LEFT ---------- */}
                <div className="text-center md:text-left">
                <h1 className="text-base sm:text-lg font-semibold text-gray-800">
                    Hi Coach 👋
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                    Ready to inspire young athletes today?
                </p>
                </div>
            </div>
            </div>
            <CoachDashboard />
        </>
    );
}