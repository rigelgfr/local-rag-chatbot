import { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";

type PageSectionProps = {
  title: string;
  desc: string;
  children?: ReactNode;
};

export default function AdminPageSection({
  title,
  desc,
  children,
}: PageSectionProps) {
  return (
    <div className="flex flex-col gap-2 mt-4 h-full">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm">{desc}</p>
      <Separator className="my-2" />
      {children}
    </div>
  );
}
