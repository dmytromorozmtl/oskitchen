import type * as React from "react";

import {
  wizardStepActionsClass,
  wizardStepChoiceGridClass,
  wizardStepChoiceListClass,
  wizardStepFieldClass,
  wizardStepFieldGridClass,
  wizardStepFormClass,
  wizardStepHeadingClass,
  wizardStepIntroClass,
  wizardStepProgressBlockClass,
  wizardStepRootClass,
  wizardStepSectionClass,
} from "@/lib/design/form-patterns-wizard-steps";
import { cn } from "@/lib/utils";

export function WizardStepRoot({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn(wizardStepRootClass, className)} {...props} />;
}

export function WizardStepIntro({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn(wizardStepIntroClass, className)} {...props} />;
}

export function WizardStepProgressHeader({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn(wizardStepProgressBlockClass, className)} {...props} />;
}

export function WizardStepSection({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"section">) {
  return <section className={cn(wizardStepSectionClass, className)} {...props} />;
}

export function WizardStepHeading({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"h2">) {
  return <h2 className={cn(wizardStepHeadingClass, className)} {...props} />;
}

export function WizardStepForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  return <form className={cn(wizardStepFormClass, className)} {...props} />;
}

export function WizardStepField({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn(wizardStepFieldClass, className)} {...props} />;
}

export function WizardStepFieldGrid({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn(wizardStepFieldGridClass, className)} {...props} />;
}

export function WizardStepChoiceGrid({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn(wizardStepChoiceGridClass, className)} {...props} />;
}

export function WizardStepChoiceList({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn(wizardStepChoiceListClass, className)} {...props} />;
}

export function WizardStepActions({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn(wizardStepActionsClass, className)} {...props} />;
}
