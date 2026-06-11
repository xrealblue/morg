import Image from "next/image";
import { Github, Star, GitFork } from "lucide-react";

interface Props {
  name: string;
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  defaultBranch: string;
  ownerAvatar: string;
}

export default function RepoHeader({
  name,
  fullName,
  description,
  stars,
  forks,
  language,
  defaultBranch,
  ownerAvatar,
}: Props) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {ownerAvatar && (
            <Image
              src={ownerAvatar}
              alt={fullName.split("/")[0] ?? ""}
              width={40}
              height={40}
              className="rounded-full"
            />
          )}
          <div>
            <div className="flex items-center gap-2">
              <Github className="h-5 w-5 text-zinc-500" />
              <h1 className="text-xl font-bold text-zinc-900">{fullName}</h1>
            </div>
            {description && (
              <p className="mt-1 text-sm text-zinc-500">{description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-500">
        {language && (
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-blue-400" />
            {language}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Star className="h-4 w-4" />
          {stars.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <GitFork className="h-4 w-4" />
          {forks.toLocaleString()}
        </span>
        <span className="text-zinc-400">
          <strong className="text-zinc-600">{defaultBranch}</strong> branch
        </span>
      </div>
    </div>
  );
}
