import { CurriculumList } from "@/components/system-design/CurriculumList";

export default function SystemDesignPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--foreground)]">System Design Curriculum</h1>
        <p className="text-sm text-[var(--muted)]">
          55 topics covering fundamentals → microservices → advanced systems → Spring AI
        </p>
      </div>
      <CurriculumList />
    </div>
  );
}
