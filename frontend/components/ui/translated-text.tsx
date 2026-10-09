"use client";

import { useTranslation } from "@/lib/i18n";
import React from "react";

interface TranslatedTextProps {
  textKey: string;
  className?: string;
  as?: React.ElementType;
}

export function TranslatedText({ textKey, className, as: Component = "span" }: TranslatedTextProps) {
  const { t } = useTranslation();
  
  return (
    <Component className={className}>
      {t(textKey)}
    </Component>
  );
}
