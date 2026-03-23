"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { BusinessComingSoon } from "@/components/business/BusinessComingSoon";

export default function BusinessCatchAllPage() {
  const params = useParams();
  const slug = params.slug;
  const pathSegment = useMemo(() => {
    if (Array.isArray(slug)) return `/${slug.join("/")}`;
    return "";
  }, [slug]);

  return <BusinessComingSoon pathSegment={`/business${pathSegment}`} />;
}
