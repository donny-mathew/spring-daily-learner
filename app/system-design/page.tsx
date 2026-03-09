import { CurriculumGrid } from "@/components/system-design/CurriculumGrid";

export default function SystemDesignPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Design Curriculum</h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Explore 55 topics across 4 tiers with detailed explanations and interview questions
        </p>
      </div>
      <CurriculumGrid />
    </div>
  );
}
