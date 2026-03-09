import { notFound } from "next/navigation";
import { curriculum, getCurriculumBySlug } from "@/data/curriculum";
import { LectureView } from "@/components/system-design/LectureView";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return curriculum.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const topic = getCurriculumBySlug(slug);
  if (!topic) return {};
  return {
    title: `${topic.title} | Spring Daily Learner`,
    description: topic.overview,
  };
}

export default async function LecturePage({ params }: Props) {
  const { slug } = await params;
  const topic = getCurriculumBySlug(slug);
  if (!topic) notFound();

  const idx = curriculum.findIndex((t) => t.slug === slug);
  const prevTopic = idx > 0 ? curriculum[idx - 1] : null;
  const nextTopic = idx < curriculum.length - 1 ? curriculum[idx + 1] : null;

  return <LectureView topic={topic} prevTopic={prevTopic} nextTopic={nextTopic} />;
}
